import asyncio
import re
import copy
import uuid
import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from bson import ObjectId
from app.core.config import settings

logger = logging.getLogger("uvicorn.error")

class MockCursor:
    def __init__(self, items: List[Dict[str, Any]]):
        self._items = copy.deepcopy(items)
        self._index = 0

    def sort(self, key_or_list, direction=1):
        if isinstance(key_or_list, list):
            for k, d in reversed(key_or_list):
                self._items.sort(key=lambda x: (x.get(k) is None, x.get(k)), reverse=(d == -1))
        elif isinstance(key_or_list, str):
            self._items.sort(key=lambda x: (x.get(key_or_list) is None, x.get(key_or_list)), reverse=(direction == -1))
        return self

    def skip(self, n: int):
        self._items = self._items[n:]
        return self

    def limit(self, n: int):
        if n > 0:
            self._items = self._items[:n]
        return self

    async def to_list(self, length: Optional[int] = None):
        if length is not None:
            return self._items[:length]
        return self._items

    def __aiter__(self):
        self._index = 0
        return self

    async def __anext__(self):
        if self._index < len(self._items):
            item = self._items[self._index]
            self._index += 1
            return item
        raise StopAsyncIteration

class MockInsertOneResult:
    def __init__(self, inserted_id):
        self.inserted_id = inserted_id

class MockInsertManyResult:
    def __init__(self, inserted_ids):
        self.inserted_ids = inserted_ids

class MockUpdateResult:
    def __init__(self, matched_count: int, modified_count: int, upserted_id=None):
        self.matched_count = matched_count
        self.modified_count = modified_count
        self.upserted_id = upserted_id

class MockDeleteResult:
    def __init__(self, deleted_count: int):
        self.deleted_count = deleted_count

def _matches_filter(doc: Dict[str, Any], query: Dict[str, Any]) -> bool:
    if not query:
        return True

    for key, condition in query.items():
        if key == "$or":
            if not any(_matches_filter(doc, sub) for sub in condition):
                return False
            continue
        if key == "$and":
            if not all(_matches_filter(doc, sub) for sub in condition):
                return False
            continue

        val = _get_nested(doc, key)

        if isinstance(condition, dict):
            for op, op_val in condition.items():
                if op == "$eq" and val != op_val and str(val) != str(op_val):
                    return False
                elif op == "$ne" and (val == op_val or str(val) == str(op_val)):
                    return False
                elif op == "$gt" and (val is None or not (val > op_val)):
                    return False
                elif op == "$gte" and (val is None or not (val >= op_val)):
                    return False
                elif op == "$lt" and (val is None or not (val < op_val)):
                    return False
                elif op == "$lte" and (val is None or not (val <= op_val)):
                    return False
                elif op == "$in":
                    str_op_val = [str(x) for x in op_val]
                    if isinstance(val, list):
                        if not any(x in op_val or str(x) in str_op_val for x in val):
                            return False
                    else:
                        if val not in op_val and str(val) not in str_op_val:
                            return False
                elif op == "$nin":
                    str_op_val = [str(x) for x in op_val]
                    if val in op_val or str(val) in str_op_val:
                        return False
                elif op == "$regex":
                    if not isinstance(val, str) or not re.search(op_val, val, re.IGNORECASE):
                        return False
        else:
            # direct equality, allow ObjectId / string equivalence
            if val != condition and str(val) != str(condition):
                return False

    return True

def _get_nested(doc: Dict[str, Any], key: str) -> Any:
    parts = key.split(".")
    curr = doc
    for p in parts:
        if isinstance(curr, dict):
            curr = curr.get(p)
        else:
            return None
    return curr

def _set_nested(doc: Dict[str, Any], key: str, value: Any):
    parts = key.split(".")
    curr = doc
    for p in parts[:-1]:
        if p not in curr or not isinstance(curr[p], dict):
            curr[p] = {}
        curr = curr[p]
    curr[parts[-1]] = value

