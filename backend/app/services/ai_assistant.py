import re
import json
from typing import Dict, Any, List, Tuple, Optional
from app.config import get_settings
from app.schemas.eligibility import EligibilityInput, EligibilityResponse, SchemeRecommendation

settings = get_settings()


def classify_user_intent(msg: str) -> str:
    """
    Classifies the user input into distinct conversational intents.
    Ensures responses are deeply contextual rather than generic templates.
    """
    text = msg.lower().strip()

    # 1. Greetings & Identity
    greeting_patterns = [
        r'^(hi|hello|hey|namaste|greetings|good morning|good afternoon|good evening|howdy)\b',
        r'^(who are you|what is your name|introduce yourself|what can you do|how can you help|help me|help)\b',
    ]
    if any(re.search(p, text) for p in greeting_patterns):
        # Unless it also contains loan specifics like "hello i need 2 lakh loan"
        if not any(k in text for k in ['loan', 'lakh', 'scheme', 'crore', 'interest', 'money', 'rupee', 'rs', '₹']):
            return "GREETING"

    # 2. Specific Statutory Scheme Queries
    if any(k in text for k in ['mahila samriddhi', 'msy', 'women scheme', 'women loan']):
        return "FAQ_MAHILA_SAMRIDDHI"
    if any(k in text for k in ['dhibar', 'fisher', 'fish', 'pond', 'water body']):
        return "FAQ_DHIBAR"
    if any(k in text for k in ['education loan', 'btech', 'mbbs', 'college loan', 'study loan', 'degree loan', 'study abroad']):
        return "FAQ_EDUCATION"
    if any(k in text for k in ['vishwakarma', 'pm vishwakarma', 'artisan loan', 'toolkit']):
        return "FAQ_VISHWAKARMA"
    if any(k in text for k in ['mudra', 'shishu', 'kishore', 'tarun']):
        return "FAQ_MUDRA"
    if any(k in text for k in ['stand up india', 'standup india', 'stand-up']):
        return "FAQ_STANDUP_INDIA"
    if any(k in text for k in ['green business', 'e-rickshaw', 'electric vehicle', 'solar', 'surya ghar']):
        return "FAQ_GREEN_BUSINESS"

    # 3. Statutory Knowledge & Operational FAQs
    if any(k in text for k in ['what is nsfdc', 'about nsfdc', 'full form of nsfdc', 'who is nsfdc']):
        return "FAQ_NSFDC"
    if any(k in text for k in ['document', 'documents', 'paper', 'papers', 'proof', 'certificate', 'checklist']):
        return "FAQ_DOCUMENTS"
    if any(k in text for k in ['income limit', 'income criteria', 'income ceiling', 'salary limit', 'how much income']):
        return "FAQ_INCOME_LIMIT"
    if any(k in text for k in ['emi', 'moratorium', 'grace period', 'repayment holiday', 'calculate emi', 'reducing balance']):
        return "FAQ_EMI_MORATORIUM"
    if any(k in text for k in ['how to apply', 'application process', 'steps to apply', 'where to apply', 'procedure']):
        return "FAQ_HOW_TO_APPLY"
    if any(k in text for k in ['channel partner', 'channel partners', 'sca', 'branch', 'bank list', 'ahmedabad', 'gujarat branch']):
        return "FAQ_CHANNEL_PARTNERS"
    if any(k in text for k in ['female rebate', 'women discount', 'interest concession', 'rebate for women']):
        return "FAQ_FEMALE_REBATE"

    # 4. Loan Inquiries (requires loan keywords + amount/purpose, or specific enterprise purpose)
    has_loan_keyword = any(k in text for k in ['loan', 'credit', 'funding', 'finance', 'subsidy', 'borrow', 'eligible', 'eligibility', 'assist', 'assistance', 'grant', 'scheme', 'apply', 'fund'])
    has_amount = bool(re.search(r'(\d+(?:\.\d+)?)\s*(?:lakh|lac|thousand|crore|cr\b|₹|rs\.?|inr)', text)) or (has_loan_keyword and bool(re.search(r'\b(?:rs\.?|₹)?\s*\d{4,7}\b', text)))
    has_purpose = any(k in text for k in [
        'tailor', 'tailoring', 'garment', 'cloth', 'boutique', 'grocery', 'kirana',
        'dairy', 'cow', 'buffalo', 'cattle', 'milk', 'farm', 'tractor', 'poultry', 'agriculture',
        'salon', 'barber', 'carpenter', 'vendor', 'cart', 'street vendor', 'auto', 'e-rickshaw', 'rickshaw',
        'taxi', 'vehicle', 'transport', 'hotel', 'restaurant', 'tea stall', 'manufacturing', 'handicraft',
        'potter', 'cobbler', 'blacksmith', 'welder', 'solar', 'education', 'college', 'degree', 'btech', 'mbbs'
    ])

    if (has_amount and (has_purpose or has_loan_keyword)) or (has_loan_keyword and has_purpose):
        return "LOAN_INQUIRY"

    # 5. Vague loan queries without amount or purpose
    if has_loan_keyword or any(k in text for k in ['need money', 'want money', 'financial help']):
        return "VAGUE_LOAN"

    # 6. Fallback / Out of scope
    return "OUT_OF_SCOPE"


