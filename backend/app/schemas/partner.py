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
    npa_rate: Optional[float] = 3.2
    fund_utilization: Optional[float] = 85.0
    avg_processing_days: Optional[int] = 14
    working_hours: Optional[str] = "Mon-Fri 09:30 - 17:30"


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
    npa_rate: Optional[float] = 3.2
    fund_utilization: Optional[float] = 85.0
    avg_processing_days: Optional[int] = 14
    health_score: Optional[float] = 88.0
    is_npa_flagged: Optional[bool] = False
    working_hours: Optional[str] = "Mon-Fri 09:30 - 17:30"

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
    exclude_high_npa: Optional[bool] = False


class PartnerUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    address: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    pincode: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    supported_schemes: Optional[List[str]] = None
    capacity_status: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    active: Optional[bool] = None
    npa_rate: Optional[float] = None
    fund_utilization: Optional[float] = None
    avg_processing_days: Optional[int] = None
    working_hours: Optional[str] = None
