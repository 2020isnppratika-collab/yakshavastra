import os
from typing import List, Union
from pydantic_settings import BaseSettings
from pydantic import field_validator

class Settings(BaseSettings):
    PROJECT_NAME: str = "Yakshagana Costume Rental Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database
    MONGODB_URI: str = "mongodb://localhost:27017"
    MONGODB_DB: str = "yakshagana_rentals"
    USE_IN_MEMORY_DB_FALLBACK: bool = True
    
    # Security
    JWT_SECRET: str = "yakshagana_secret_key_demo_2026_coastal_karnataka"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 1440  # 24 hours for demo convenience
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]
    
    # Payments
    RAZORPAY_KEY_ID: str = "rzp_test_Yaksha2026Demo"
    RAZORPAY_KEY_SECRET: str = "yaksha_secret_sample_key_98765"
    RAZORPAY_WEBHOOK_SECRET: str = "yaksha_webhook_secret_12345"
    ENABLE_MOCK_PAYMENT: bool = True
    
    # Booking
    HOLD_MINUTES: int = 10
    DEFAULT_BUFFER_DAYS: int = 1
    TAX_RATE: float = 0.05  # 5% GST
    
    # Demo Seed
    ADMIN_SEED_EMAIL: str = "admin@demo.com"
    ADMIN_SEED_PASSWORD: str = "Admin@123"
    CUSTOMER_SEED_EMAIL: str = "customer@demo.com"
    CUSTOMER_SEED_PASSWORD: str = "Customer@123"

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
