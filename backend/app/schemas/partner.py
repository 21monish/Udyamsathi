from pydantic import BaseModel, Field
from typing import Optional, List


class PartnerCreate(BaseModel):
    name: str = Field(..., max_length=255)
    type: str  # SCA, PSB, RRB, NBFC_MFI
    address: str
    state: str
    district: str
    pincode: str
    latitude: float
    longitude: float
    supported_schemes: List[str] = []
    capacity_status: str = "AVAILABLE"
    phone: Optional[str] = None
    email: Optional[str] = None


class PartnerResponse(BaseModel):
    id: str
    name: str
    type: str
    address: str
    state: str
    district: str
    pincode: str
    latitude: float
    longitude: float
    supported_schemes: List[str]
    active: bool
    capacity_status: str
    phone: Optional[str] = None
    email: Optional[str] = None
    distance: Optional[float] = None  # Calculated field — distance in km

    class Config:
        from_attributes = True


class PartnerSearchQuery(BaseModel):
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    radius_km: float = 50.0
    partner_type: Optional[str] = None
    scheme_name: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
