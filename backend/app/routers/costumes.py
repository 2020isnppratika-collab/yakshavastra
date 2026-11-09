import math
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from bson import ObjectId
from app.core.deps import get_db
from app.db.mongo import serialize_doc, serialize_docs
from app.services.availability import (
    check_costume_availability,
    get_monthly_availability
)
from app.schemas.costume import CostumeResponse, AvailabilityCalendarResponse

router = APIRouter(tags=["Costumes & Catalogue"])

@router.get("/costumes")
async def list_costumes(
    q: Optional[str] = None,
    category: Optional[str] = None,
    character_type: Optional[str] = None,
    size: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    rental_mode: Optional[str] = None,
    available_from: Optional[str] = None,
    available_to: Optional[str] = None,
    slot: Optional[str] = "full_day",
    sort: Optional[str] = "popular",
    page: int = Query(1, ge=1),
    limit: int = Query(24, ge=1, le=100),
    db = Depends(get_db)
):
    query: Dict[str, Any] = {"is_active": True}

    if category and category != "all":
        query["category"] = category

    if character_type and character_type != "all":
        query["character_type"] = character_type

    if size and size != "all":
        query["sizes"] = {"$in": [size, "Free"]}

    if min_price is not None or max_price is not None:
        price_filter = {}
        if min_price is not None:
            price_filter["$gte"] = min_price
        if max_price is not None:
            price_filter["$lte"] = max_price
        query["price_per_day"] = price_filter

    if rental_mode and rental_mode != "all":
        query["$or"] = [{"rental_mode": rental_mode}, {"rental_mode": "both"}]

    if q and q.strip():
        search_term = q.strip()
        query["$or"] = [
            {"name": {"$regex": search_term}},
            {"kannada_name": {"$regex": search_term}},
            {"description": {"$regex": search_term}},
            {"tags": {"$in": [search_term.lower()]}}
        ]

    # Fetch initial list
    all_matching = await db.costumes.find(query).to_list(1000)

    # If availability dates provided, filter out unavailable costumes
    if available_from and available_to:
        filtered = []
        for c in all_matching:
            c_id = str(c.get("_id"))
            avail = await check_costume_availability(
                db,
                costume_id=c_id,
                start_at_str=available_from,
                end_at_str=available_to,
                slot=slot or "full_day",
                requested_quantity=1
            )
            if avail.get("is_available", False):
                c["available_units"] = avail.get("available_units", 1)
                filtered.append(c)
        all_matching = filtered
    else:
        for c in all_matching:
            c["available_units"] = c.get("total_units", 1)

    # Sorting
    if sort == "price_asc":
        all_matching.sort(key=lambda x: x.get("price_per_day", 0))
    elif sort == "price_desc":
        all_matching.sort(key=lambda x: x.get("price_per_day", 0), reverse=True)
    elif sort == "name_asc":
        all_matching.sort(key=lambda x: x.get("name", "").lower())
    else:  # popular / default
        all_matching.sort(key=lambda x: (x.get("category") == "full_set", x.get("price_per_day", 0)), reverse=True)

    total_count = len(all_matching)
    total_pages = math.ceil(total_count / limit) if total_count > 0 else 1
    start_idx = (page - 1) * limit
    paginated = all_matching[start_idx : start_idx + limit]

    paginated_serialized = serialize_docs(paginated)

    return {
        "items": paginated_serialized,
        "total": total_count,
        "page": page,
        "limit": limit,
        "total_pages": total_pages
    }

@router.get("/costumes/{id}")
async def get_costume(id: str, db = Depends(get_db)):
    costume = await db.costumes.find_one({"_id": ObjectId(id) if ObjectId.is_valid(id) else id})
    if not costume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Costume not found")
    return serialize_doc(costume)

