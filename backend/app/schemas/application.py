from pydantic import BaseModel, Field, field_serializer
from typing import Optional, Union
from uuid import UUID
from datetime import datetime


class ApplicationCreate(BaseModel):
    scheme_id: str
    partner_id: Optional[str] = None
    requested_amount: float = Field(..., gt=0)
    status: str = "DRAFT"  # DRAFT, SUBMITTED


class ApplicationUpdate(BaseModel):
    partner_id: Optional[str] = None
    requested_amount: Optional[float] = None
    status: Optional[str] = None  # DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED


class ApplicationResponse(BaseModel):
    id: Union[str, UUID]
    user_id: Union[str, UUID]
    scheme_id: Union[str, UUID]
    partner_id: Optional[Union[str, UUID]] = None
    requested_amount: float
    status: str
    created_at: datetime
    updated_at: datetime
    # Joined fields
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    scheme_name: Optional[str] = None
    partner_name: Optional[str] = None

    @field_serializer("id", "user_id", "scheme_id", "partner_id")
    def serialize_uuids(self, v: Optional[Union[str, UUID]]) -> Optional[str]:
        return str(v) if v else None

    class Config:
        from_attributes = True
