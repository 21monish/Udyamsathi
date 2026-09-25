from pydantic import BaseModel, Field
from typing import Optional, List


class EMIInput(BaseModel):
    """Input for EMI calculation."""
    principal: float = Field(..., gt=0, description="Loan amount in INR")
    annual_interest_rate: float = Field(..., ge=0, le=50, description="Annual interest rate percentage")
    tenure_months: int = Field(..., gt=0, le=360, description="Loan tenure in months")
    moratorium_months: int = Field(default=0, ge=0, le=36, description="Moratorium period in months")


class AmortizationEntry(BaseModel):
    """Single month in amortization schedule."""
    month: int
    emi: float
    principal: float
    interest: float
    balance: float


class EMIResponse(BaseModel):
    """EMI calculation response."""
    emi: float
    total_interest: float
    total_payment: float
    effective_tenure: int  # tenure - moratorium
    amortization_schedule: List[AmortizationEntry]