@router.get("/costumes/{id}/availability")
async def get_availability(
    id: str,
    year: Optional[int] = None,
    month: Optional[int] = None,
    start: Optional[str] = None,
    end: Optional[str] = None,
    slot: Optional[str] = "full_day",
    quantity: int = 1,
    db = Depends(get_db)
):
    costume = await db.costumes.find_one({"_id": ObjectId(id) if ObjectId.is_valid(id) else id})
    if not costume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Costume not found")

    # If specific date range queried
    if start and end:
        res = await check_costume_availability(
            db,
            costume_id=id,
            start_at_str=start,
            end_at_str=end,
            slot=slot or "full_day",
            requested_quantity=quantity
        )
        return {
            "costume_id": id,
            "start": start,
            "end": end,
            "slot": slot,
            "is_available": res["is_available"],
            "available_units": res["available_units"],
            "total_units": res["total_units"],
            "buffer_days": res["buffer_days"]
        }

    # Otherwise return monthly availability calendar
    now = datetime.now(timezone.utc)
    target_year = year or now.year
    target_month = month or now.month

    calendar_data = await get_monthly_availability(db, id, target_year, target_month)
    return calendar_data

@router.get("/categories")
async def get_categories(db = Depends(get_db)):
    all_costumes = await db.costumes.find({"is_active": True}).to_list(1000)
    category_counts: Dict[str, int] = {}
    character_counts: Dict[str, int] = {}

    for c in all_costumes:
        cat = c.get("category", "other")
        char = c.get("character_type", "general")
        category_counts[cat] = category_counts.get(cat, 0) + 1
        character_counts[char] = character_counts.get(char, 0) + 1

    category_metadata = [
        {"id": "all", "label": "All Costumes", "kannada": "ಎಲ್ಲಾ ವೇಷಗಳು", "count": len(all_costumes)},
        {"id": "full_set", "label": "Full Sets (ಸಂಪೂರ್ಣ ವೇಷ)", "kannada": "ಸಂಪೂರ್ಣ ವೇಷ", "count": category_counts.get("full_set", 0), "icon": "Crown"},
        {"id": "crown", "label": "Kireeta & Crowns", "kannada": "ಕಿರೀಟ / ಮುಂಡಾಸು", "count": category_counts.get("crown", 0), "icon": "Sparkles"},
        {"id": "ornament", "label": "Bhujakeerthi & Ornaments", "kannada": "ಭುಜಕೀರ್ತಿ / ಆಭರಣಗಳು", "count": category_counts.get("ornament", 0), "icon": "Shield"},
        {"id": "garment", "label": "Pleated Skirts & Dhotis", "kannada": "ಕಚ್ಚೆ ಲಂಗ / ವಸ್ತ್ರಗಳು", "count": category_counts.get("garment", 0), "icon": "Layers"},
        {"id": "weapon", "label": "Weapons & Stage Props", "kannada": "ಆಯುಧಗಳು / ಪರಿಕರಗಳು", "count": category_counts.get("weapon", 0), "icon": "Sword"},
        {"id": "accessory", "label": "Bells & Makeup Accessories", "kannada": "ಗಗ್ಗರ / ಮುಖವರ್ಣಿಕೆ", "count": category_counts.get("accessory", 0), "icon": "Bell"}
    ]

    character_metadata = [
        {"id": "all", "label": "All Characters", "kannada": "ಎಲ್ಲಾ ಪಾತ್ರಗಳು", "count": len(all_costumes)},
        {"id": "raja", "label": "Raja Vesha (King/Hero)", "kannada": "ರಾಜ ವೇಷ", "count": character_counts.get("raja", 0)},
        {"id": "rakshasa", "label": "Rakshasa (Demon)", "kannada": "ರಾಕ್ಷಸ ವೇಷ", "count": character_counts.get("rakshasa", 0)},
        {"id": "stree", "label": "Stree Vesha (Female Roles)", "kannada": "ಸ್ತ್ರೀ ವೇಷ", "count": character_counts.get("stree", 0)},
        {"id": "hanuman", "label": "Hanuman / Vanara", "kannada": "ವೀರಾಂಜನೇಯ", "count": character_counts.get("hanuman", 0)},
        {"id": "rishi", "label": "Rishi / Muni (Sage)", "kannada": "ಋಷಿ / ಮುನಿ", "count": character_counts.get("rishi", 0)},
        {"id": "bannada", "label": "Bannada Vesha (Fierce Painted)", "kannada": "ಬಣ್ಣದ ವೇಷ", "count": character_counts.get("bannada", 0)},
        {"id": "comic", "label": "Vidushaka / Comic", "kannada": "ವಿದೂಷಕ ಹಾಸ್ಯ", "count": character_counts.get("comic", 0)}
    ]

    return {
        "categories": category_metadata,
        "character_types": character_metadata,
        "total_costumes": len(all_costumes)
    }
