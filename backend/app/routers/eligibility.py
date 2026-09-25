from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.scheme import Scheme
from app.schemas.eligibility import EligibilityInput, EligibilityResponse
from app.services.eligibility_engine import assess_schemes

router = APIRouter(prefix="/eligibility", tags=["Eligibility Assessment"])


@router.post("/assess", response_model=EligibilityResponse)
def assess_eligibility(
    user_input: EligibilityInput,
    db: Session = Depends(get_db),
):
    """
    Evaluates applicant profile deterministically against all active schemes.
    Returns:
    - eligible_schemes: passed all hard rules with explainable fit factors.
    - ineligible_schemes: list of schemes with exact reasons why applicant did not qualify.
    """
    schemes = db.query(Scheme).filter(Scheme.active == True).all()
    if not schemes:
        raise HTTPException(status_code=404, detail="No active schemes found in database.")

    response = assess_schemes(schemes, user_input)
    return response
