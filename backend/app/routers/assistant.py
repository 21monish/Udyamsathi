from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Dict, Any
from app.database import get_db
from app.models.scheme import Scheme
from app.schemas.eligibility import EligibilityInput, EligibilityResponse
from app.services.eligibility_engine import assess_schemes
from app.services.ai_assistant import extract_intent_with_gemini, explain_results_with_gemini

router = APIRouter(prefix="/assistant", tags=["AI Assistant"])


class ChatRequest(BaseModel):
    message: str
    preferred_language: Optional[str] = "en"


class ChatResponse(BaseModel):
    reply: str
    extracted_parameters: Dict[str, Any]
    assessment: EligibilityResponse


@router.post("/chat", response_model=ChatResponse)
def chat_with_assistant(
    request: ChatRequest,
    db: Session = Depends(get_db),
):
    """
    Multilingual conversational AI endpoint:
    1. Extracts structured parameters with Gemini.
    2. Runs deterministic eligibility engine against verified schemes.
    3. Explains verified recommendations in the user's language.
    """
    # 1. Extract Intent
    extracted = extract_intent_with_gemini(request.message)
    if request.preferred_language and "language" not in extracted:
        extracted["language"] = request.preferred_language

    # 2. Formulate Eligibility Input
    user_input = EligibilityInput(
        purpose=extracted.get("purpose", "business"),
        annual_income=float(extracted.get("annual_income", 300000)),
        loan_amount=float(extracted.get("loan_amount", 200000)),
        age=int(extracted.get("age", 30)),
        category=extracted.get("category", "SC"),
        education_status=extracted.get("education_status", "12th_standard"),
        state=extracted.get("state", "Gujarat"),
        district=extracted.get("district", "Ahmedabad"),
    )

    # 3. Deterministic Assessment
    schemes = db.query(Scheme).filter(Scheme.active == True).all()
    assessment = assess_schemes(schemes, user_input)

    # 4. Natural Multilingual Explanation
    explanation = explain_results_with_gemini(request.message, extracted, assessment)

    return ChatResponse(
        reply=explanation,
        extracted_parameters=extracted,
        assessment=assessment,
    )