class MockCollection:
    def __init__(self, name: str):
        self.name = name
        self._docs: List[Dict[str, Any]] = []

    async def create_index(self, keys, **kwargs):
        return str(keys)

    async def find_one(self, filter: Optional[Dict[str, Any]] = None, projection: Optional[Dict[str, Any]] = None) -> Optional[Dict[str, Any]]:
        filter = filter or {}
        for d in self._docs:
            if _matches_filter(d, filter):
                res = copy.deepcopy(d)
                return self._apply_projection(res, projection)
        return None

    def find(self, filter: Optional[Dict[str, Any]] = None, projection: Optional[Dict[str, Any]] = None) -> MockCursor:
        filter = filter or {}
        matching = []
        for d in self._docs:
            if _matches_filter(d, filter):
                res = copy.deepcopy(d)
                matching.append(self._apply_projection(res, projection))
        return MockCursor(matching)

    async def insert_one(self, document: Dict[str, Any]) -> MockInsertOneResult:
        doc = copy.deepcopy(document)
        if "_id" not in doc:
            doc["_id"] = ObjectId()
        self._docs.append(doc)
        return MockInsertOneResult(doc["_id"])

    async def insert_many(self, documents: List[Dict[str, Any]]) -> MockInsertManyResult:
        ids = []
        for d in documents:
            doc = copy.deepcopy(d)
            if "_id" not in doc:
                doc["_id"] = ObjectId()
            self._docs.append(doc)
            ids.append(doc["_id"])
        return MockInsertManyResult(ids)

    async def update_one(self, filter: Dict[str, Any], update: Dict[str, Any], upsert: bool = False) -> MockUpdateResult:
        for idx, d in enumerate(self._docs):
            if _matches_filter(d, filter):
                self._apply_update(d, update)
                return MockUpdateResult(1, 1)
        if upsert:
            new_doc = copy.deepcopy(filter)
            if "_id" not in new_doc:
                new_doc["_id"] = ObjectId()
            self._apply_update(new_doc, update)
            self._docs.append(new_doc)
            return MockUpdateResult(0, 0, new_doc["_id"])
        return MockUpdateResult(0, 0)

    async def update_many(self, filter: Dict[str, Any], update: Dict[str, Any]) -> MockUpdateResult:
        matched = 0
        for d in self._docs:
            if _matches_filter(d, filter):
                self._apply_update(d, update)
                matched += 1
        return MockUpdateResult(matched, matched)

    async def delete_one(self, filter: Dict[str, Any]) -> MockDeleteResult:
        for idx, d in enumerate(self._docs):
            if _matches_filter(d, filter):
                self._docs.pop(idx)
                return MockDeleteResult(1)
        return MockDeleteResult(0)

    async def delete_many(self, filter: Dict[str, Any]) -> MockDeleteResult:
        initial = len(self._docs)
        self._docs = [d for d in self._docs if not _matches_filter(d, filter)]
        return MockDeleteResult(initial - len(self._docs))

    async def count_documents(self, filter: Optional[Dict[str, Any]] = None) -> int:
        filter = filter or {}
        return sum(1 for d in self._docs if _matches_filter(d, filter))

    async def estimated_document_count(self) -> int:
        return len(self._docs)

    def aggregate(self, pipeline: List[Dict[str, Any]]) -> MockCursor:
        # Simple aggregate implementation for category counts and group stats
        res = copy.deepcopy(self._docs)
        for stage in pipeline:
            if "$match" in stage:
                res = [d for d in res if _matches_filter(d, stage["$match"])]
            elif "$group" in stage:
                group_spec = stage["$group"]
                group_id_key = group_spec["_id"]
                grouped = {}
                for d in res:
                    g_val = d.get(group_id_key.replace("$", "")) if isinstance(group_id_key, str) and group_id_key.startswith("$") else None
                    if g_val not in grouped:
                        grouped[g_val] = {"_id": g_val, "count": 0}
                    if "count" in group_spec and group_spec["count"] == {"$sum": 1}:
                        grouped[g_val]["count"] += 1
                res = list(grouped.values())
            elif "$sort" in stage:
                sort_spec = stage["$sort"]
                for k, d in reversed(list(sort_spec.items())):
                    res.sort(key=lambda x: x.get(k, 0), reverse=(d == -1))
        return MockCursor(res)

    def _apply_update(self, doc: Dict[str, Any], update: Dict[str, Any]):
        if "$set" in update:
            for k, v in update["$set"].items():
                _set_nested(doc, k, v)
        if "$unset" in update:
            for k in update["$unset"]:
                doc.pop(k, None)
        if "$inc" in update:
            for k, v in update["$inc"].items():
                doc[k] = doc.get(k, 0) + v
        if "$push" in update:
            for k, v in update["$push"].items():
                if k not in doc or not isinstance(doc[k], list):
                    doc[k] = []
                doc[k].append(v)
        if not any(k.startswith("$") for k in update.keys()):
            # replacement
            doc.clear()
            doc.update(copy.deepcopy(update))

    def _apply_projection(self, doc: Dict[str, Any], projection: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        if not projection:
            return doc
        has_inclusion = any(v == 1 for k, v in projection.items() if k != "_id")
        if has_inclusion:
            res = {}
            if projection.get("_id", 1) != 0:
                res["_id"] = doc.get("_id")
            for k, v in projection.items():
                if v == 1 and k in doc:
                    res[k] = doc[k]
            return res
        else:
            res = copy.deepcopy(doc)
            for k, v in projection.items():
                if v == 0:
                    res.pop(k, None)
            return res

class MockMotorDB:
    def __init__(self, name: str):
        self.name = name
        self._collections: Dict[str, MockCollection] = {}

    def __getitem__(self, name: str) -> MockCollection:
        if name not in self._collections:
            self._collections[name] = MockCollection(name)
        return self._collections[name]

    def __getattr__(self, name: str) -> MockCollection:
        return self[name]

    def get_collection(self, name: str) -> MockCollection:
        return self[name]

def serialize_doc(doc: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    if not doc:
        return None
    d = copy.deepcopy(doc)
    if "_id" in d:
        d["id"] = str(d.pop("_id"))
    return d

def serialize_docs(docs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    return [serialize_doc(d) for d in docs if d is not None]

class DatabaseManager:
    client: Optional[AsyncIOMotorClient] = None
    db: Optional[Any] = None
    is_mock: bool = False

db_manager = DatabaseManager()

async def connect_to_db():
    try:
        current_loop = asyncio.get_running_loop()
        if db_manager.client is not None:
            try:
                io_loop = db_manager.client.get_io_loop()
                if io_loop != current_loop or io_loop.is_closed():
                    try:
                        db_manager.client.close()
                    except Exception:
                        pass
                    db_manager.client = None
                    db_manager.db = None
            except Exception:
                db_manager.client = None
                db_manager.db = None
    except Exception:
        pass

    if db_manager.db is not None:
        return

    client = None
    try:
        logger.info(f"Connecting to MongoDB at {settings.MONGODB_URI}...")
        client = AsyncIOMotorClient(
            settings.MONGODB_URI,
            serverSelectionTimeoutMS=1000
        )
        # Attempt ping
        await client.admin.command('ping')
        db_manager.client = client
        db_manager.db = client[settings.MONGODB_DB]
        db_manager.is_mock = False
        logger.info(f"Successfully connected to MongoDB ({settings.MONGODB_DB})")
        return
    except Exception as e:
        if client:
            client.close()
        if settings.USE_IN_MEMORY_DB_FALLBACK:
            logger.warning(f"Could not connect to external MongoDB: {e}")
            logger.info("Initializing high-performance In-Memory Document DB fallback for demo platform...")
            db_manager.client = None
            db_manager.db = MockMotorDB(settings.MONGODB_DB)
            db_manager.is_mock = True
        else:
            raise e

async def close_db_connection():
    if db_manager.client:
        db_manager.client.close()
        logger.info("MongoDB connection closed.")

def get_database():
    return db_manager.db
