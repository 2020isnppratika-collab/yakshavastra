from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.deps import get_db, get_current_user
from app.db.mongo import serialize_doc
from app.core.security import hash_password, verify_password, create_access_token
from app.schemas.auth import UserRegister, UserLogin, UserResponse, TokenResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
async def register(req: UserRegister, db = Depends(get_db)):
    existing = await db.users.find_one({"email": req.email.lower().strip()})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    now = datetime.now(timezone.utc)
    user_doc = {
        "name": req.name.strip(),
        "email": req.email.lower().strip(),
        "phone": req.phone.strip(),
        "password_hash": hash_password(req.password),
        "role": "customer",
        "address": req.address.model_dump() if req.address else {"line1": "", "city": "Udupi", "state": "Karnataka", "pincode": ""},
        "created_at": now
    }

    res = await db.users.insert_one(user_doc)
    user_id = str(res.inserted_id)

    access_token = create_access_token(subject=user_id, role="customer")
    clean_user = serialize_doc(user_doc)
    clean_user.pop("password_hash", None)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": clean_user
    }

@router.post("/login", response_model=TokenResponse)
async def login(req: UserLogin, db = Depends(get_db)):
    user = await db.users.find_one({"email": req.email.lower().strip()})
    if not user or not verify_password(req.password, user.get("password_hash", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    user_id = str(user.get("_id"))
    access_token = create_access_token(subject=user_id, role=user.get("role", "customer"))
    clean_user = serialize_doc(user)
    clean_user.pop("password_hash", None)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": clean_user
    }

@router.get("/me", response_model=UserResponse)
async def get_me(current_user = Depends(get_current_user)):
    clean_user = serialize_doc(current_user)
    clean_user.pop("password_hash", None)
    return clean_user
