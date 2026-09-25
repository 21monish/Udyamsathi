"""
Deterministic Eligibility Engine for Government Financial Schemes.
No weighted scoring or AI hallucinations.
Applies hard rules and produces explainable fit factors.
"""

from typing import List, Tuple
from app.models.scheme import Scheme
from app.schemas.eligibility import (
    EligibilityInput,
    EligibilityCheck,
    SchemeRecommendation,
    EligibilityResponse,
)


def evaluate_scheme_eligibility(
    scheme: Scheme,
    user_input: EligibilityInput,
) -> Tuple[bool, List[EligibilityCheck], int, int]:
    """
    Evaluates whether an applicant meets the hard eligibility criteria for a given scheme.
    Returns: (is_eligible, list_of_checks, passed_count, total_checks)
    """
    checks: List[EligibilityCheck] = []

    # 1. Social Category Check
    eligible_cats = [c.upper() for c in (scheme.eligible_categories or [])]
    user_cat = user_input.category.upper().strip()
    if not eligible_cats or "GENERAL" in eligible_cats or user_cat in eligible_cats:
        checks.append(EligibilityCheck(
            criterion="Social Category",
            passed=True,
            detail=f"Applicant category '{user_cat}' qualifies for this scheme (Eligible: {', '.join(eligible_cats)})."
        ))
    else:
        checks.append(EligibilityCheck(
            criterion="Social Category",
            passed=False,
            detail=f"Scheme is designated for {', '.join(eligible_cats)}. Applicant category is '{user_cat}'."
        ))

    # 2. Annual Income Ceiling Check
    if scheme.max_income is not None and scheme.max_income > 0:
        if user_input.annual_income <= scheme.max_income:
            checks.append(EligibilityCheck(
                criterion="Income Ceiling",
                passed=True,
                detail=f"Family income ₹{user_input.annual_income:,.0f} is within the scheme ceiling of ₹{scheme.max_income:,.0f}."
            ))
        else:
            checks.append(EligibilityCheck(
                criterion="Income Ceiling",
                passed=False,
                detail=f"Family income ₹{user_input.annual_income:,.0f} exceeds the maximum limit of ₹{scheme.max_income:,.0f}."
            ))
    else:
        checks.append(EligibilityCheck(
            criterion="Income Ceiling",
            passed=True,
            detail="No specific family income ceiling applies to this scheme."
        ))

    # 3. Loan Amount Fit Check
    loan = user_input.loan_amount
    min_loan = scheme.min_loan or 0.0
    max_loan = scheme.max_loan
    if loan >= min_loan and loan <= max_loan:
        checks.append(EligibilityCheck(
            criterion="Loan Amount Range",
            passed=True,
            detail=f"Requested ₹{loan:,.0f} is within eligible loan window (₹{min_loan:,.0f} – ₹{max_loan:,.0f})."
        ))
    elif loan < min_loan:
        checks.append(EligibilityCheck(
            criterion="Loan Amount Range",
            passed=False,
            detail=f"Requested ₹{loan:,.0f} is below the minimum scheme threshold of ₹{min_loan:,.0f}."
        ))
    else:
        checks.append(EligibilityCheck(
            criterion="Loan Amount Range",
            passed=False,
            detail=f"Requested ₹{loan:,.0f} exceeds maximum scheme cap of ₹{max_loan:,.0f}."
        ))

    # 4. Purpose Fit Check
    eligible_purposes = [p.lower().strip() for p in (scheme.eligible_purposes or [])]
    user_purpose = user_input.purpose.lower().strip()
    
    # Purpose equivalence mapping
    purpose_matches = False
    if not eligible_purposes:
        purpose_matches = True
    elif user_purpose in eligible_purposes:
        purpose_matches = True
    elif user_purpose in ["business", "micro_enterprise", "self_employment"] and any(
        p in eligible_purposes for p in ["business", "micro_enterprise", "self_employment"]
    ):
        purpose_matches = True

    if purpose_matches:
        checks.append(EligibilityCheck(
            criterion="Assistance Purpose",
            passed=True,
            detail=f"Project purpose '{user_input.purpose.replace('_', ' ').title()}' matches eligible activities."
        ))
    else:
        checks.append(EligibilityCheck(
            criterion="Assistance Purpose",
            passed=False,
            detail=f"Purpose '{user_input.purpose.replace('_', ' ').title()}' does not qualify (Eligible: {', '.join(eligible_purposes)})."
        ))

    # 5. Age Limits Check
    age = user_input.age
    min_age = scheme.min_age or 18
    max_age = scheme.max_age
    if age < min_age:
        checks.append(EligibilityCheck(
            criterion="Age Criteria",
            passed=False,
            detail=f"Applicant age ({age} years) is below minimum entry age of {min_age} years."
        ))
    elif max_age is not None and age > max_age:
        checks.append(EligibilityCheck(
            criterion="Age Criteria",
            passed=False,
            detail=f"Applicant age ({age} years) exceeds maximum eligible age of {max_age} years."
        ))
    else:
        age_str = f"between {min_age} and {max_age}" if max_age else f"at least {min_age}"
        checks.append(EligibilityCheck(
            criterion="Age Criteria",
            passed=True,
            detail=f"Applicant age ({age} years) satisfies age requirement ({age_str})."
        ))

    # 6. Education Requirement Check (e.g. for PMEGP projects > 10L, or Education loans)
    if scheme.min_education:
        req_edu = scheme.min_education.lower()
        user_edu = user_input.education_status.lower()
        # Basic education level hierarchy
        edu_rank = {
            "none": 0,
            "below_8th": 1,
            "8th_standard": 2,
            "10th_standard": 3,
            "12th_standard": 4,
            "diploma": 5,
            "graduate": 6,
            "post_graduate": 7,
        }
        user_val = edu_rank.get(user_edu, 2)
        req_val = edu_rank.get(req_edu, 2)
        if user_val >= req_val:
            checks.append(EligibilityCheck(
                criterion="Educational Qualification",
                passed=True,
                detail=f"Educational attainment meets or exceeds minimum requirement ({scheme.min_education.replace('_', ' ').title()})."
            ))
        else:
            checks.append(EligibilityCheck(
                criterion="Educational Qualification",
                passed=False,
                detail=f"Scheme requires at least {scheme.min_education.replace('_', ' ').title()} qualification."
            ))
    else:
        checks.append(EligibilityCheck(
            criterion="Educational Qualification",
            passed=True,
            detail="No mandatory educational qualification required for this scheme."
        ))

    # A scheme is eligible IF AND ONLY IF all hard checks pass!
    is_eligible = all(check.passed for check in checks)
    passed_count = sum(1 for check in checks if check.passed)
    total_checks = len(checks)

    return is_eligible, checks, passed_count, total_checks


