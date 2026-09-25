from fastapi import APIRouter
from app.schemas.calculator import EMIInput, EMIResponse
from app.services.emi_calculator import calculate_emi

router = APIRouter(prefix="/calculator", tags=["Financial Calculator"])


@router.post("/emi", response_model=EMIResponse)
def compute_emi(data: EMIInput):
    """
    Calculate monthly EMI, interest total, total repayment,
    and returns complete amortization schedule.
    """
    return calculate_emi(data)
