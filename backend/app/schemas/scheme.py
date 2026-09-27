from pydantic import BaseModel, Field, field_serializer
from typing import Optional, List, Union
from uuid import UUID
from datetime import datetime


class SchemeCreate(BaseModel):
    name: str = Field(..., max_length=255)
    scheme_type: str
    description: str
    min_income: Optional[float] = None
    max_income: Optional[float] = None
    min_loan: float = 0
    max_loan: float
    interest_rate: float
    interest_rate_max: Optional[float] = None
    max_tenure: int
    moratorium: int = 0
    eligible_purposes: List[str] = []
    eligible_categories: List[str] = []
    min_age: Optional[int] = None
    max_age: Optional[int] = None
    min_education: Optional[str] = None
    required_documents: List[str] = []
    subsidy_info: Optional[str] = None
    partner_types: List[str] = []
    source_url: Optional[str] = None
    data_status: str = "DEMO"


class SchemeResponse(BaseModel):
    id: Union[str, UUID]
    name: str
    scheme_type: str
    description: str
    min_income: Optional[float] = None
    max_income: Optional[float] = None
    min_loan: float
    max_loan: float
    interest_rate: float
    interest_rate_max: Optional[float] = None
    max_tenure: int
    moratorium: int
    eligible_purposes: List[str]
    eligible_categories: List[str]
    min_age: Optional[int] = None
    max_age: Optional[int] = None
    min_education: Optional[str] = None
    required_documents: List[str]
    subsidy_info: Optional[str] = None
    partner_types: List[str]
    source_url: Optional[str] = None
    last_verified: Optional[datetime] = None
    data_status: str
    active: bool
    created_at: datetime

    @field_serializer("id")
    def serialize_id(self, v: Union[str, UUID]) -> str:
        return str(v)

    class Config:
        from_attributes = True


class SchemeUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    min_income: Optional[float] = None
    max_income: Optional[float] = None
    min_loan: Optional[float] = None
    max_loan: Optional[float] = None
    interest_rate: Optional[float] = None
    interest_rate_max: Optional[float] = None
    max_tenure: Optional[int] = None
    moratorium: Optional[int] = None
    eligible_purposes: Optional[List[str]] = None
    eligible_categories: Optional[List[str]] = None
    min_age: Optional[int] = None
    max_age: Optional[int] = None
    min_education: Optional[str] = None
    required_documents: Optional[List[str]] = None
    subsidy_info: Optional[str] = None
    partner_types: Optional[List[str]] = None
    source_url: Optional[str] = None
    data_status: Optional[str] = None
    active: Optional[bool] = None