def assess_schemes(schemes: List[Scheme], user_input: EligibilityInput) -> EligibilityResponse:
    """
    Evaluates all active schemes deterministically against the user's profile.
    Separates into eligible and ineligible schemes with explainability.
    """
    eligible_schemes: List[SchemeRecommendation] = []
    ineligible_schemes: List[SchemeRecommendation] = []

    for s in schemes:
        if not s.active:
            continue

        is_eligible, checks, passed_count, total_checks = evaluate_scheme_eligibility(s, user_input)

        rec = SchemeRecommendation(
            scheme_id=str(s.id),
            scheme_name=s.name,
            scheme_type=s.scheme_type,
            eligible=is_eligible,
            checks=checks,
            passed_count=passed_count,
            total_checks=total_checks,
            max_loan=s.max_loan,
            interest_rate=s.interest_rate,
            interest_rate_max=s.interest_rate_max,
            max_tenure=s.max_tenure,
            description=s.description,
            required_documents=s.required_documents or [],
            subsidy_info=s.subsidy_info,
            source_url=s.source_url,
            data_status=s.data_status,
        )

        if is_eligible:
            eligible_schemes.append(rec)
        else:
            ineligible_schemes.append(rec)

    # Sort eligible schemes by lowest interest rate first (beneficiary advantage)
    eligible_schemes.sort(key=lambda x: (x.interest_rate, -x.max_loan))
    # Sort ineligible schemes by highest passed count
    ineligible_schemes.sort(key=lambda x: -x.passed_count)

    return EligibilityResponse(
        input_summary=user_input,
        eligible_schemes=eligible_schemes,
        ineligible_schemes=ineligible_schemes,
        total_schemes_checked=len(eligible_schemes) + len(ineligible_schemes),
    )