def extract_parameters_from_message(msg: str) -> Tuple[Dict[str, Any], bool]:
    """
    Extracts structured loan parameters from user message.
    Returns (extracted_dict, is_loan_query).
    """
    text = msg.lower().strip()
    intent = classify_user_intent(msg)

    # 1. Extract Amount
    amount = 200000.0  # sensible baseline
    lakh_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:lakh|lac)', text, re.IGNORECASE)
    crore_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:crore|cr)', text, re.IGNORECASE)
    thousand_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:thousand|k\b)', text, re.IGNORECASE)
    raw_num_match = re.search(r'(?:rs\.?|inr|₹)?\s*(\d{4,8})', text, re.IGNORECASE)

    if lakh_match:
        try:
            amount = float(lakh_match.group(1)) * 100000.0
        except ValueError:
            pass
    elif crore_match:
        try:
            amount = float(crore_match.group(1)) * 10000000.0
        except ValueError:
            pass
    elif thousand_match:
        try:
            amount = float(thousand_match.group(1)) * 1000.0
        except ValueError:
            pass
    elif raw_num_match:
        try:
            val = float(raw_num_match.group(1))
            if val >= 5000:
                amount = val
        except ValueError:
            pass

    # 2. Extract Purpose
    purpose = "business"
    if any(k in text for k in ['education', 'college', 'degree', 'study', 'student', 'btech', 'mbbs', 'mba', 'school', 'course']):
        purpose = "education"
    elif any(k in text for k in ['solar', 'surya', 'rooftop', 'electricity', 'green', 'energy']):
        purpose = "housing"
    elif any(k in text for k in ['farm', 'dairy', 'cow', 'buffalo', 'cattle', 'milk', 'agriculture', 'tractor', 'kisan', 'poultry', 'goat']):
        purpose = "agriculture"
    elif any(k in text for k in ['tailor', 'tailoring', 'garment', 'cloth', 'boutique', 'artisan', 'carpenter', 'potter', 'barber', 'salon', 'shop', 'grocery', 'kirana', 'cart', 'vendor']):
        purpose = "micro_enterprise"
    elif any(k in text for k in ['auto', 'e-rickshaw', 'rickshaw', 'taxi', 'car', 'truck', 'vehicle', 'transport']):
        purpose = "micro_enterprise"

    # 3. Extract Category
    category = "SC"
    if any(k in text for k in [' st ', 'scheduled tribe', 'tribal']):
        category = "ST"
    elif any(k in text for k in ['obc', 'backward']):
        category = "OBC"
    elif any(k in text for k in ['general', 'open category']):
        category = "GENERAL"

    # 4. Extract Gender
    gender = "male"
    if any(k in text for k in ['female', 'woman', 'women', 'girl', 'lady', 'mother', 'sister', 'wife', 'mahila']):
        gender = "female"

    is_loan_query = intent in ["LOAN_INQUIRY", "FAQ_MAHILA_SAMRIDDHI", "FAQ_DHIBAR", "FAQ_EDUCATION", "FAQ_VISHWAKARMA", "FAQ_MUDRA", "FAQ_GREEN_BUSINESS"]

    extracted = {
        "intent": intent,
        "is_loan_query": is_loan_query,
        "purpose": purpose,
        "annual_income": 250000.0,
        "loan_amount": amount,
        "category": category,
        "gender": gender,
        "age": 30,
        "education_status": "12th_standard",
        "language": "en",
        "state": "Gujarat",
        "district": "Ahmedabad",
    }
    return extracted, is_loan_query


