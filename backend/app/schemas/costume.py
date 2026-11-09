from typing import List, Dict, Optional, Literal
from pydantic import BaseModel, Field
from datetime import datetime

RentalMode = Literal["day", "slot", "both"]
CategoryType = Literal["full_set", "crown", "ornament", "garment", "accessory", "weapon"]
CharacterType = Literal["raja", "rakshasa", "stree", "hanuman", "rishi", "bannada", "comic", "general"]

class PricePerSlot(BaseModel):
    morning: float = 700.0   # 6am - 2pm
    evening: float = 800.0   # 2pm - 10pm
    night: float = 1200.0    # 6pm - 6am (overnight)

class CostumeBase(BaseModel):
    sku: str = Field(..., min_length=2, max_length=50)
    name: str = Field(..., min_length=2, max_length=150)
    kannada_name: Optional[str] = ""
    description: str
    category: str = "full_set"
    character_type: str = "raja"
    tags: List[str] = []
    sizes: List[str] = ["Free"]
    images: List[str] = []
    price_per_day: float = Field(..., ge=0)
    price_per_slot: PricePerSlot = PricePerSlot()
    security_deposit: float = Field(..., ge=0)
    total_units: int = Field(1, ge=1)
    buffer_days: int = Field(1, ge=0)
    rental_mode: RentalMode = "both"
    is_active: bool = True
    includes: List[str] = []
    care_notes: str = "Handle delicate gold foil work with care. Dry clean only."
    troupe_grade: str = "performance"

class CostumeCreate(CostumeBase):
    pass

class CostumeUpdate(BaseModel):
    name: Optional[str] = None
    kannada_name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    character_type: Optional[str] = None
    tags: Optional[List[str]] = None
    sizes: Optional[List[str]] = None
    images: Optional[List[str]] = None
    price_per_day: Optional[float] = None
    price_per_slot: Optional[PricePerSlot] = None
    security_deposit: Optional[float] = None
    total_units: Optional[int] = None
    buffer_days: Optional[int] = None
    rental_mode: Optional[RentalMode] = None
    is_active: Optional[bool] = None
    includes: Optional[List[str]] = None
    care_notes: Optional[str] = None
    troupe_grade: Optional[str] = None

class CostumeResponse(CostumeBase):
    id: str
    created_at: Optional[datetime] = None

class CostumeFilter(BaseModel):
    q: Optional[str] = None
    category: Optional[str] = None
    character_type: Optional[str] = None
    size: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    rental_mode: Optional[str] = None
    available_from: Optional[str] = None
    available_to: Optional[str] = None
    slot: Optional[str] = None
    sort: Optional[str] = "popular"
    page: int = 1
    limit: int = 20

class SlotAvailability(BaseModel):
    slot: str
    available_units: int
    is_available: bool

class DayAvailability(BaseModel):
    date: str
    is_available: bool
    units_available: int
    total_units: int
    slots: Dict[str, SlotAvailability]

class AvailabilityCalendarResponse(BaseModel):
    costume_id: str
    month: str  # YYYY-MM
    buffer_days: int
    total_units: int
    days: List[DayAvailability]
