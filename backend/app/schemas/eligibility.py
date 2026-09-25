from pydantic import BaseModel, Field
from typing import Optional, List


class EligibilityInput(BaseModel):
    """Input data for eligibility check."""
    purpose: str = Field(..., description="Purpose of the loan: business, education, self_employment, micro_enterprise, other")
    annual_income: float = Field(..., ge=0, description="Annual family income in INR")
    loan_amount: float = Field(..., gt=0, description="Requested loan amount in INR")
    age: int = Field(..., ge=18, le=100, description="Applicant age")
    category: str = Field(..., description="Social category: SC, ST, OBC, GENERAL")
    education_status: str = Field(default="none", description="Education level")
    state: str = Field(default="", description="State of residence")
    district: str = Field(default="", description="District of residence")


class EligibilityCheck(BaseModel):
    """Result of a single eligibility criterion check."""
    criterion: str
    passed: bool
    detail: str


class SchemeRecommendation(BaseModel):
    """Recommendation result for a single scheme."""
    scheme_id: str
    scheme_name: str
    scheme_type: str
    eligible: bool
    checks: List[EligibilityCheck]
    passed_count: int
    total_checks: int
    max_loan: float
    interest_rate: float
    interest_rate_max: Optional[float] = None
    max_tenure: int
    description: str
    required_documents: List[str]
    subsidy_info: Optional[str] = None
    source_url: Optional[str] = None
    data_status: str


class EligibilityResponse(BaseModel):
    """Full eligibility check response."""
    input_summary: EligibilityInput
    eligible_schemes: List[SchemeRecommendation]
    ineligible_schemes: List[SchemeRecommendation]
    total_schemes_checked: int
