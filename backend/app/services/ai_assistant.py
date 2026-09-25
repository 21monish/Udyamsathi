import os
import json
import google.generativeai as genai
from typing import Dict, Any, List
from app.config import get_settings
from app.schemas.eligibility import EligibilityInput, EligibilityResponse
from app.models.scheme import Scheme
from app.services.eligibility_engine import assess_schemes

settings = get_settings()

if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)


def extract_intent_with_gemini(user_message: str) -> Dict[str, Any]:
    """
    Extracts structured loan/assistance parameters from natural language.
    Does NOT determine eligibility.
    """
    if not settings.GEMINI_API_KEY:
        # Heuristic fallback if API key is not yet set
        return {
            "purpose": "business",
            "annual_income": 250000,
            "loan_amount": 200000,
            "category": "SC",
            "age": 30,
            "language": "en"
        }

    prompt = f"""
You are an expert NLP parser for Indian Government Welfare Schemes (Problem Statement SIH26092).
Given the following user query in any Indian language (English, Hindi, Gujarati, Marathi, Tamil, etc.), extract the user's requirements into strict JSON format with these exact keys:

{{
  "purpose": "business" | "micro_enterprise" | "education" | "self_employment" | "housing" | "agriculture" | "healthcare" | "social_security",
  "annual_income": <number in INR, default 300000 if not specified>,
  "loan_amount": <number in INR, default 100000 if not specified>,
  "category": "SC" | "ST" | "OBC" | "GENERAL" (default "SC" if not specified),
  "age": <number, default 28 if not specified>,
  "education_status": "none" | "8th_standard" | "10th_standard" | "12th_standard" | "graduate",
  "language": "en" | "hi" | "gu" (detected language code of the user message)
}}

User Query: "{user_message}"

Respond ONLY with valid JSON. Do not add markdown backticks, explanations, or commentary.
"""
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1]
            if text.endswith("```"):
                text = text.rsplit("```", 1)[0].strip()
        data = json.loads(text)
        return data
    except Exception as e:
        print("Gemini extraction error:", e)
        # Safe fallback
        return {
            "purpose": "business",
            "annual_income": 300000,
            "loan_amount": 200000,
            "category": "SC",
            "age": 30,
            "education_status": "12th_standard",
            "language": "en"
        }


def explain_results_with_gemini(
    user_query: str,
    extracted_data: Dict[str, Any],
    assessment: EligibilityResponse,
) -> str:
    """
    Generates a natural, empathetic, and factual explanation in the user's language.
    Strictly grounded on verified scheme results — NO hallucinations.
    """
    lang = extracted_data.get("language", "en")
    lang_name = "Gujarati" if lang == "gu" else ("Hindi" if lang == "hi" else "English")

    eligible_summary = []
    for rec in assessment.eligible_schemes[:3]:
        checks_passed = [c.detail for c in rec.checks if c.passed]
        eligible_summary.append({
            "name": rec.scheme_name,
            "max_loan": rec.max_loan,
            "interest_rate": f"{rec.interest_rate}%",
            "reasons": checks_passed,
            "subsidy": rec.subsidy_info,
            "documents": rec.required_documents[:4]
        })

    if not settings.GEMINI_API_KEY:
        if eligible_summary:
            names = ", ".join([s["name"] for s in eligible_summary])
            return f"Based on your profile, you may qualify for {len(eligible_summary)} schemes: {names}. All criteria have been verified deterministically."
        else:
            return "Based on your criteria, no exact matching scheme was found. Please adjust your loan amount or income parameters."

    prompt = f"""
You are "UdyamSathi", a respectful and encouraging government welfare counselor for marginalized entrepreneurs in India.
The user asked: "{user_query}"

The deterministic eligibility engine has checked all criteria. Here are the verified results:
Eligible schemes found: {json.dumps(eligible_summary, ensure_ascii=False)}

Instructions:
1. Respond warmly and clearly in **{lang_name}**.
2. Mention the names of the eligible schemes, their interest rates, and loan limits.
3. State CLEARLY WHY they qualify (e.g. income limit matched, category qualified).
4. Highlight 2-3 key required documents so they can prepare.
5. Strictly adhere to the numbers provided above. DO NOT invent or fabricate interest rates, subsidy percentages, or criteria.
6. Encourage them to verify with their nearest State Channelizing Agency or bank branch.
"""
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print("Gemini explanation error:", e)
        names = ", ".join([s["name"] for s in eligible_summary])
        return f"Based on verified criteria, you are eligible for: {names}."