def generate_direct_response(
    user_query: str,
    extracted: Dict[str, Any],
    assessment: Optional[EligibilityResponse] = None
) -> str:
    """
    Generates a direct, factual, empathetic response tailored exactly
    to what the user asked — never outputs random static text.
    """
    intent = extracted.get("intent", "OUT_OF_SCOPE")
    amount = extracted.get("loan_amount", 200000.0)
    purpose = extracted.get("purpose", "business")
    gender = extracted.get("gender", "male")
    is_female = gender == "female"

    # ----------------------------------------------------
    # 1. GREETING & IDENTITY
    # ----------------------------------------------------
    if intent == "GREETING":
        return """Hello! I am **UdyamSathi**, your official statutory credit counselor developed for SIH 26092 under the Ministry of Social Justice & Empowerment.

I am here to help marginalized entrepreneurs and students discover and access government concessional credit schemes.

**How I can help you today:**
1. **Scheme Discovery:** Find schemes with interest rates as low as 3.5% - 6.0% for your business, shop, dairy, or higher education.
2. **Statutory Criteria Check:** Verify eligibility against NSFDC income ceilings (up to ₹3L/₹5L) and female interest rebates.
3. **EMI & Moratorium:** Calculate monthly installments with grace periods where principal repayments are deferred.
4. **Channel Partner Routing:** Connect you to authorized State Channelizing Agencies (SCAs) and Bank branches in your district.

What business venture or loan requirement would you like to explore today?"""

    # ----------------------------------------------------
    # 2. STATUTORY KNOWLEDGE FAQS
    # ----------------------------------------------------
    if intent == "FAQ_NSFDC":
        return """**NSFDC (National Scheduled Castes Finance and Development Corporation)** is a Government of India apex corporation operating under the Ministry of Social Justice & Empowerment since 1989.

**Key Highlights:**
• **Mission:** To empower Scheduled Caste entrepreneurs and artisans through concessional loans and vocational skill development.
• **Concessional Interest Rates:** Official interest rates range from **3.5% to 8.0% per annum** (reducing balance).
• **Statutory Female Rebate:** Women beneficiaries receive an automatic **0.50% interest rate rebate**.
• **Disbursement Channel:** NSFDC partners with State Channelizing Agencies (SCAs)—such as GSCDC in Gujarat—and Regional Rural Banks (RRBs) to disburse funds locally.

Would you like to check eligible schemes for your specific business or loan amount?"""

    if intent == "FAQ_DOCUMENTS":
        return """To apply for a statutory loan under NSFDC and government credit schemes, prepare the following **6 essential documents**:

1. **Proof of Identity & Address:** Aadhaar Card, PAN Card, or Voter ID.
2. **Caste Certificate:** Official community certificate issued by the competent revenue authority (Tahsildar / Sub-Divisional Magistrate).
3. **Income Certificate:** Certified family income certificate showing annual income within the statutory ceiling (up to ₹3.00 Lakh for micro loans, up to ₹5.00 Lakh for education).
4. **Project Proposal (DPR):** Brief project report describing your business activity, machinery cost, and working capital needs.
5. **Supplier Quotations:** Official proforma invoices/quotations from GST-registered vendors for equipment, vehicles, or livestock.
6. **Bank Account Details:** Active bank passbook with IFSC code and past 6 months bank statement.

You can also use our interactive **[Application Readiness Guide](/application-guide)** to check off documents as you assemble them."""

    if intent == "FAQ_INCOME_LIMIT":
        return """Under statutory guidelines established by NSFDC and the Ministry of Social Justice & Empowerment:

• **Micro & Self-Employment Loans:** The family annual income ceiling is generally **₹3,00,000 per annum** for both rural and urban areas.
• **Education & Specialized Schemes:** The family annual income limit extends up to **₹5,00,000 per annum**.
• **Artisan & Cluster Schemes:** Some targeted artisan clusters (e.g. PM Vishwakarma) evaluate traditional skill certification with relaxed income ceilings.

If your annual family income is within ₹5,00,000, you qualify for statutory concessional interest rates (as low as 3.5% - 6.0% p.a.)."""

    if intent == "FAQ_EMI_MORATORIUM":
        return """Here is how loan repayment and statutory grace periods work on UdyamSathi:

• **Reducing Balance EMI:** Unlike flat-rate informal credit, interest is calculated strictly on the remaining principal balance, lowering your monthly interest as you make repayments.
• **Moratorium (Repayment Holiday):** NSFDC schemes provide a statutory moratorium of **3 to 12 months** (up to 6 months for Mahila Samriddhi, up to 1 year for education loans). During this period, you only pay nominal interest (or interest is deferred) while your enterprise is getting established.
• **Female Rebate:** Female entrepreneurs receive a **0.50% interest concession**, which directly reduces the monthly EMI.

You can simulate your exact monthly schedule on our **[EMI Calculator](/calculator)**."""

    if intent == "FAQ_HOW_TO_APPLY":
        return """Applying for a government concessional loan follows a structured **4-step pathway**:

1. **Step 1 - Eligibility Assessment:** Use UdyamSathi to check which scheme matches your income, caste, and loan amount in 60 seconds without uploading documents.
2. **Step 2 - Document Preparation:** Gather the 6 core documents (Aadhaar, Caste Certificate, Income Certificate, DPR, Supplier Quotation, Bank Passbook).
3. **Step 3 - Channel Partner Routing:** Locate your designated State Channelizing Agency (SCA) or local bank branch using our **[Channel Partners Directory](/partners)**.
4. **Step 4 - Verification & Sanction:** Submit your completed packet to the nodal officer. Upon physical inspection and verification, funds are disbursed directly to your bank account or equipment vendor."""

    if intent == "FAQ_CHANNEL_PARTNERS":
        return """NSFDC does not disburse funds directly from its headquarters; loans are channeled through authorized local partners:

• **State Channelizing Agencies (SCAs):** State government corporations dedicated to SC welfare (e.g. **GSCDC - Gujarat Scheduled Castes Development Corporation** in Gujarat).
• **Regional Rural Banks (RRBs):** Bank of Baroda-sponsored Baroda Gujarat Gramin Bank, Saurashtra Gramin Bank, etc.
• **Public Sector Banks:** SBI, PNB, Canara Bank, and Union Bank.

**Branch Routing Tip:** On UdyamSathi's **[Channel Partners page](/partners)**, partners are scored by recovery health, ensuring you are directed to solvent branches with active disbursement quotas."""

    if intent == "FAQ_FEMALE_REBATE":
        return """Under statutory NSFDC directives, all women entrepreneurs belonging to eligible target categories receive an **automatic 0.50% annual interest rate rebate**.

• **Example:** If the standard scheme interest rate is 6.50% per annum, a female applicant pays only **6.00% per annum**.
• **Flagship Women's Scheme:** **Mahila Samriddhi Yojana (MSY)** provides micro-loans up to ₹1,40,000 at an effective subsidized rate of just **3.50% per annum** (4.0% base minus 0.5% female rebate)."""

    if intent == "FAQ_MAHILA_SAMRIDDHI":
        return """**Mahila Samriddhi Yojana (MSY)** is NSFDC's flagship micro-credit program empowering women entrepreneurs from Scheduled Caste families:

• **Maximum Loan Assistance:** Up to **₹1,40,000** per beneficiary.
• **Concessional Interest Rate:** Base rate is 4.0% p.a.; with the statutory **0.5% female rebate**, the effective rate is just **3.50% per annum**.
• **Moratorium (Grace Period):** **6 months** repayment holiday to establish steady business cash flows.
• **Repayment Tenure:** Up to **3.5 years** in easy quarterly or monthly installments.
• **Eligible Trades:** Tailoring, garment shop, beauty parlor, grocery store, handicraft, dairy products, and food processing.

Would you like to simulate monthly EMIs or prepare the document checklist for Mahila Samriddhi Yojana?"""

    if intent == "FAQ_DHIBAR":
        return """**Dhibar Yojana** is NSFDC's specialized financial assistance program supporting traditional fisheries and water-body livelihoods:

• **Maximum Assistance:** Up to **₹5,00,000** per beneficiary.
• **Concessional Interest Rate:** **6.00% per annum** (5.50% p.a. for female fisherwomen).
• **Moratorium:** **6 to 9 months** to align with fishing and breeding seasons.
• **Repayment Period:** Up to **5 years**.
• **Eligible Activities:** Purchase of modern fishing nets, fiberglass boats, cold storage boxes, motorized crafts, and pond fish culture."""

    if intent == "FAQ_EDUCATION":
        return """**NSFDC Education Loan Scheme** provides subsidized higher education credit for students from Scheduled Caste families:

• **Maximum Assistance:** Up to **₹20,00,000** for professional degree courses in India, and up to **₹30,00,000** for recognized courses abroad.
• **Subsidized Interest Rate:** Just **4.00% per annum** (Effective **3.50% p.a.** for female students).
• **Statutory Income Limit:** Relaxed income ceiling up to **₹5,00,000 per annum**.
• **Moratorium Period:** Entire course duration plus **6 months** after securing employment (or 1 year after graduation, whichever is earlier).
• **Eligible Expenses:** College tuition fees, examination fees, hostel/boarding charges, textbooks, and computer/laptop."""

    if intent == "FAQ_VISHWAKARMA":
        return """**PM Vishwakarma Scheme** provides end-to-end support for traditional artisans and craftspeople:

• **Collateral-Free Credit:** First tranche up to **₹1,00,000** at a concessional **5% interest rate**; second tranche up to **₹2,00,000**.
• **Skill Training & Stipend:** 5 to 7 days basic training with ₹500/day stipend.
• **Modern Toolkit Incentive:** ₹15,000 grant for modern tools and machinery.
• **Eligible Trades:** 18 traditional occupations including carpenters, blacksmiths, tailors (Darzi), potters, cobblers, and barbers."""

    if intent == "FAQ_MUDRA":
        return """**Pradhan Mantri MUDRA Yojana (PMMY)** provides micro-enterprise funding across 3 distinct tiers:

• **MUDRA Shishu:** Loans up to **₹50,000** for small micro-units, street vendors, and home businesses.
• **MUDRA Kishore:** Loans from **₹50,001 to ₹5,00,000** for growing small enterprises and machinery purchase.
• **MUDRA Tarun:** Loans from **₹5,00,001 to ₹10,00,000** for established units expanding operations.
• **Collateral Requirement:** No collateral or security required under MUDRA."""

    if intent == "FAQ_GREEN_BUSINESS":
        return """**NSFDC Green Business Scheme** finances climate-positive and sustainable livelihood technologies:

• **Eligible Equipment:** Battery-operated e-rickshaws, solar rooftop panels, compressed biogas units, and eco-friendly transport.
• **Loan Assistance:** Up to **₹3,00,000 to ₹5,00,000** depending on the asset.
• **Interest Rate:** Concessional **6.00% - 7.00% per annum** (0.5% rebate for women).
• **Moratorium:** 6 months repayment holiday."""

    # ----------------------------------------------------
    # 3. VAGUE LOAN QUERY
    # ----------------------------------------------------
    if intent == "VAGUE_LOAN":
        return """I would be delighted to help you discover the most suitable government concessional credit scheme!

To match you with the lowest interest rate and maximum government subsidy, please tell me:
1. **What is your business idea or purpose?** (e.g. tailoring, dairy farming, grocery store, transport, or higher education)
2. **How much loan amount do you require?** (e.g. ₹50,000, ₹2 Lakh, ₹5 Lakh)
3. **Are you applying as a woman entrepreneur?** (Women receive a statutory 0.5% interest rate discount)

Once you mention these details, I will instantly evaluate your profile against all verified statutory schemes!"""

    # ----------------------------------------------------
    # 4. OUT OF SCOPE / IRRELEVANT
    # ----------------------------------------------------
    if intent == "OUT_OF_SCOPE":
        return """I am **UdyamSathi**, a specialized government credit counselor designed for Smart India Hackathon 2026 (Problem Statement 26092).

My expertise is strictly focused on:
• Government concessional welfare loans under **NSFDC, MUDRA, and PMEGP**.
• Statutory eligibility verification (income caps up to ₹3L/₹5L, caste certification).
• Reducing balance EMI and moratorium simulations.
• Connecting beneficiaries to solvent State Channelizing Agencies (SCAs).

How can I assist you with your business venture, loan inquiry, or government scheme eligibility today?"""

    # ----------------------------------------------------
    # 5. SPECIFIC LOAN INQUIRY (Dynamic Match)
    # ----------------------------------------------------
    eligible_schemes = assessment.eligible_schemes if assessment else []
    purpose_label = purpose.replace('_', ' ').capitalize()
    formatted_amount = f"₹{amount:,.0f}"

    if not eligible_schemes:
        return f"""Thank you for your inquiry for a **{purpose_label} loan of {formatted_amount}**.

Based on your specified amount and criteria, here is our guidance:
• **Income Ceiling:** NSFDC schemes require annual family income within ₹3,00,000 (up to ₹5,00,000 for specialized programs).
• **Recommended Alternative:** For funding above ₹15 Lakhs or open category applicants, consider **Stand-Up India** or **PMEGP** (Prime Minister’s Employment Generation Programme), which finance projects up to ₹50 Lakhs.

Would you like to try simulating a different loan amount or check our **[Scheme Catalogue](/schemes)**?"""

    top = eligible_schemes[0]
    rate = f"{top.effective_interest_rate}%"
    rebate_text = " (Includes 0.5% statutory rebate for female entrepreneur)" if top.female_rebate_applied else ""
    moratorium_val = getattr(top, 'moratorium', None)
    moratorium_text = f"{moratorium_val} months" if moratorium_val else "3 to 6 months"

    # Identify trade-specific guidance
    specific_advice = ""
    if purpose == "micro_enterprise" and is_female and amount <= 140000:
        specific_advice = "• **Flagship Scheme:** You qualify directly for **Mahila Samriddhi Yojana**, which features the lowest statutory interest rate of just 3.5% p.a. for women."
    elif purpose == "education":
        specific_advice = "• **Education Benefit:** Repayment does not commence until 6 months after completing your degree or securing employment."
    elif purpose == "agriculture":
        specific_advice = "• **Livestock Protection:** Includes veterinary certification allowance and flexible quarterly repayment aligned with agricultural harvesting cycles."

    return f"""Excellent! Based on your requirement for a **{purpose_label} loan of {formatted_amount}**, here is your verified government scheme match:

• **Primary Recommended Scheme:** **{top.scheme_name}**
• **Concessional Interest Rate:** **{rate} per annum**{rebate_text}
• **Maximum Loan Assistance:** Up to **₹{top.max_loan:,.0f}** (NSFDC finances up to 90% of verified project cost)
• **Moratorium (Grace Period):** **{moratorium_text}** repayment holiday before principal installments begin
• **Repayment Tenure:** Up to **{top.max_tenure} years** in easy monthly or quarterly installments

{specific_advice}

**Key Documents to Prepare:**
1. Aadhaar Card and Community/Caste Certificate
2. Family Income Certificate (under statutory threshold)
3. Proforma Quotation for equipment, machinery, or asset
4. Bank Account Passbook & 6 months statement

**Next Step:** Submit your application through your local State Channelizing Agency (SCA) or nearest rural bank branch shown in our **[Channel Partners Locator](/partners)**."""


def explain_results_with_gemini(
    user_query: str,
    extracted_data: Dict[str, Any],
    assessment: EligibilityResponse,
) -> str:
    """
    Main explanation orchestrator:
    Uses direct contextual response generator ensuring 100% relevant,
    user-targeted responses that never output random or mismatched text.
    """
    return generate_direct_response(user_query, extracted_data, assessment)
