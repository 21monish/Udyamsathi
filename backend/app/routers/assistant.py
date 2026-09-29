from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from app.database import get_db
from app.models.scheme import Scheme
from app.schemas.eligibility import EligibilityInput, EligibilityResponse, SchemeRecommendation, EligibilityCheck
from app.services.eligibility_engine import assess_schemes
from app.services.ai_assistant import extract_parameters_from_message, explain_results_with_gemini

from app.models.ai_knowledge import AIKnowledgeItem

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
    Intelligent Conversational AI endpoint:
    1. Checks Admin-Trained Knowledge Base first (exact question & answer taught by admin).
    2. Analyzes user intent (greeting, FAQ, loan inquiry, or out-of-scope).
    3. Runs deterministic eligibility engine only when appropriate.
    4. Responds directly and factually to what the user actually said.
    """
    query_text = request.message.strip().lower()

    # 0. Check Admin-Trained Knowledge Base First!
    trained_items = db.query(AIKnowledgeItem).filter(AIKnowledgeItem.is_active == True).all()
    best_match = None
    best_score = 0.0

    STOPWORDS = {"what", "is", "are", "the", "a", "an", "to", "for", "in", "on", "of", "and", "do", "i", "can", "tell", "me", "about", "how", "please", "my", "give", "scheme", "schemes"}

    for item in trained_items:
        score = 0.0
        q_lower = item.question.lower()

        # Exact or substring match on question
        if query_text == q_lower:
            score += 1.0
        elif query_text in q_lower or q_lower in query_text:
            score += 0.85

        # Check keywords: each matched keyword is a strong intent trigger
        keywords = item.keywords or []
        matched_kws = [kw for kw in keywords if kw.lower() in query_text]
        if matched_kws:
            score += 0.50 + min(len(matched_kws) * 0.15, 0.40)

        # Check word intersection without stopwords
        q_words = {w.strip("?,.!'\"") for w in query_text.split() if w not in STOPWORDS}
        item_words = {w.strip("?,.!'\"") for w in q_lower.split() if w not in STOPWORDS}
        overlap = len(q_words.intersection(item_words))
        if overlap > 0 and len(q_words) > 0:
            score += (overlap / len(q_words)) * 0.45

        if score > best_score:
            best_score = score
            best_match = item

    if best_match and best_score >= 0.35:
        default_summary = EligibilityInput(
            purpose="business",
            annual_income=250000,
            loan_amount=200000,
            age=30,
            category="SC",
            gender="male",
            education_status="12th_standard",
            state="Gujarat",
            district="Ahmedabad"
        )
        return ChatResponse(
            reply=best_match.answer,
            extracted_parameters={
                "intent": "TAUGHT_QA",
                "is_loan_query": False,
                "matched_question": best_match.question,
                "category": best_match.category,
                "confidence": min(round(best_score * 100, 1), 99.9),
                "language": "en"
            },
            assessment=EligibilityResponse(
                input_summary=default_summary,
                eligible_schemes=[],
                ineligible_schemes=[],
                total_schemes_checked=0
            )
        )

    # 1. Extract Intent & Parameters
    extracted, is_loan_query = extract_parameters_from_message(request.message)
    intent = extracted.get("intent", "LOAN_INQUIRY")

    # 2. Scheme Evaluation
    all_schemes = db.query(Scheme).filter(Scheme.active == True).all()

    # Create default input summary for response schema
    user_input = EligibilityInput(
        purpose=extracted.get("purpose", "business"),
        annual_income=float(extracted.get("annual_income", 250000)),
        loan_amount=float(extracted.get("loan_amount", 200000)),
        age=int(extracted.get("age", 30)),
        category=extracted.get("category", "SC"),
        gender=extracted.get("gender", "male"),
        project_cost=float(extracted.get("loan_amount", 200000)) * 1.15,
        education_status=extracted.get("education_status", "12th_standard"),
        state=extracted.get("state", "Gujarat"),
        district=extracted.get("district", "Ahmedabad"),
    )

    if is_loan_query:
        assessment = assess_schemes(all_schemes, user_input)

        # If user asked specifically for Mahila Samriddhi or Dhibar or Education, promote that scheme to top
        if intent == "FAQ_MAHILA_SAMRIDDHI":
            msy = [s for s in assessment.eligible_schemes if "mahila" in s.scheme_name.lower()]
            others = [s for s in assessment.eligible_schemes if "mahila" not in s.scheme_name.lower()]
            assessment.eligible_schemes = msy + others
        elif intent == "FAQ_DHIBAR":
            dhibar = [s for s in assessment.eligible_schemes if "dhibar" in s.scheme_name.lower()]
            others = [s for s in assessment.eligible_schemes if "dhibar" not in s.scheme_name.lower()]
            assessment.eligible_schemes = dhibar + others
        elif intent == "FAQ_EDUCATION":
            edu = [s for s in assessment.eligible_schemes if "education" in s.scheme_name.lower()]
            others = [s for s in assessment.eligible_schemes if "education" not in s.scheme_name.lower()]
            assessment.eligible_schemes = edu + others

    elif intent in ["FAQ_MAHILA_SAMRIDDHI", "FAQ_DHIBAR", "FAQ_EDUCATION", "FAQ_VISHWAKARMA", "FAQ_MUDRA", "FAQ_GREEN_BUSINESS"]:
        # Find the specific scheme mentioned and display as informative card
        matched_records = []
        kw_map = {
            "FAQ_MAHILA_SAMRIDDHI": "mahila",
            "FAQ_DHIBAR": "dhibar",
            "FAQ_EDUCATION": "education",
            "FAQ_VISHWAKARMA": "vishwakarma",
            "FAQ_MUDRA": "mudra",
            "FAQ_GREEN_BUSINESS": "green",
        }
        kw = kw_map.get(intent, "")
        for s in all_schemes:
            if kw and kw in s.name.lower():
                matched_records.append(
                    SchemeRecommendation(
                        scheme_id=str(s.id),
                        scheme_name=s.name,
                        scheme_type=s.scheme_type,
                        eligible=True,
                        checks=[EligibilityCheck(criterion="Scheme Profile", passed=True, detail="Official statutory scheme profile")],
                        passed_count=1,
                        total_checks=1,
                        interest_rate=s.interest_rate,
                        effective_interest_rate=s.interest_rate,
                        max_loan=s.max_loan,
                        max_tenure=s.max_tenure,
                        subsidy_info=s.subsidy_info,
                        required_documents=s.required_documents or [],
                        description=s.description or "",
                        data_status="VERIFIED",
                        reasoning=["Direct statutory match for user inquiry"]
                    )
                )
        assessment = EligibilityResponse(
            input_summary=user_input,
            eligible_schemes=matched_records[:3],
            ineligible_schemes=[],
            total_schemes_checked=len(all_schemes)
        )
    else:
        # Greetings, general FAQ, out-of-scope: no fake qualification cards
        assessment = EligibilityResponse(
            input_summary=user_input,
            eligible_schemes=[],
            ineligible_schemes=[],
            total_schemes_checked=0
        )

    # 3. Generate Direct, Context-Specific Response
    explanation = explain_results_with_gemini(request.message, extracted, assessment)

    return ChatResponse(
        reply=explanation,
        extracted_parameters=extracted,
        assessment=assessment,
    )
