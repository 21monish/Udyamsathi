from pydantic import BaseModel, EmailStr, Field, field_serializer
from typing import Optional, Union
from uuid import UUID
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
    id: Union[str, UUID]
    name: str
    email: str
    mobile: Optional[str] = None
    language: str
    role: str
    location: Optional[str] = None
    is_active: bool = True
    created_at: datetime

    @field_serializer("id")
    def serialize_id(self, v: Union[str, UUID]) -> str:
        return str(v)

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class ProfileUpdate(BaseModel):
    annual_income: Optional[float] = None
    category: Optional[str] = None
    gender: Optional[str] = None
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
    is_active: Optional[bool] = True


class UserAdminUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    mobile: Optional[str] = None
    language: Optional[str] = None
    is_active: Optional[bool] = None
