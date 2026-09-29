import sys
import os

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import engine, Base, SessionLocal
from app.models.ai_knowledge import AIKnowledgeItem

INITIAL_QA = [
            {
                "question": "What is NSFDC and what does it do?",
                "keywords": ["nsfdc", "what is nsfdc", "about nsfdc", "full form of nsfdc", "mandate"],
                "category": "SCHEMES",
                "answer": """**NSFDC (National Scheduled Castes Finance and Development Corporation)** is a Government of India apex corporation operating under the Ministry of Social Justice & Empowerment since 1989.

**Key Highlights:**
• **Mission:** To empower Scheduled Caste entrepreneurs and artisans through concessional loans and vocational skill development.
• **Concessional Interest Rates:** Official interest rates range from **3.5% to 8.0% per annum** (reducing balance).
• **Statutory Female Rebate:** Women beneficiaries receive an automatic **0.50% interest rate rebate**.
• **Disbursement Channel:** NSFDC partners with State Channelizing Agencies (SCAs)—such as GSCDC in Gujarat—and Regional Rural Banks (RRBs) to disburse funds locally."""
            },
            {
                "question": "What documents are required to apply for a loan?",
                "keywords": ["documents", "document", "paper", "papers", "proof", "checklist", "certificate"],
                "category": "DOCUMENTS",
                "answer": """To apply for a statutory loan under NSFDC and government credit schemes, prepare the following **6 essential documents**:

1. **Proof of Identity & Address:** Aadhaar Card, PAN Card, or Voter ID.
2. **Caste Certificate:** Official community certificate issued by the competent revenue authority (Tahsildar / Sub-Divisional Magistrate).
3. **Income Certificate:** Certified family income certificate showing annual income within the statutory ceiling (up to ₹3.00 Lakh for micro loans, up to ₹5.00 Lakh for education).
4. **Project Proposal (DPR):** Brief project report describing your business activity, machinery cost, and working capital needs.
5. **Supplier Quotations:** Official proforma invoices/quotations from GST-registered vendors for equipment, vehicles, or livestock.
6. **Bank Account Details:** Active bank passbook with IFSC code and past 6 months bank statement."""
            },
            {
                "question": "What is the annual income limit for NSFDC schemes?",
                "keywords": ["income limit", "income criteria", "income ceiling", "salary limit", "how much income"],
                "category": "ELIGIBILITY",
                "answer": """Under statutory guidelines established by NSFDC and the Ministry of Social Justice & Empowerment:

• **Micro & Self-Employment Loans:** The family annual income ceiling is generally **₹3,00,000 per annum** for both rural and urban areas.
• **Education & Specialized Schemes:** The family annual income limit extends up to **₹5,00,000 per annum**.
• **Artisan & Cluster Schemes:** Some targeted artisan clusters (e.g. PM Vishwakarma) evaluate traditional skill certification with relaxed income ceilings.

If your annual family income is within ₹5,00,000, you qualify for statutory concessional interest rates (as low as 3.5% - 6.0% p.a.)."""
            },
            {
                "question": "How does EMI calculation and the moratorium work?",
                "keywords": ["emi", "moratorium", "grace period", "repayment holiday", "calculate emi", "reducing balance"],
                "category": "EMI_REPAYMENT",
                "answer": """Here is how loan repayment and statutory grace periods work on UdyamSathi:

• **Reducing Balance EMI:** Unlike flat-rate informal credit, interest is calculated strictly on the remaining principal balance, lowering your monthly interest as you make repayments.
• **Moratorium (Repayment Holiday):** NSFDC schemes provide a statutory moratorium of **3 to 12 months** (up to 6 months for Mahila Samriddhi, up to 1 year for education loans). During this period, you only pay nominal interest (or interest is deferred) while your enterprise is getting established.
• **Female Rebate:** Female entrepreneurs receive a **0.50% interest concession**, which directly reduces the monthly EMI.

You can simulate your exact monthly schedule on our **[EMI Calculator](/calculator)**."""
            },
            {
                "question": "What is the Mahila Samriddhi Yojana (MSY)?",
                "keywords": ["mahila samriddhi", "msy", "women scheme", "women loan", "female entrepreneur"],
                "category": "SCHEMES",
                "answer": """**Mahila Samriddhi Yojana (MSY)** is NSFDC's flagship micro-credit program empowering women entrepreneurs from Scheduled Caste families:

• **Maximum Loan Assistance:** Up to **₹1,40,000** per beneficiary.
• **Concessional Interest Rate:** Base rate is 4.0% p.a.; with the statutory **0.5% female rebate**, the effective rate is just **3.50% per annum**.
• **Moratorium (Grace Period):** **6 months** repayment holiday to establish steady business cash flows.
• **Repayment Tenure:** Up to **3.5 years** in easy quarterly or monthly installments.
• **Eligible Trades:** Tailoring, garment shop, beauty parlor, grocery store, handicraft, dairy products, and food processing."""
            },
            {
                "question": "What is Dhibar Yojana and who is eligible?",
                "keywords": ["dhibar", "fisheries", "fishing", "fish", "fishermen", "water body"],
                "category": "SCHEMES",
                "answer": """**Dhibar Yojana** is NSFDC's specialized financial assistance program supporting traditional fisheries and water-body livelihoods:

• **Maximum Assistance:** Up to **₹5,00,000** per beneficiary.
• **Concessional Interest Rate:** **6.00% per annum** (5.50% p.a. for female fisherwomen).
• **Moratorium:** **6 to 9 months** to align with fishing and breeding seasons.
• **Repayment Period:** Up to **5 years**.
• **Eligible Activities:** Purchase of modern fishing nets, fiberglass boats, cold storage boxes, motorized crafts, and pond fish culture."""
            },
            {
                "question": "How can I get an education loan under NSFDC?",
                "keywords": ["education loan", "btech", "mbbs", "college loan", "study loan", "degree loan", "study abroad"],
                "category": "SCHEMES",
                "answer": """**NSFDC Education Loan Scheme** provides subsidized higher education credit for students from Scheduled Caste families:

• **Maximum Assistance:** Up to **₹20,00,000** for professional degree courses in India, and up to **₹30,00,000** for recognized courses abroad.
• **Subsidized Interest Rate:** Just **4.00% per annum** (Effective **3.50% p.a.** for female students).
• **Statutory Income Limit:** Relaxed income ceiling up to **₹5,00,000 per annum**.
• **Moratorium Period:** Entire course duration plus **6 months** after securing employment (or 1 year after graduation, whichever is earlier).
• **Eligible Expenses:** College tuition fees, examination fees, hostel/boarding charges, textbooks, and computer/laptop."""
            },
            {
                "question": "What are Channel Partners and State Channelizing Agencies (SCAs)?",
                "keywords": ["channel partner", "channel partners", "sca", "branch", "bank list", "ahmedabad", "gujarat branch"],
                "category": "GENERAL",
                "answer": """NSFDC does not disburse funds directly from its headquarters; loans are channeled through authorized local partners:

• **State Channelizing Agencies (SCAs):** State government corporations dedicated to SC welfare (e.g. **GSCDC - Gujarat Scheduled Castes Development Corporation** in Gujarat).
• **Regional Rural Banks (RRBs):** Bank of Baroda-sponsored Baroda Gujarat Gramin Bank, Saurashtra Gramin Bank, etc.
• **Public Sector Banks:** SBI, PNB, Canara Bank, and Union Bank.

**Branch Routing Tip:** On UdyamSathi's **[Channel Partners page](/partners)**, partners are scored by recovery health, ensuring you are directed to solvent branches with active disbursement quotas."""
            },
            {
                "question": "What is MYSY (Mukhyamantri Yuva Swavalamban Yojana) in Gujarat?",
                "keywords": ["mysy", "mukhyamantri yuva swavalamban yojana", "gujarat scholarship", "engineering scholarship", "medical scholarship", "hostel allowance"],
                "category": "SCHEMES",
                "answer": """**Mukhyamantri Yuva Swavalamban Yojana (MYSY)** is Gujarat's premier education financial assistance scheme for students from economically weaker sections:

• **Eligibility:** 80th percentile or above in 10th/12th board exams, with family annual income up to **₹6,00,000**.
• **Tuition Fee Assistance (50% Subsidy):**
  - **Medical (MBBS/BDS):** Up to **₹2,00,000 per year**.
  - **Engineering, Pharmacy & Tech:** Up to **₹50,000 per year**.
  - **Degree Courses (B.Sc, B.Com, BA):** Up to **₹25,000 per year**.
  - **Diploma Courses:** Up to **₹10,000 per year**.
• **Hostel Lodging Assistance:** **₹1,200 per month** (₹12,000 per year) for students studying outside their home taluka.
• **Book & Instrument Grant:** One-time grant of **₹10,000** for medical/dental/engineering, and **₹5,000** for diploma students.
• **Official Portal:** Apply directly at **[mysy.guj.nic.in](https://mysy.guj.nic.in)**."""
            },
            {
                "question": "What is the Digital Gujarat Post-Matric Scholarship?",
                "keywords": ["digital gujarat", "post matric scholarship", "sc scholarship", "st scholarship", "sebc scholarship", "digital gujarat portal"],
                "category": "SCHEMES",
                "answer": """**Digital Gujarat Post-Matric Scholarship** provides 100% financial tuition reimbursement and living allowances for SC, ST, and SEBC/OBC students:

• **Eligibility:** SC/ST students with family annual income up to **₹2,50,000** (SEBC/EWS income limits vary between ₹1.00L to ₹2.50L).
• **100% Fee Coverage:** All compulsory, non-refundable tuition and examination fees charged by colleges/universities are reimbursed directly to the student via DBT.
• **Monthly Maintenance Stipend:** Monthly living stipend credited directly into Aadhaar-seeded bank accounts (rates higher for hostellers than day scholars).
• **Covered Courses:** ITI, Polytechnic Diplomas, UG degrees (BA, B.Com, B.Sc, B.Tech, MBBS), Masters (MA, M.Sc, M.Tech, MBA), M.Phil, and PhD.
• **Official Portal:** Apply online on the **[Digital Gujarat Portal](https://www.digitalgujarat.gov.in)**."""
            },
            {
                "question": "What is PM SVANidhi and how does it help street vendors?",
                "keywords": ["svanidhi", "pm svanidhi", "street vendor", "hawker", "thela", "working capital vendor"],
                "category": "SCHEMES",
                "answer": """**PM SVANidhi (PM Street Vendor's AtmaNirbhar Nidhi)** is a specialized micro-credit program empowering urban street vendors:

• **Collateral-Free Loan Limits:**
  - **1st Tranche:** Up to **₹10,000** (1 year tenure).
  - **2nd Tranche:** Up to **₹20,000** (upon on-time repayment of 1st loan).
  - **3rd Tranche:** Up to **₹50,000** (36 months tenure).
• **7.00% Interest Subsidy:** Direct quarterly interest subsidy paid via DBT, reducing effective interest rate.
• **Digital Cashback:** Earn up to **₹100/month** (₹1,200/year) on UPI digital customer transactions.
• **Key Documents:** Aadhaar Card, Vending Certificate / Town Vending Committee (TVC) Letter of Recommendation (LoR), and Bank Passbook."""
            },
            {
                "question": "What is Shri Vajpayee Bankable Yojana (SVBY) in Gujarat?",
                "keywords": ["vajpayee bankable", "svby", "gujarat cottage scheme", "artisans gujarat", "cottage industry"],
                "category": "SCHEMES",
                "answer": """**Shri Vajpayee Bankable Yojana (SVBY)** is Gujarat's premier self-employment subsidy scheme run by the Cottage and Village Industries Department:

• **Maximum Financial Assistance:**
  - **Industrial Sector:** Up to **₹8,00,000**.
  - **Service Sector:** Up to **₹8,00,000**.
  - **Business / Retail Sector:** Up to **₹4,00,000**.
• **Capital Subsidy:**
  - **SC / ST / Women / Minorities:** **40% subsidy** in rural areas (max **₹1,25,000**); **37.5%** in urban areas (max **₹1,00,000**).
  - **General Category:** 25% rural (max ₹1,00,000), 20% urban (max ₹80,000).
• **Age Limit:** 18 to 65 years.
• **Minimum Education:** 4th Standard pass (relaxed for traditional handicrafts)."""
            },
            {
                "question": "What is PMFME (Food Processing Scheme)?",
                "keywords": ["pmfme", "food processing", "spice grinding", "flour mill", "pickle", "bakery", "oil expeller"],
                "category": "SCHEMES",
                "answer": """**PM Formalisation of Micro food processing Enterprises (PMFME)** provides capital subsidy for setting up or modernizing food units:

• **Credit-Linked Capital Subsidy:** **35% of eligible project cost**, up to a maximum subsidy ceiling of **₹10,00,000** per enterprise.
• **Eligible Trades:** Flour mills, chili/spice grinding, pickle & papad making, dairy packaging, bakeries, edible oil extraction, fruit pulp processing, and snacks production.
• **Beneficiary Contribution:** Minimum 10% of total project cost.
• **Statutory Requirement:** FSSAI food business registration, DPR proposal, and GST machinery quotations."""
            }
        ]

def seed_knowledge(db_session=None):
    close_db = False
    if db_session is None:
        Base.metadata.create_all(bind=engine)
        print("ai_knowledge table created/verified successfully.")
        db = SessionLocal()
        close_db = True
    else:
        db = db_session

    try:
        count = db.query(AIKnowledgeItem).count()
        print(f"Current trained Q&A count: {count}")

        upserted = 0
        for item in INITIAL_QA:
            existing = db.query(AIKnowledgeItem).filter(AIKnowledgeItem.question == item["question"]).first()
            if existing:
                existing.keywords = item["keywords"]
                existing.answer = item["answer"]
                existing.category = item["category"]
                existing.is_active = True
            else:
                db.add(AIKnowledgeItem(**item))
                upserted += 1
        db.commit()
        print(f"Upsert completed: {upserted} new items added, total items now {db.query(AIKnowledgeItem).count()}.")
        return upserted
    except Exception as e:
        print(f"Error seeding AI knowledge: {e}")
        db.rollback()
        raise e
    finally:
        if close_db:
            db.close()


if __name__ == "__main__":
    seed_knowledge()
