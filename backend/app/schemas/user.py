from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    email: str = Field(..., max_length=255)
    password: str = Field(..., min_length=6)
    mobile: Optional[str] = None
    language: Optional[str] = "en"


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    mobile: Optional[str] = None
    language: str
    role: str
    location: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class ProfileUpdate(BaseModel):
    annual_income: Optional[float] = None
    category: Optional[str] = None
    age: Optional[int] = None
    occupation: Optional[str] = None
    education_status: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None


class UserAdminCreate(BaseModel):
    name: str
    email: str
    password: str = "password123"
    role: str = "BENEFICIARY"
    mobile: Optional[str] = None
    language: Optional[str] = "en"


class UserAdminUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    mobile: Optional[str] = None
    language: Optional[str] = None
