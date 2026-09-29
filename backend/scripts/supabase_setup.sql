-- ==========================================================
-- UDYAMSATHI SUPABASE SETUP & SEEDING SCRIPT
-- SIH 26092: AI-Driven Scheme Matching Platform
-- ==========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- UserRole Enum
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'userrole') THEN
        CREATE TYPE userrole AS ENUM ('BENEFICIARY', 'PARTNER', 'ADMIN');
    END IF;
END $$;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    mobile VARCHAR(15),
    password_hash VARCHAR(255) NOT NULL,
    language VARCHAR(5) DEFAULT 'en',
    role userrole NOT NULL DEFAULT 'BENEFICIARY',
    location VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_users_email ON users(email);

-- 2. Applicant Profiles Table
CREATE TABLE IF NOT EXISTS applicant_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    annual_income DOUBLE PRECISION,
    category VARCHAR(20),
    gender VARCHAR(20) DEFAULT 'male',
    age INTEGER,
    occupation VARCHAR(100),
    education_status VARCHAR(100),
    district VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Schemes Table
CREATE TABLE IF NOT EXISTS schemes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    scheme_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    min_income DOUBLE PRECISION,
    max_income DOUBLE PRECISION,
    min_loan DOUBLE PRECISION DEFAULT 0,
    max_loan DOUBLE PRECISION NOT NULL,
    interest_rate DOUBLE PRECISION NOT NULL,
    interest_rate_max DOUBLE PRECISION,
    max_tenure INTEGER NOT NULL,
    moratorium INTEGER DEFAULT 0,
    eligible_purposes JSON DEFAULT '[]'::json,
    eligible_categories JSON DEFAULT '[]'::json,
    min_age INTEGER,
    max_age INTEGER,
    min_education VARCHAR(100),
    required_documents JSON DEFAULT '[]'::json,
    subsidy_info TEXT,
    partner_types JSON DEFAULT '[]'::json,
    source_url VARCHAR(500),
    last_verified TIMESTAMPTZ,
    data_status VARCHAR(20) DEFAULT 'DEMO',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_schemes_name ON schemes(name);

-- 4. Channel Partners Table
CREATE TABLE IF NOT EXISTS channel_partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL,
    address VARCHAR(500) NOT NULL,
    state VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    supported_schemes JSON DEFAULT '[]'::json,
    active BOOLEAN DEFAULT TRUE,
    capacity_status VARCHAR(20) DEFAULT 'AVAILABLE',
    phone VARCHAR(20),
    email VARCHAR(255),
    npa_rate DOUBLE PRECISION DEFAULT 3.2,
    fund_utilization DOUBLE PRECISION DEFAULT 85.0,
    avg_processing_days INTEGER DEFAULT 14,
    working_hours VARCHAR(100) DEFAULT 'Mon-Fri 09:30 - 17:30',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_channel_partners_name ON channel_partners(name);
CREATE INDEX IF NOT EXISTS ix_channel_partners_state ON channel_partners(state);

-- 5. Applications Table
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scheme_id UUID NOT NULL REFERENCES schemes(id) ON DELETE CASCADE,
    partner_id UUID REFERENCES channel_partners(id) ON DELETE SET NULL,
    requested_amount DOUBLE PRECISION NOT NULL,
    status VARCHAR(20) DEFAULT 'DRAFT',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. AI Knowledge Base Table
CREATE TABLE IF NOT EXISTS ai_knowledge (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question VARCHAR(500) NOT NULL,
    keywords JSON DEFAULT '[]'::json,
    answer TEXT NOT NULL,
    category VARCHAR(100) DEFAULT 'GENERAL',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_ai_knowledge_question ON ai_knowledge(question);

-- ==========================================================
-- SEED USERS (Admin & Beneficiary)
-- ==========================================================
INSERT INTO users (id, name, email, password_hash, role, language, is_active)
VALUES ('a0000000-0000-0000-0000-000000000001', 'System Administrator', 'admin@udyamsathi.in', '$2b$12$dgSb1k7aFdTUBzXLfSTcRuKOz1WwqJRqKwg3N8BT01U6HrcLLDt76', 'ADMIN', 'en', TRUE)
ON CONFLICT (email) DO NOTHING;
INSERT INTO users (id, name, email, password_hash, role, language, is_active)
VALUES ('b0000000-0000-0000-0000-000000000002', 'Ramesh Kumar', 'test@udyamsathi.in', '$2b$12$LDnEXpBTSpza5.VMSIdqW.l7.ot1V37eaRT0OSL1PS7FQail4sSqC', 'BENEFICIARY', 'en', TRUE)
ON CONFLICT (email) DO NOTHING;
INSERT INTO applicant_profiles (id, user_id, annual_income, category, gender, age, occupation, education_status, district, state, pincode)
VALUES ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002', 250000, 'SC', 'male', 30, 'Small Business Owner', '12th_standard', 'Ahmedabad', 'Gujarat', '380001')
ON CONFLICT (user_id) DO NOTHING;

-- ==========================================================
-- SEED STATUTORY SCHEMES (40 Verified Schemes)
-- ==========================================================
INSERT INTO schemes (
    name, scheme_type, description, min_income, max_income, min_loan, max_loan,
    interest_rate, interest_rate_max, max_tenure, moratorium,
    eligible_purposes, eligible_categories, min_age, max_age, min_education,
    required_documents, subsidy_info, partner_types, source_url, data_status, active
) VALUES (
    'NSKFDC General Term Loan',
    'TERM_LOAN',
    'Term loan for Safai Karamcharis and their dependents for income-generating activities. Loan up to ₹15 lakh with concessional interest.',
    NULL,
    300000.0,
    10000.0,
    1500000.0,
    6.0,
    9.0,
    120,
    6,
    '["business", "micro_enterprise", "self_employment"]'::json,
    '["SC", "ST", "OBC", "GENERAL"]'::json,
    18,
    55,
    NULL,
    '["Safai Karamchari Certificate", "Income Certificate", "Identity Proof (Aadhaar)", "Address Proof", "Bank Account Details", "Project Report"]'::json,
    '1% interest rebate for women beneficiaries. 0.5% rebate for timely repayment.',
    '["SCA", "PSB"]'::json,
    'https://nskfdc.nic.in',
    'DEMO',
    True
);
INSERT INTO schemes (
    name, scheme_type, description, min_income, max_income, min_loan, max_loan,
    interest_rate, interest_rate_max, max_tenure, moratorium,
    eligible_purposes, eligible_categories, min_age, max_age, min_education,
    required_documents, subsidy_info, partner_types, source_url, data_status, active
) VALUES (
    'Stand-Up India',
    'TERM_LOAN',
    'Bank loans between ₹10 lakh and ₹1 crore for SC/ST and Women entrepreneurs to set up greenfield enterprises in manufacturing, services, or trading.',
    NULL,
    NULL,
    1000000.0,
    10000000.0,
    9.0,
    12.0,
    84,
    18,
    '["business", "micro_enterprise"]'::json,
    '["SC", "ST"]'::json,
    18,
    NULL,
    NULL,
    '["SC/ST Certificate", "Identity Proof (Aadhaar)", "Address Proof", "Business Plan/Project Report", "Bank Account Details", "Proof of Business Address", "ITR (if available)"]'::json,
    'No subsidy. Margin money of up to 25% can be from eligible central/state schemes.',
    '["PSB", "RRB"]'::json,
    'https://www.standupmitra.in',
    'DEMO',
    True
);
INSERT INTO schemes (
    name, scheme_type, description, min_income, max_income, min_loan, max_loan,
    interest_rate, interest_rate_max, max_tenure, moratorium,
    eligible_purposes, eligible_categories, min_age, max_age, min_education,
    required_documents, subsidy_info, partner_types, source_url, data_status, active
) VALUES (
    'MUDRA Shishu',
    'MUDRA',
    'Micro-finance for very small businesses. Loan up to ₹50,000 under Pradhan Mantri MUDRA Yojana for income-generating activities.',
    NULL,
    NULL,
    1000.0,
    50000.0,
    10.0,
    12.0,
    60,
    0,
    '["business", "micro_enterprise", "self_employment"]'::json,
    '["SC", "ST", "OBC", "GENERAL"]'::json,
    18,
    NULL,
    NULL,
    '["Identity Proof (Aadhaar)", "Address Proof", "Business Proof/Activity Details", "Bank Account Details", "Passport Photo"]'::json,
    NULL,
    '["PSB", "RRB", "NBFC_MFI"]'::json,
    'https://www.mudra.org.in',
    'DEMO',
    True
);
INSERT INTO schemes (
    name, scheme_type, description, min_income, max_income, min_loan, max_loan,
    interest_rate, interest_rate_max, max_tenure, moratorium,
    eligible_purposes, eligible_categories, min_age, max_age, min_education,
    required_documents, subsidy_info, partner_types, source_url, data_status, active
) VALUES (
    'MUDRA Kishore',
    'MUDRA',
    'Loans from ₹50,000 to ₹5 lakh for growing businesses under Pradhan Mantri MUDRA Yojana.',
    NULL,
    NULL,
    50001.0,
    500000.0,
    10.0,
    14.0,
    60,
    0,
    '["business", "micro_enterprise", "self_employment"]'::json,
    '["SC", "ST", "OBC", "GENERAL"]'::json,
    18,
    NULL,
    NULL,
    '["Identity Proof (Aadhaar)", "Address Proof", "Business Registration (if any)", "Bank Statements (6 months)", "Business Plan", "Passport Photo"]'::json,
    NULL,
    '["PSB", "RRB", "NBFC_MFI"]'::json,
    'https://www.mudra.org.in',
    'DEMO',
    True
);
INSERT INTO schemes (
    name, scheme_type, description, min_income, max_income, min_loan, max_loan,
    interest_rate, interest_rate_max, max_tenure, moratorium,
    eligible_purposes, eligible_categories, min_age, max_age, min_education,
    required_documents, subsidy_info, partner_types, source_url, data_status, active
) VALUES (
    'MUDRA Tarun',
    'MUDRA',
    'Loans from ₹5 lakh to ₹10 lakh for established businesses seeking expansion under Pradhan Mantri MUDRA Yojana.',
    NULL,
    NULL,
    500001.0,
    1000000.0,
    11.0,
    16.0,
    84,
    0,
    '["business", "micro_enterprise"]'::json,
    '["SC", "ST", "OBC", "GENERAL"]'::json,
    18,
    NULL,
    NULL,
    '["Identity Proof (Aadhaar)", "Address Proof", "Business Registration", "Bank Statements (12 months)", "ITR (2 years)", "Business Plan", "Proof of Business Address"]'::json,
    NULL,
    '["PSB", "RRB"]'::json,
    'https://www.mudra.org.in',
    'DEMO',
    True
);
INSERT INTO schemes (
    name, scheme_type, description, min_income, max_income, min_loan, max_loan,
    interest_rate, interest_rate_max, max_tenure, moratorium,
    eligible_purposes, eligible_categories, min_age, max_age, min_education,
    required_documents, subsidy_info, partner_types, source_url, data_status, active
) VALUES (
    'PMEGP',
    'PMEGP',
    'Prime Minister''s Employment Generation Programme. Loans for new micro-enterprises in manufacturing (up to ₹50 lakh) or service/business (up to ₹20 lakh) with government subsidy on project cost.',
    NULL,
    NULL,
    100000.0,
    5000000.0,
    10.0,
    14.0,
    84,
    6,
    '["business", "micro_enterprise"]'::json,
    '["SC", "ST", "OBC", "GENERAL"]'::json,
    18,
    NULL,
    '8th_standard',
    '["Identity Proof (Aadhaar)", "Address Proof", "Caste Certificate (for SC/ST/OBC)", "Education Certificate", "Project Report", "Passport Photo", "Bank Account Details", "EDP Training Certificate"]'::json,
    'SC/ST category: 35% subsidy on project cost in urban areas, 35% in rural areas. General category: 15% urban, 25% rural. Projects above ₹10L (manufacturing) or ₹5L (service) require 8th standard education.',
    '["PSB", "RRB"]'::json,
    'https://www.kviconline.gov.in/pmegpeportal/',
    'DEMO',
    True
);
INSERT INTO schemes (
    name, scheme_type, description, min_income, max_income, min_loan, max_loan,
    interest_rate, interest_rate_max, max_tenure, moratorium,
    eligible_purposes, eligible_categories, min_age, max_age, min_education,
    required_documents, subsidy_info, partner_types, source_url, data_status, active
) VALUES (
    'Venture Capital Fund for SC',
    'VENTURE_CAPITAL',
    'Equity or quasi-equity funding for SC entrepreneurs with viable business plans. For projects requiring ₹50 lakh to ₹15 crore. Operated through NSFDC.',
    NULL,
    500000.0,
    5000000.0,
    150000000.0,
    0.0,
    NULL,
    0,
    0,
    '["business"]'::json,
    '["SC"]'::json,
    18,
    NULL,
    NULL,
    '["SC Certificate", "Income Certificate", "Identity Proof (Aadhaar)", "Detailed Business Plan", "Financial Projections", "Bank Statements", "Company Registration (if applicable)"]'::json,
    'Equity investment — no interest. Returns through business growth and exit.',
    '["SCA"]'::json,
    'https://nsfdc.nic.in',
    'DEMO',
    True
);
INSERT INTO schemes (
    name, scheme_type, description, min_income, max_income, min_loan, max_loan,
    interest_rate, interest_rate_max, max_tenure, moratorium,
    eligible_purposes, eligible_categories, min_age, max_age, min_education,
    required_documents, subsidy_info, partner_types, source_url, data_status, active
) VALUES (
    'NSFDC Education Loan',
    'EDUCATION_LOAN',
    'Concessional education loan for SC students pursuing professional and technical higher education in India or abroad. Up to ₹40 Lakh at 6.5% interest.',
    NULL,
    500000.0,
    50000.0,
    4000000.0,
    6.5,
    NULL,
    84,
    12,
    '["education"]'::json,
    '["SC"]'::json,
    17,
    35,
    '12th_standard',
    '["SC Certificate", "Income Certificate", "Identity Proof (Aadhaar)", "Admission Letter", "Fee Structure", "Mark Sheets", "Bank Account Details"]'::json,
    'Concessional 6.5% interest rate. Moratorium period covers course duration plus 6 months.',
    '["SCA", "PSB"]'::json,
    'https://nsfdc.nic.in',
    'VERIFIED',
    True
);
INSERT INTO schemes (
    name, scheme_type, description, min_income, max_income, min_loan, max_loan,
    interest_rate, interest_rate_max, max_tenure, moratorium,
    eligible_purposes, eligible_categories, min_age, max_age, min_education,
    required_documents, subsidy_info, partner_types, source_url, data_status, active
) VALUES (
    'NSFDC Term Loan',
    'TERM_LOAN',
    'Concessional term loan for income-generating activities exclusively for Scheduled Caste entrepreneurs. Financing projects costing up to ₹50 Lakh through State Channelizing Agencies.',
    NULL,
    500000.0,
    140001.0,
    4500000.0,
    8.0,
    NULL,
    120,
    6,
    '["business", "micro_enterprise", "self_employment"]'::json,
    '["SC"]'::json,
    18,
    55,
    NULL,
    '["SC Certificate", "Income Certificate (Family income under ₹5 Lakh)", "Identity Proof (Aadhaar)", "Address Proof", "Bank Account Details", "Detailed Project Report"]'::json,
    'Concessional interest rate provided through State Channelizing Agencies (SCAs).',
    '["SCA"]'::json,
    'https://nsfdc.nic.in',
    'VERIFIED',
    True
);
INSERT INTO schemes (
    name, scheme_type, description, min_income, max_income, min_loan, max_loan,
    interest_rate, interest_rate_max, max_tenure, moratorium,
    eligible_purposes, eligible_categories, min_age, max_age, min_education,
    required_documents, subsidy_info, partner_types, source_url, data_status, active
) VALUES (
    'NSFDC Micro Credit Finance',
    'MICRO_CREDIT',
    'Micro credit for small-scale income-generating activities by SC individuals. Maximum project cost ₹1.40 Lakh with very low interest rate.',
    NULL,
    500000.0,
    5000.0,
    140000.0,
    6.5,
    NULL,
    60,
    3,
    '["business", "micro_enterprise", "self_employment"]'::json,
    '["SC"]'::json,
    18,
    55,
    NULL,
    '["SC Certificate", "Income Certificate", "Identity Proof (Aadhaar)", "Address Proof", "Bank Account Details", "Activity Details"]'::json,
    'Special low interest rate of 6.5% per annum.',
    '["SCA", "NBFC_MFI"]'::json,
    'https://nsfdc.nic.in',
    'VERIFIED',
    True
);
INSERT INTO schemes (
    name, scheme_type, description, min_income, max_income, min_loan, max_loan,
    interest_rate, interest_rate_max, max_tenure, moratorium,
    eligible_purposes, eligible_categories, min_age, max_age, min_education,
    required_documents, subsidy_info, partner_types, source_url, data_status, active
) VALUES (
    'Ayushman Bharat (PM-JAY)',
    'SUBSIDY',
    'Comprehensive cashless health insurance coverage up to ₹5 Lakh per year per family for secondary and tertiary hospitalisation. Senior citizens aged 70+ get an exclusive separate ₹5 Lakh top-up cover via the Ayushman Vaya Vandana Card.',
    NULL,
    NULL,
    0.0,
    500000.0,
    0.0,
    NULL,
    12,
    0,
    '["healthcare", "social_security", "medical"]'::json,
    '["SC", "ST", "OBC", "GENERAL"]'::json,
    0,
    NULL,
    NULL,
    '["Aadhaar Card", "Ration Card / Family Card", "Age Proof (for 70+ Vaya Vandana)"]'::json,
    '100% cashless treatment at all empaneled public and private hospitals across India.',
    '["PSB", "SCA"]'::json,
    'https://nha.gov.in/PM-JAY',
    'VERIFIED',
    True
);
INSERT INTO schemes (
    name, scheme_type, description, min_income, max_income, min_loan, max_loan,
    interest_rate, interest_rate_max, max_tenure, moratorium,
    eligible_purposes, eligible_categories, min_age, max_age, min_education,
    required_documents, subsidy_info, partner_types, source_url, data_status, active
) VALUES (
    'Atal Pension Yojana (APY)',
    'SUBSIDY',
    'Guaranteed monthly pension ranging from ₹1,000 to ₹5,000 post-60 years of age based on contribution amount, backed by Government of India.',
    NULL,
    NULL,
    0.0,
    5000.0,
    0.0,
    NULL,
    0,
    0,
    '["social_security", "pension", "self_employment"]'::json,
    '["SC", "ST", "OBC", "GENERAL"]'::json,
    18,
    40,
    NULL,
    '["Aadhaar Card", "Savings Bank Account Details", "Linked Mobile Number"]'::json,
    'Government co-contribution for eligible subscribers. Subscriber receives life-long assured pension.',
    '["PSB", "RRB"]'::json,
    'https://www.npscra.nsdl.co.in/scheme-details.php',
    'VERIFIED',
    True
);
INSERT INTO schemes (
    name, scheme_type, description, min_income, max_income, min_loan, max_loan,
    interest_rate, interest_rate_max, max_tenure, moratorium,
    eligible_purposes, eligible_categories, min_age, max_age, min_education,
    required_documents, subsidy_info, partner_types, source_url, data_status, active
) VALUES (
    'PM Shram Yogi Maan-dhan (PM-SYM)',
    'SUBSIDY',
    'Old age protection and social security scheme for unorganized workers. Assures a minimum monthly pension of ₹3,000 after attaining age 60 with 50:50 government matching contribution.',
    NULL,
    180000.0,
    0.0,
    3000.0,
    0.0,
    NULL,
    0,
    0,
    '["social_security", "pension", "self_employment"]'::json,
    '["SC", "ST", "OBC", "GENERAL"]'::json,
    18,
    40,
    NULL,
    '["Aadhaar Card", "e-Shram Card / Registration", "Savings Bank Account / IFSC"]'::json,
    '50% monthly contribution matched by Central Government into beneficiary pension account.',
    '["CSC", "PSB"]'::json,
    'https://maandhan.in',
    'VERIFIED',
    True
);
INSERT INTO schemes (
    name, scheme_type, description, min_income, max_income, min_loan, max_loan,
    interest_rate, interest_rate_max, max_tenure, moratorium,
    eligible_purposes, eligible_categories, min_age, max_age, min_education,
    required_documents, subsidy_info, partner_types, source_url, data_status, active
) VALUES (
    'PM Surya Ghar: Muft Bijli Yojana',
    'SUBSIDY',
    'Solar rooftop subsidy scheme providing up to 300 units of free electricity per month. Central financial assistance: ₹30,000 for 1 kW, ₹60,000 for 2 kW, and up to ₹78,000 for 3 kW or higher systems.',
    NULL,
    NULL,
    0.0,
    78000.0,
    0.0,
    NULL,
    0,
    0,
    '["housing", "energy", "solar", "sustainability"]'::json,
    '["SC", "ST", "OBC", "GENERAL"]'::json,
    18,
    NULL,
    NULL,
    '["Aadhaar Card", "Recent Electricity Bill", "Proof of Roof Ownership / Property Tax"]'::json,
    'Direct DBT subsidy into bank account: ₹30k (1 kW), ₹60k (2 kW), ₹78k (3 kW+). Concessional collateral-free bank loans available.',
    '["PSB", "RRB"]'::json,
    'https://pmsuryaghar.gov.in',
    'VERIFIED',
    True
);
INSERT INTO schemes (
    name, scheme_type, description, min_income, max_income, min_loan, max_loan,
    interest_rate, interest_rate_max, max_tenure, moratorium,
    eligible_purposes, eligible_categories, min_age, max_age, min_education,
    required_documents, subsidy_info, partner_types, source_url, data_status, active
) VALUES (
    'Pradhan Mantri Awas Yojana (PMAY 2.0)',
    'SUBSIDY',
    'Housing for All initiative providing interest subsidy up to ₹2.30 Lakh to ₹2.67 Lakh on home loans for EWS, LIG, and MIG families to purchase or construct their first pucca house.',
    NULL,
    1800000.0,
    100000.0,
    2500000.0,
    6.5,
    9.0,
    240,
    0,
    '["housing", "home_loan"]'::json,
    '["SC", "ST", "OBC", "GENERAL"]'::json,
    18,
    70,
    NULL,
    '["Aadhaar Card / Voter ID", "Income Certificate / Form 16", "Affidavit stating no pucca house ownership anywhere in India", "Property Title Deeds"]'::json,
    'Upfront interest subsidy credited directly to beneficiary loan account reducing principal and EMI.',
    '["PSB", "RRB", "NBFC_MFI"]'::json,
    'https://pmaymis.gov.in',
    'VERIFIED',
    True
);
INSERT INTO schemes (
    name, scheme_type, description, min_income, max_income, min_loan, max_loan,
    interest_rate, interest_rate_max, max_tenure, moratorium,
    eligible_purposes, eligible_categories, min_age, max_age, min_education,
    required_documents, subsidy_info, partner_types, source_url, data_status, active
) VALUES (
    'Pradhan Mantri Ujjwala Yojana (PMUY)',
    'SUBSIDY',
    'Provides free deposit-free LPG connection to adult women from BPL and disadvantaged households, along with a targeted subsidy of ₹300 per refill for up to 12 cylinders annually.',
    NULL,
    300000.0,
    0.0,
    5000.0,
    0.0,
    NULL,
    0,
    0,
    '["housing", "energy", "social_security"]'::json,
    '["SC", "ST", "OBC", "GENERAL"]'::json,
    18,
    NULL,
    NULL,
    '["Aadhaar Card of applicant & family members", "BPL Ration Card / Antyodaya Card", "Bank Passbook"]'::json,
    'Free stove + first cylinder connection deposit waiver + ₹300 subsidy per refill directly in bank account.',
    '["SCA", "PSB"]'::json,
    'https://www.pmuy.gov.in',
    'VERIFIED',
    True
);
INSERT INTO schemes (
    name, scheme_type, description, min_income, max_income, min_loan, max_loan,
    interest_rate, interest_rate_max, max_tenure, moratorium,
    eligible_purposes, eligible_categories, min_age, max_age, min_education,
    required_documents, subsidy_info, partner_types, source_url, data_status, active
) VALUES (
    'PM Kisan Samman Nidhi (PM-KISAN)',
    'SUBSIDY',
    'Direct income support of ₹6,000 per year in three equal instalments of ₹2,000 directly transferred into the bank accounts of all landholding farmer families across India.',
    NULL,
    NULL,
    0.0,
    6000.0,
    0.0,
    NULL,
    12,
    0,
    '["agriculture", "farming", "self_employment"]'::json,
    '["SC", "ST", "OBC", "GENERAL"]'::json,
    18,
    NULL,
    NULL,
    '["Aadhaar Card", "Land Ownership Documents (Khatoni / Jamabandi)", "Bank Account Details (Aadhaar linked)"]'::json,
    '100% direct central government cash transfer via Aadhaar-linked DBT.',
    '["PSB", "RRB"]'::json,
    'https://pmkisan.gov.in',
    'VERIFIED',
    True
);
INSERT INTO schemes (
    name, scheme_type, description, min_income, max_income, min_loan, max_loan,
    interest_rate, interest_rate_max, max_tenure, moratorium,
    eligible_purposes, eligible_categories, min_age, max_age, min_education,
    required_documents, subsidy_info, partner_types, source_url, data_status, active
) VALUES (
    'PM Vishwakarma Yojana',
    'MICRO_CREDIT',
    'Comprehensive empowerment for 18 traditional artisan trades (carpenters, blacksmiths, goldsmiths, potters, etc.). Offers ₹15,000 modern toolkit e-voucher grant, ₹500/day training stipend, and collateral-free enterprise loans up to ₹3 Lakh at an ultra-low 5% interest rate.',
    NULL,
    NULL,
    10000.0,
    300000.0,
    5.0,
    NULL,
    60,
    6,
    '["business", "artisan", "vocational", "micro_enterprise", "self_employment"]'::json,
    '["SC", "ST", "OBC", "GENERAL"]'::json,
    18,
    NULL,
    NULL,
    '["Aadhaar Card", "Mobile Linked to Aadhaar", "Bank Passbook", "Proof of Traditional Trade Practice"]'::json,
    '₹15,000 toolkit grant + 8% interest subvention by Government ensuring effective interest rate is capped at just 5%.',
    '["PSB", "RRB", "SCA"]'::json,
    'https://pmvishwakarma.gov.in',
    'VERIFIED',
    True
);
INSERT INTO schemes (
    name, scheme_type, description, min_income, max_income, min_loan, max_loan,
    interest_rate, interest_rate_max, max_tenure, moratorium,
    eligible_purposes, eligible_categories, min_age, max_age, min_education,
    required_documents, subsidy_info, partner_types, source_url, data_status, active
) VALUES (
    'Pradhan Mantri MUDRA Yojana (PMMY)',
    'MUDRA',
    'Loans up to ₹10 Lakh without collateral for micro and small enterprises across three stages: Shishu (up to ₹50,000), Kishor (₹50,000 to ₹5 Lakh), and Tarun (₹5 Lakh to ₹10 Lakh).',
    NULL,
    NULL,
    10000.0,
    1000000.0,
    9.5,
    12.5,
    60,
    6,
    '["business", "micro_enterprise", "self_employment"]'::json,
    '["SC", "ST", "OBC", "GENERAL"]'::json,
    18,
    65,
    NULL,
    '["Aadhaar Card / PAN Card", "Business Address Proof & Registration", "Bank Statements for the last 6 months", "Passport Photos"]'::json,
    'No collateral or third-party guarantee required. Credit guarantee backed by CGFMU.',
    '["PSB", "RRB", "NBFC_MFI"]'::json,
    'https://www.mudra.org.in',
    'VERIFIED',
    True
);
INSERT INTO schemes (
    name, scheme_type, description, min_income, max_income, min_loan, max_loan,
    interest_rate, interest_rate_max, max_tenure, moratorium,
    eligible_purposes, eligible_categories, min_age, max_age, min_education,
    required_documents, subsidy_info, partner_types, source_url, data_status, active
) VALUES (
    'Stand-Up India Scheme',
    'TERM_LOAN',
    'Bank loans between ₹10 Lakh and ₹1 Crore for Scheduled Caste (SC), Scheduled Tribe (ST), and/or Women entrepreneurs to set up greenfield enterprises in manufacturing, services, agri-allied, or trading.',
    NULL,
    NULL,
    1000000.0,
    10000000.0,
    8.5,
    11.5,
    84,
    18,
    '["business", "micro_enterprise"]'::json,
    '["SC", "ST"]'::json,
    18,
    NULL,
    NULL,
    '["Aadhaar Card / Voter ID", "Caste Certificate (for SC/ST category)", "Business Incorporation & Projected Balance Sheets", "Proof of Business Address", "Project Report"]'::json,
    'Up to 25% margin money can be converged with central or state subsidy schemes.',
    '["PSB", "RRB"]'::json,
    'https://www.standupmitra.in',
    'VERIFIED',
    True
);
INSERT INTO schemes (
    name, scheme_type, description, min_income, max_income, min_loan, max_loan,
    interest_rate, interest_rate_max, max_tenure, moratorium,
    eligible_purposes, eligible_categories, min_age, max_age, min_education,
    required_documents, subsidy_info, partner_types, source_url, data_status, active
) VALUES (
    'PMEGP (Prime Minister''s Employment Generation)',
    'PMEGP',
    'Credit-linked subsidy programme for setting up new micro-enterprises in manufacturing (up to ₹50 Lakh) or service sector (up to ₹20 Lakh). Provides heavy government capital subsidy on project cost.',
    NULL,
    NULL,
    100000.0,
    5000000.0,
    9.5,
    12.0,
    84,
    6,
    '["business", "micro_enterprise"]'::json,
    '["SC", "ST", "OBC", "GENERAL"]'::json,
    18,
    NULL,
    '8th_standard',
    '["Identity Proof (Aadhaar)", "Address Proof", "Caste Certificate (for SC/ST/OBC)", "Education Certificate", "Detailed Project Report", "EDP Training Certificate"]'::json,
    'SC/ST/Women/OBC: 35% capital subsidy in rural areas, 25% in urban areas. General: 25% rural, 15% urban.',
    '["PSB", "RRB"]'::json,
    'https://www.kviconline.gov.in/pmegpeportal/',
    'VERIFIED',
    True
);
INSERT INTO schemes (
    name, scheme_type, description, min_income, max_income, min_loan, max_loan,
    interest_rate, interest_rate_max, max_tenure, moratorium,
    eligible_purposes, eligible_categories, min_age, max_age, min_education,
    required_documents, subsidy_info, partner_types, source_url, data_status, active
) VALUES (
    'NSFDC Micro Finance Scheme (MFS)',
    'MICRO_CREDIT',
    'Micro Finance Scheme for small-scale income generating activities exclusively for SC individuals. Project cost up to ₹1.40 Lakh with 90% loan assistance (max ₹1.25 Lakh) at 6.5% p.a. concessional rate.',
    NULL,
    500000.0,
    5000.0,
    125000.0,
    6.5,
    NULL,
    36,
    3,
    '["business", "micro_enterprise", "self_employment", "vendors", "artisans"]'::json,
    '["SC"]'::json,
    18,
    60,
    NULL,
    '["SC Certificate", "Income Certificate (Family income under ₹5 Lakh)", "Identity Proof (Aadhaar)", "Bank Account Details", "Activity / Unit Details"]'::json,
    'Statutory 90% loan assistance up to ₹1.25 Lakh. Quarterly repayment over 3 years with 3-month moratorium.',
    '["SCA", "NBFC_MFI"]'::json,
    'https://nsfdc.nic.in/scheme',
    'VERIFIED',
    True
);
INSERT INTO schemes (
    name, scheme_type, description, min_income, max_income, min_loan, max_loan,
    interest_rate, interest_rate_max, max_tenure, moratorium,
    eligible_purposes, eligible_categories, min_age, max_age, min_education,
    required_documents, subsidy_info, partner_types, source_url, data_status, active
) VALUES (
    'NSFDC Term Loan Scheme',
    'TERM_LOAN',
    'Concessional term loan for income-generating activities costing from ₹1.40 Lakh up to ₹50.00 Lakh for SC entrepreneurs. Maximum loan assistance up to 90% of project cost (up to ₹45.00 Lakh) at 8.0% p.a.',
    NULL,
    500000.0,
    140000.0,
    4500000.0,
    8.0,
    NULL,
    84,
    6,
    '["business", "micro_enterprise", "self_employment", "agriculture"]'::json,
    '["SC"]'::json,
    18,
    60,
    NULL,
    '["SC Certificate", "Income Certificate (Family income under ₹5 Lakh)", "Identity Proof (Aadhaar)", "Detailed Project Report (DPR)", "Land/Workplace Document", "Bank Statement"]'::json,
    '90% project cost financing. Quarterly repayment over 7 years with 6-month moratorium (up to 12 months for plantation/construction).',
    '["SCA", "PSB"]'::json,
    'https://nsfdc.nic.in/scheme',
    'VERIFIED',
    True
);
INSERT INTO schemes (
    name, scheme_type, description, min_income, max_income, min_loan, max_loan,
    interest_rate, interest_rate_max, max_tenure, moratorium,
    eligible_purposes, eligible_categories, min_age, max_age, min_education,
    required_documents, subsidy_info, partner_types, source_url, data_status, active
) VALUES (
    'NSFDC Aajeevika Micro-Finance Yojana',
    'MICRO_CREDIT',
    'Micro finance credit assistance through Channel Partners and NBFC-MFIs for quick livelihood activities. Project cost up to ₹1.40 Lakh with loan assistance up to ₹1.25 Lakh at 15.0% p.a.',
    NULL,
    500000.0,
    5000.0,
    125000.0,
    15.0,
    NULL,
    36,
    3,
    '["business", "micro_enterprise", "self_employment", "vendors"]'::json,
    '["SC"]'::json,
    18,
    60,
    NULL,
    '["SC Certificate", "Income Certificate", "Aadhaar Card", "Bank Passbook"]'::json,
    'Fast-track processing for immediate micro-livelihoods via empaneled NBFC-MFIs and SCAs.',
    '["NBFC_MFI", "SCA"]'::json,
    'https://nsfdc.nic.in/scheme',
    'VERIFIED',
    True
);
INSERT INTO schemes (
    name, scheme_type, description, min_income, max_income, min_loan, max_loan,
    interest_rate, interest_rate_max, max_tenure, moratorium,
    eligible_purposes, eligible_categories, min_age, max_age, min_education,
    required_documents, subsidy_info, partner_types, source_url, data_status, active
) VALUES (
    'NSFDC Udyam Nidhi Yojana (UNY)',
    'COMPOSITE_LOAN',
    'Composite loan assistance for setting up micro-enterprises with project cost up to ₹5.00 Lakh. Maximum loan ₹4.50 Lakh at 13.0% (Co-operative Banks) to 15.0% (Small Finance Banks).',
    NULL,
    500000.0,
    50000.0,
    450000.0,
    13.0,
    15.0,
    60,
    3,
    '["business", "micro_enterprise", "self_employment", "artisans"]'::json,
    '["SC"]'::json,
    18,
    60,
    NULL,
    '["SC Certificate", "Income Certificate", "Aadhaar Card", "Brief Project Outline", "Bank Account Details"]'::json,
    'Repayment over 5 years in quarterly or half-yearly installments with a 3-month moratorium period.',
    '["RRB", "PSB", "SCA"]'::json,
    'https://nsfdc.nic.in/scheme',
    'VERIFIED',
    True
);
INSERT INTO schemes (
    name, scheme_type, description, min_income, max_income, min_loan, max_loan,
    interest_rate, interest_rate_max, max_tenure, moratorium,
    eligible_purposes, eligible_categories, min_age, max_age, min_education,
    required_documents, subsidy_info, partner_types, source_url, data_status, active
) VALUES (
    'NSFDC Educational Loan Scheme (India)',
    'EDUCATION_LOAN',
    'Concessional education loan for SC students pursuing recognized full-time professional/technical courses in India. Up to ₹40.00 Lakh (90% of course fee) at 6.0% p.a. Special 0.5% interest rebate for female students (5.5% p.a.).',
    NULL,
    500000.0,
    50000.0,
    4000000.0,
    6.0,
    NULL,
    120,
    24,
    '["education"]'::json,
    '["SC"]'::json,
    17,
    35,
    '12th_standard',
    '["SC Certificate", "Income Certificate (< ₹5 Lakh)", "Aadhaar Card", "Admission Letter", "Approved Course Fee Structure", "Mark Sheets"]'::json,
    'Female beneficiaries receive an exclusive 0.5% interest rebate (effective 5.5% p.a.). Moratorium covers full course duration + 1 year.',
    '["SCA", "PSB"]'::json,
    'https://nsfdc.nic.in/scheme',
    'VERIFIED',
    True
);
INSERT INTO schemes (
    name, scheme_type, description, min_income, max_income, min_loan, max_loan,
    interest_rate, interest_rate_max, max_tenure, moratorium,
    eligible_purposes, eligible_categories, min_age, max_age, min_education,
    required_documents, subsidy_info, partner_types, source_url, data_status, active
) VALUES (
    'NSFDC Educational Loan Scheme (Abroad)',
    'EDUCATION_LOAN',
    'Concessional education loan for SC students pursuing professional/technical higher education in approved institutions abroad. Up to ₹40.00 Lakh at 7.0% p.a. (6.5% p.a. for female students).',
    NULL,
    500000.0,
    100000.0,
    4000000.0,
    7.0,
    NULL,
    144,
    24,
    '["education"]'::json,
    '["SC"]'::json,
    17,
    35,
    'graduate',
    '["SC Certificate", "Income Certificate", "Passport & Visa", "Admission Letter", "Fee Schedule", "IELTS/GRE/GMAT Scorecard"]'::json,
    'Repayment tenure up to 12 years with course duration + 1 year moratorium. 0.5% rebate for women.',
    '["SCA", "PSB"]'::json,
    'https://nsfdc.nic.in/scheme',
    'VERIFIED',
    True
);
INSERT INTO schemes (
    name, scheme_type, description, min_income, max_income, min_loan, max_loan,
    interest_rate, interest_rate_max, max_tenure, moratorium,
    eligible_purposes, eligible_categories, min_age, max_age, min_education,
    required_documents, subsidy_info, partner_types, source_url, data_status, active
) VALUES (
    'Mukhyamantri Yuva Swavalamban Yojana (MYSY)',
    'SUBSIDY',
    'Flagship Gujarat Government higher education financial assistance scheme for students pursuing Medical (MBBS/BDS), Engineering, Pharmacy, Diploma, and Professional degree courses. Provides 50% tuition fee subsidy up to ₹2,00,000/yr, ₹1,200/month hostel allowance, and ₹10,000 book/equipment grant.',
    NULL,
    600000.0,
    10000.0,
    200000.0,
    0.0,
    NULL,
    48,
    0,
    '["education"]'::json,
    '["SC", "ST", "OBC", "GENERAL"]'::json,
    16,
    30,
    '10th_standard',
    '["Aadhaar Card", "Income Certificate (< ₹6.00 Lakh)", "10th / 12th Marksheet (80+ Percentile)", "College Admission Letter", "College Fee Receipt", "Bank Passbook", "Hostel Certificate"]'::json,
    '50% tuition subsidy (up to ₹2,00,000 for Medical, ₹50,000 for Engineering, ₹25,000 for Degree, ₹10,000 for Diploma) + ₹12,000/yr hostel lodging + ₹10,000 instrument grant.',
    '["SCA", "PSB"]'::json,
    'https://mysy.guj.nic.in',
    'VERIFIED',
    True
);
INSERT INTO schemes (
    name, scheme_type, description, min_income, max_income, min_loan, max_loan,
    interest_rate, interest_rate_max, max_tenure, moratorium,
    eligible_purposes, eligible_categories, min_age, max_age, min_education,
    required_documents, subsidy_info, partner_types, source_url, data_status, active
) VALUES (
    'Digital Gujarat Post-Matric Scholarship',
    'SUBSIDY',
    'Universal higher education scholarship portal by Government of Gujarat for SC, ST, and SEBC students enrolled in ITI, Polytechnic, Undergrad, Postgraduate, and PhD courses. Reimburses 100% compulsory tuition and examination fees plus monthly maintenance stipends.',
    NULL,
    250000.0,
    5000.0,
    150000.0,
    0.0,
    NULL,
    12,
    0,
    '["education"]'::json,
    '["SC", "ST", "OBC"]'::json,
    15,
    35,
    '10th_standard',
    '["Aadhaar Card", "Caste Certificate", "Income Certificate", "Previous Year Marksheet", "College Fee Receipt", "College Bonafide Certificate", "Bank Passbook"]'::json,
    '100% tuition and examination fee waiver directly credited to Aadhaar-seeded bank account via Direct Benefit Transfer (DBT) plus monthly maintenance allowance.',
    '["SCA"]'::json,
    'https://www.digitalgujarat.gov.in',
    'VERIFIED',
    True
);
INSERT INTO schemes (
    name, scheme_type, description, min_income, max_income, min_loan, max_loan,
    interest_rate, interest_rate_max, max_tenure, moratorium,
    eligible_purposes, eligible_categories, min_age, max_age, min_education,
    required_documents, subsidy_info, partner_types, source_url, data_status, active
) VALUES (
    'Dr. Ambedkar Foreign Study Loan (Gujarat GSCDC)',
    'EDUCATION_LOAN',
    'Concessional foreign study loan administered by Gujarat Scheduled Castes Development Corporation (GSCDC) for SC students pursuing postgraduate diplomas, Master''s degrees, or PhD programs in accredited universities abroad.',
    NULL,
    600000.0,
    100000.0,
    1500000.0,
    4.0,
    NULL,
    120,
    24,
    '["education"]'::json,
    '["SC"]'::json,
    18,
    35,
    'graduate',
    '["Aadhaar Card", "Caste Certificate", "Income Certificate (< ₹6.00 Lakh)", "Foreign University Admission Letter", "Valid Passport & Student Visa", "I-20 / CAS Certificate", "Bank Statement"]'::json,
    'Concessional 4.0% interest rate (3.5% for female students). Repayment begins 1 year after graduation or 6 months after securing employment.',
    '["SCA", "PSB"]'::json,
    'https://gscdc.gujarat.gov.in',
    'VERIFIED',
    True
);
INSERT INTO schemes (
    name, scheme_type, description, min_income, max_income, min_loan, max_loan,
    interest_rate, interest_rate_max, max_tenure, moratorium,
    eligible_purposes, eligible_categories, min_age, max_age, min_education,
    required_documents, subsidy_info, partner_types, source_url, data_status, active
) VALUES (
    'Kanya Kelavani Nidhi Higher Education Grant',
    'SUBSIDY',
    'Specialized Gujarat state education welfare scheme providing full financial tuition grant to female students from backward and economically weaker classes admitted to recognized medical, engineering, nursing, and professional institutes in Gujarat.',
    NULL,
    600000.0,
    20000.0,
    600000.0,
    0.0,
    NULL,
    60,
    0,
    '["education"]'::json,
    '["SC", "ST", "OBC", "GENERAL"]'::json,
    17,
    30,
    '12th_standard',
    '["Aadhaar Card", "12th Marksheet", "Income Certificate", "College Admission Letter", "Approved Fee Structure", "Bank Passbook", "Gujarat Domicile Certificate"]'::json,
    '100% financial tuition grant / interest-free financial support for female students throughout the course duration.',
    '["SCA"]'::json,
    'https://kanyadan.gujarat.gov.in',
    'VERIFIED',
    True
);
INSERT INTO schemes (
    name, scheme_type, description, min_income, max_income, min_loan, max_loan,
    interest_rate, interest_rate_max, max_tenure, moratorium,
    eligible_purposes, eligible_categories, min_age, max_age, min_education,
    required_documents, subsidy_info, partner_types, source_url, data_status, active
) VALUES (
    'Central Sector Interest Subsidy (CSIS) on Education Loans',
    'SUBSIDY',
    'Ministry of Education (Govt. of India) scheme providing full 100% interest subsidy during the moratorium period (course tenure + 1 year) on educational loans availed from scheduled banks for professional and technical courses in India.',
    NULL,
    450000.0,
    50000.0,
    1000000.0,
    0.0,
    NULL,
    120,
    24,
    '["education"]'::json,
    '["SC", "ST", "OBC", "GENERAL"]'::json,
    17,
    35,
    '12th_standard',
    '["Aadhaar Card", "Income Certificate (< ₹4.50 Lakh)", "Bank Loan Sanction Letter", "College Bonafide Certificate", "Marksheets"]'::json,
    '100% interest subsidy reimbursed by Central Government during study and 1-year moratorium, leaving zero interest payable by student during studies.',
    '["PSB", "RRB"]'::json,
    'https://www.education.gov.in/csis',
    'VERIFIED',
    True
);
INSERT INTO schemes (
    name, scheme_type, description, min_income, max_income, min_loan, max_loan,
    interest_rate, interest_rate_max, max_tenure, moratorium,
    eligible_purposes, eligible_categories, min_age, max_age, min_education,
    required_documents, subsidy_info, partner_types, source_url, data_status, active
) VALUES (
    'PM SVANidhi (PM Street Vendor''s AtmaNirbhar Nidhi)',
    'MICRO_CREDIT',
    'Ministry of Housing and Urban Affairs micro-credit facility empowering urban street vendors, hawkers, thela-walas, and micro-traders. Offers collateral-free working capital in 3 progressive tranches: ₹10,000 (1st), ₹20,000 (2nd), and up to ₹50,000 (3rd tranche). Features an attractive 7% interest subsidy on regular repayments and up to ₹1,200/year cashback on digital UPI transactions.',
    NULL,
    300000.0,
    10000.0,
    50000.0,
    7.0,
    9.5,
    36,
    0,
    '["vendors", "micro_enterprise", "self_employment", "business"]'::json,
    '["SC", "ST", "OBC", "GENERAL"]'::json,
    18,
    65,
    NULL,
    '["Aadhaar Card", "Vending Certificate / Urban Local Body (ULB) Identity Card", "Letter of Recommendation (LoR) from Town Vending Committee (TVC)", "Bank Account Passbook with IFSC", "Passport Size Photograph"]'::json,
    '7% interest subsidy directly credited quarterly via DBT. Monthly digital cashback up to ₹100 for digital UPI transactions (up to ₹1,200 annually).',
    '["PSB", "RRB", "NBFC_MFI"]'::json,
    'https://pmsvanidhi.mohua.gov.in',
    'VERIFIED',
    True
);
INSERT INTO schemes (
    name, scheme_type, description, min_income, max_income, min_loan, max_loan,
    interest_rate, interest_rate_max, max_tenure, moratorium,
    eligible_purposes, eligible_categories, min_age, max_age, min_education,
    required_documents, subsidy_info, partner_types, source_url, data_status, active
) VALUES (
    'Mahila Samriddhi Yojana (NSFDC MSY)',
    'MICRO_CREDIT',
    'NSFDC''s flagship micro-credit assistance exclusively for Scheduled Caste women entrepreneurs and self-help groups. Provides financial support up to ₹1,40,000 per woman at a highly subsidized 3.50% effective interest rate (4.0% statutory rate with automatic 0.50% female rebate). Includes a 6-month moratorium to assist business ramp-up.',
    NULL,
    300000.0,
    10000.0,
    140000.0,
    3.5,
    NULL,
    42,
    6,
    '["business", "micro_enterprise", "artisans", "vendors"]'::json,
    '["SC"]'::json,
    18,
    55,
    NULL,
    '["Aadhaar Card", "Caste Certificate (SC)", "Income Certificate (< ₹3.00 Lakh)", "Detailed Project Report (DPR) / Business Proposal", "Supplier Quotations & Proforma Invoices", "Bank Passbook & 6-Month Account Statement"]'::json,
    'Effective 3.50% p.a. interest rate with female concession. Up to 100% project cost covered without mandatory promoter margin money.',
    '["SCA", "RRB", "NBFC_MFI"]'::json,
    'https://nsfdc.nic.in',
    'VERIFIED',
    True
);
INSERT INTO schemes (
    name, scheme_type, description, min_income, max_income, min_loan, max_loan,
    interest_rate, interest_rate_max, max_tenure, moratorium,
    eligible_purposes, eligible_categories, min_age, max_age, min_education,
    required_documents, subsidy_info, partner_types, source_url, data_status, active
) VALUES (
    'Shri Vajpayee Bankable Yojana (Gujarat SVBY)',
    'COMPOSITE_LOAN',
    'Cottage and Village Industries Department (Government of Gujarat) scheme designed to generate self-employment for urban and rural unemployed individuals, artisans, and service providers. Provides financial assistance up to ₹8.00 Lakh for industries, ₹8.00 Lakh for services, and ₹4.00 Lakh for retail businesses, with generous capital subsidies up to 40% (max ₹1.25 Lakh) for SC/ST and women applicants.',
    NULL,
    500000.0,
    25000.0,
    800000.0,
    8.0,
    10.5,
    60,
    6,
    '["business", "artisans", "micro_enterprise"]'::json,
    '["SC", "ST", "OBC", "GENERAL"]'::json,
    18,
    65,
    '4th_standard',
    '["Aadhaar Card", "Caste / Community Certificate", "Certified Family Income Certificate", "Academic Marksheets & Passing Certificates", "Detailed Project Report (DPR) / Business Proposal", "Supplier Quotations & Proforma Invoices", "Bank Passbook & 6-Month Account Statement"]'::json,
    'SC/ST/Women/Minority: 40% subsidy in rural areas (max ₹1,25,000) and 37.5% in urban areas (max ₹1,00,000). General category: 25% (max ₹1,00,000 rural, ₹80,000 urban).',
    '["PSB", "RRB", "SCA"]'::json,
    'https://cottage.gujarat.gov.in',
    'VERIFIED',
    True
);
INSERT INTO schemes (
    name, scheme_type, description, min_income, max_income, min_loan, max_loan,
    interest_rate, interest_rate_max, max_tenure, moratorium,
    eligible_purposes, eligible_categories, min_age, max_age, min_education,
    required_documents, subsidy_info, partner_types, source_url, data_status, active
) VALUES (
    'PM Formalisation of Micro food processing Enterprises (PMFME)',
    'SUBSIDY',
    'Ministry of Food Processing Industries (MoFPI) flagship initiative under Atmanirbhar Bharat Abhiyan. Provides 35% credit-linked capital subsidy (up to ₹10.00 Lakh) for establishment or upgradation of micro food processing units (e.g. spice grinding, flour mill, pickle & chutney, dairy products, bakery, oil expeller, fruit pulp processing).',
    NULL,
    NULL,
    100000.0,
    3000000.0,
    8.5,
    11.0,
    84,
    12,
    '["agriculture", "business", "micro_enterprise"]'::json,
    '["SC", "ST", "OBC", "GENERAL"]'::json,
    18,
    60,
    '8th_standard',
    '["Aadhaar Card", "Detailed Project Report (DPR) / Business Proposal", "Supplier Quotations & Proforma Invoices", "FSSAI Registration / Food Business License", "Bank Passbook & 6-Month Account Statement", "Udyam MSME Registration Certificate"]'::json,
    '35% credit-linked capital subsidy of eligible project cost with a maximum ceiling of ₹10,00,000 per enterprise. Beneficiary contribution is minimum 10%.',
    '["PSB", "RRB"]'::json,
    'https://pmfme.mofpi.gov.in',
    'VERIFIED',
    True
);
INSERT INTO schemes (
    name, scheme_type, description, min_income, max_income, min_loan, max_loan,
    interest_rate, interest_rate_max, max_tenure, moratorium,
    eligible_purposes, eligible_categories, min_age, max_age, min_education,
    required_documents, subsidy_info, partner_types, source_url, data_status, active
) VALUES (
    'Dhibar Yojana (Fisheries & Water Body Livelihood)',
    'TERM_LOAN',
    'NSFDC specialized financial assistance scheme supporting traditional fisheries, aquaculture, and water-body based livelihoods for Scheduled Caste families. Provides concessional financing up to ₹15.00 Lakh at 6.00% p.a. (5.50% p.a. for fisherwomen) with seasonal 6-9 months moratorium for procurement of fiberglass boats, mechanized engines, fishing nets, and cold storage iceboxes.',
    NULL,
    500000.0,
    50000.0,
    1500000.0,
    6.0,
    NULL,
    60,
    9,
    '["agriculture", "business", "micro_enterprise"]'::json,
    '["SC"]'::json,
    18,
    55,
    NULL,
    '["Aadhaar Card", "Caste / Community Certificate", "Certified Family Income Certificate", "Supplier Quotations & Proforma Invoices", "Bank Passbook & 6-Month Account Statement"]'::json,
    'Concessional 6.0% p.a. interest rate with 0.5% female rebate (5.50% p.a.). Seasonal moratorium aligns with breeding and monsoon ban periods.',
    '["SCA", "PSB", "RRB"]'::json,
    'https://nsfdc.nic.in',
    'VERIFIED',
    True
);
INSERT INTO schemes (
    name, scheme_type, description, min_income, max_income, min_loan, max_loan,
    interest_rate, interest_rate_max, max_tenure, moratorium,
    eligible_purposes, eligible_categories, min_age, max_age, min_education,
    required_documents, subsidy_info, partner_types, source_url, data_status, active
) VALUES (
    'Kisan Credit Card (KCC - Animal Husbandry & Dairy)',
    'MICRO_CREDIT',
    'Government of India subsidized short-term working capital credit for dairy farmers, goat rearing, poultry, and animal husbandry producers. Loan limit up to ₹2.00 Lakh with zero collateral at an effective interest rate of 4.00% p.a. (7% base rate with 3% prompt repayment incentive).',
    NULL,
    NULL,
    20000.0,
    200000.0,
    4.0,
    7.0,
    36,
    0,
    '["agriculture", "self_employment"]'::json,
    '["SC", "ST", "OBC", "GENERAL"]'::json,
    18,
    70,
    NULL,
    '["Aadhaar Card", "Agricultural Land Records (7/12 & 8A Extracts)", "Veterinary Certificate & Animal Health / Tagging Record", "Bank Passbook & 6-Month Account Statement"]'::json,
    'Effective interest rate of only 4% per annum upon prompt yearly repayment (Government provides 3% prompt repayment interest subvention).',
    '["PSB", "RRB"]'::json,
    'https://dahd.nic.in',
    'VERIFIED',
    True
);
INSERT INTO schemes (
    name, scheme_type, description, min_income, max_income, min_loan, max_loan,
    interest_rate, interest_rate_max, max_tenure, moratorium,
    eligible_purposes, eligible_categories, min_age, max_age, min_education,
    required_documents, subsidy_info, partner_types, source_url, data_status, active
) VALUES (
    'Mukhyamantri Mahila Utkarsh Yojana (MMUY Gujarat)',
    'SUBSIDY',
    'Gujarat state scheme providing 0% interest loans up to ₹1,00,000 to Joint Liability and Self-Help Groups (JLGs) of women in urban and rural areas. The entire bank interest is borne directly by the Gujarat State Government as an interest subsidy, enabling women to start home-based enterprises and handicraft trades.',
    NULL,
    400000.0,
    10000.0,
    100000.0,
    0.0,
    NULL,
    36,
    0,
    '["business", "micro_enterprise", "self_employment", "artisans"]'::json,
    '["SC", "ST", "OBC", "GENERAL"]'::json,
    18,
    59,
    NULL,
    '["Aadhaar Card", "Bank Passbook & 6-Month Account Statement", "Certified Family Income Certificate"]'::json,
    '100% interest subsidy paid directly to financing bank by Gujarat State Government; loan is completely interest-free (0% interest) for beneficiaries.',
    '["PSB", "RRB", "SCA"]'::json,
    'https://gswan.gov.in',
    'VERIFIED',
    True
);
INSERT INTO schemes (
    name, scheme_type, description, min_income, max_income, min_loan, max_loan,
    interest_rate, interest_rate_max, max_tenure, moratorium,
    eligible_purposes, eligible_categories, min_age, max_age, min_education,
    required_documents, subsidy_info, partner_types, source_url, data_status, active
) VALUES (
    'National SC-ST Hub (NSSH) Special Capital Subsidy (SCLCSS)',
    'SUBSIDY',
    'Ministry of Micro, Small and Medium Enterprises (MSME) flagship scheme offering 25% upfront capital subsidy (up to ₹25.00 Lakh) on institutional credit availed by SC/ST entrepreneurs for procurement of modern plant, machinery, testing equipment, and technology upgrade.',
    NULL,
    NULL,
    200000.0,
    10000000.0,
    8.0,
    10.5,
    84,
    12,
    '["business", "micro_enterprise"]'::json,
    '["SC", "ST"]'::json,
    18,
    NULL,
    NULL,
    '["Aadhaar Card", "Caste / Community Certificate", "Udyam MSME Registration Certificate", "Detailed Project Report (DPR) / Business Proposal", "Supplier Quotations & Proforma Invoices", "Bank Passbook & 6-Month Account Statement"]'::json,
    '25% upfront capital subsidy on plant & machinery purchase up to a ceiling of ₹25 Lakh directly credited to borrower''s term loan account.',
    '["PSB", "SCA"]'::json,
    'https://www.scsthub.in',
    'VERIFIED',
    True
);

-- ==========================================================
-- SEED CHANNEL PARTNERS (10 Channel Partners)
-- ==========================================================
INSERT INTO channel_partners (
    name, type, address, state, district, pincode,
    latitude, longitude, supported_schemes, active, capacity_status,
    phone, email, npa_rate, fund_utilization, avg_processing_days, working_hours
) VALUES (
    'Gujarat Scheduled Castes Development Corporation (GSCDC)',
    'SCA',
    'Block No. 4, Dr. Jivraj Mehta Bhavan, Old Sachivalaya, Gandhinagar',
    'Gujarat',
    'Gandhinagar',
    '382010',
    23.2156,
    72.6369,
    '["NSFDC Term Loan", "NSFDC Micro Credit Finance", "NSFDC Education Loan", "PM Vishwakarma Yojana"]'::json,
    True,
    'AVAILABLE',
    '079-23253301',
    'contact@gscdc.gujarat.gov.in',
    3.2,
    85.0,
    14,
    'Mon-Fri 09:30 - 17:30'
);
INSERT INTO channel_partners (
    name, type, address, state, district, pincode,
    latitude, longitude, supported_schemes, active, capacity_status,
    phone, email, npa_rate, fund_utilization, avg_processing_days, working_hours
) VALUES (
    'State Bank of India - Ahmedabad Main Branch',
    'PSB',
    'Bhadra, Near Lal Darwaja, Ahmedabad',
    'Gujarat',
    'Ahmedabad',
    '380001',
    23.0225,
    72.5714,
    '["Pradhan Mantri MUDRA Yojana (PMMY)", "Stand-Up India Scheme", "PMEGP (Prime Minister''s Employment Generation)", "PM Surya Ghar: Muft Bijli Yojana"]'::json,
    True,
    'AVAILABLE',
    '079-25507421',
    'sbi.03011@sbi.co.in',
    3.2,
    85.0,
    14,
    'Mon-Fri 09:30 - 17:30'
);
INSERT INTO channel_partners (
    name, type, address, state, district, pincode,
    latitude, longitude, supported_schemes, active, capacity_status,
    phone, email, npa_rate, fund_utilization, avg_processing_days, working_hours
) VALUES (
    'Bank of Baroda - Vadodara Alkapuri Branch',
    'PSB',
    'Baroda Bhavan, R.C. Dutt Road, Alkapuri, Vadodara',
    'Gujarat',
    'Vadodara',
    '390007',
    22.3107,
    73.1812,
    '["Pradhan Mantri MUDRA Yojana (PMMY)", "Stand-Up India Scheme", "PM Vishwakarma Yojana", "PMEGP (Prime Minister''s Employment Generation)"]'::json,
    True,
    'AVAILABLE',
    '0265-2316400',
    'alkapu@bankofbaroda.com',
    3.2,
    85.0,
    14,
    'Mon-Fri 09:30 - 17:30'
);
INSERT INTO channel_partners (
    name, type, address, state, district, pincode,
    latitude, longitude, supported_schemes, active, capacity_status,
    phone, email, npa_rate, fund_utilization, avg_processing_days, working_hours
) VALUES (
    'Baroda Gujarat Gramin Bank - Surat City',
    'RRB',
    'Ring Road, Surat Textile Market, Surat',
    'Gujarat',
    'Surat',
    '395002',
    21.1702,
    72.8311,
    '["Pradhan Mantri MUDRA Yojana (PMMY)", "PM Vishwakarma Yojana", "PM-KISAN", "Atal Pension Yojana (APY)"]'::json,
    True,
    'AVAILABLE',
    '0261-2475689',
    'surat@bggb.co.in',
    3.2,
    85.0,
    14,
    'Mon-Fri 09:30 - 17:30'
);
INSERT INTO channel_partners (
    name, type, address, state, district, pincode,
    latitude, longitude, supported_schemes, active, capacity_status,
    phone, email, npa_rate, fund_utilization, avg_processing_days, working_hours
) VALUES (
    'Saurashtra Gramin Bank - Rajkot Central',
    'RRB',
    'Dhebar Road, Opp. Municipal Corporation, Rajkot',
    'Gujarat',
    'Rajkot',
    '360001',
    22.3039,
    70.8022,
    '["Pradhan Mantri MUDRA Yojana (PMMY)", "PM-KISAN", "PM Shram Yogi Maan-dhan (PM-SYM)", "NSFDC Micro Credit Finance"]'::json,
    True,
    'AVAILABLE',
    '0281-2234011',
    'rajkot@sgbrrb.org',
    3.2,
    85.0,
    14,
    'Mon-Fri 09:30 - 17:30'
);
INSERT INTO channel_partners (
    name, type, address, state, district, pincode,
    latitude, longitude, supported_schemes, active, capacity_status,
    phone, email, npa_rate, fund_utilization, avg_processing_days, working_hours
) VALUES (
    'Punjab National Bank - Mehsana Branch',
    'PSB',
    'Radhanpur Road, Mehsana',
    'Gujarat',
    'Mehsana',
    '384002',
    23.588,
    72.3693,
    '["PMEGP (Prime Minister''s Employment Generation)", "Pradhan Mantri MUDRA Yojana (PMMY)", "PM Surya Ghar: Muft Bijli Yojana"]'::json,
    True,
    'AVAILABLE',
    '02762-252119',
    'bo1244@pnb.co.in',
    3.2,
    85.0,
    14,
    'Mon-Fri 09:30 - 17:30'
);
INSERT INTO channel_partners (
    name, type, address, state, district, pincode,
    latitude, longitude, supported_schemes, active, capacity_status,
    phone, email, npa_rate, fund_utilization, avg_processing_days, working_hours
) VALUES (
    'Arohan Financial Services (NBFC-MFI) - Ahmedabad',
    'NBFC_MFI',
    'Naroda Commercial Centre, Naroda, Ahmedabad',
    'Gujarat',
    'Ahmedabad',
    '382330',
    23.0694,
    72.6582,
    '["NSFDC Micro Credit Finance", "Pradhan Mantri MUDRA Yojana (PMMY)"]'::json,
    True,
    'AVAILABLE',
    '079-22810542',
    'ahmedabad@arohan.in',
    3.2,
    85.0,
    14,
    'Mon-Fri 09:30 - 17:30'
);
INSERT INTO channel_partners (
    name, type, address, state, district, pincode,
    latitude, longitude, supported_schemes, active, capacity_status,
    phone, email, npa_rate, fund_utilization, avg_processing_days, working_hours
) VALUES (
    'District Industries Centre (DIC) - Ahmedabad',
    'SCA',
    'Bahumali Bhavan, Drive-in Road, Memnagar, Ahmedabad',
    'Gujarat',
    'Ahmedabad',
    '380052',
    23.0524,
    72.5312,
    '["PMEGP (Prime Minister''s Employment Generation)", "PM Vishwakarma Yojana", "Stand-Up India Scheme"]'::json,
    True,
    'AVAILABLE',
    '079-27491024',
    'dic-ahm@gujarat.gov.in',
    3.2,
    85.0,
    14,
    'Mon-Fri 09:30 - 17:30'
);
INSERT INTO channel_partners (
    name, type, address, state, district, pincode,
    latitude, longitude, supported_schemes, active, capacity_status,
    phone, email, npa_rate, fund_utilization, avg_processing_days, working_hours
) VALUES (
    'Canara Bank - Bhavnagar Main',
    'PSB',
    'Waghawadi Road, Bhavnagar',
    'Gujarat',
    'Bhavnagar',
    '364002',
    21.7645,
    72.1519,
    '["Pradhan Mantri MUDRA Yojana (PMMY)", "Stand-Up India Scheme", "PMAY 2.0"]'::json,
    True,
    'AVAILABLE',
    '0278-2512801',
    'cb1502@canarabank.com',
    3.2,
    85.0,
    14,
    'Mon-Fri 09:30 - 17:30'
);
INSERT INTO channel_partners (
    name, type, address, state, district, pincode,
    latitude, longitude, supported_schemes, active, capacity_status,
    phone, email, npa_rate, fund_utilization, avg_processing_days, working_hours
) VALUES (
    'Union Bank of India - Jamnagar City',
    'PSB',
    'Pandit Nehru Marg, Jamnagar',
    'Gujarat',
    'Jamnagar',
    '361008',
    22.4707,
    70.0577,
    '["Pradhan Mantri MUDRA Yojana (PMMY)", "PM-KISAN", "PM Surya Ghar: Muft Bijli Yojana"]'::json,
    True,
    'AVAILABLE',
    '0288-2554412',
    'jamnagar@unionbankofindia.bank',
    3.2,
    85.0,
    14,
    'Mon-Fri 09:30 - 17:30'
);

-- ==========================================================
-- SEED AI KNOWLEDGE BASE (13 Trained Q&As)
-- ==========================================================
INSERT INTO ai_knowledge (question, keywords, answer, category, is_active)
VALUES (
    'What is NSFDC and what does it do?',
    '["nsfdc", "what is nsfdc", "about nsfdc", "full form of nsfdc", "mandate"]'::json,
    '**NSFDC (National Scheduled Castes Finance and Development Corporation)** is a Government of India apex corporation operating under the Ministry of Social Justice & Empowerment since 1989.

**Key Highlights:**
• **Mission:** To empower Scheduled Caste entrepreneurs and artisans through concessional loans and vocational skill development.
• **Concessional Interest Rates:** Official interest rates range from **3.5% to 8.0% per annum** (reducing balance).
• **Statutory Female Rebate:** Women beneficiaries receive an automatic **0.50% interest rate rebate**.
• **Disbursement Channel:** NSFDC partners with State Channelizing Agencies (SCAs)—such as GSCDC in Gujarat—and Regional Rural Banks (RRBs) to disburse funds locally.',
    'SCHEMES',
    TRUE
);
INSERT INTO ai_knowledge (question, keywords, answer, category, is_active)
VALUES (
    'What documents are required to apply for a loan?',
    '["documents", "document", "paper", "papers", "proof", "checklist", "certificate"]'::json,
    'To apply for a statutory loan under NSFDC and government credit schemes, prepare the following **6 essential documents**:

1. **Proof of Identity & Address:** Aadhaar Card, PAN Card, or Voter ID.
2. **Caste Certificate:** Official community certificate issued by the competent revenue authority (Tahsildar / Sub-Divisional Magistrate).
3. **Income Certificate:** Certified family income certificate showing annual income within the statutory ceiling (up to ₹3.00 Lakh for micro loans, up to ₹5.00 Lakh for education).
4. **Project Proposal (DPR):** Brief project report describing your business activity, machinery cost, and working capital needs.
5. **Supplier Quotations:** Official proforma invoices/quotations from GST-registered vendors for equipment, vehicles, or livestock.
6. **Bank Account Details:** Active bank passbook with IFSC code and past 6 months bank statement.',
    'DOCUMENTS',
    TRUE
);
INSERT INTO ai_knowledge (question, keywords, answer, category, is_active)
VALUES (
    'What is the annual income limit for NSFDC schemes?',
    '["income limit", "income criteria", "income ceiling", "salary limit", "how much income"]'::json,
    'Under statutory guidelines established by NSFDC and the Ministry of Social Justice & Empowerment:

• **Micro & Self-Employment Loans:** The family annual income ceiling is generally **₹3,00,000 per annum** for both rural and urban areas.
• **Education & Specialized Schemes:** The family annual income limit extends up to **₹5,00,000 per annum**.
• **Artisan & Cluster Schemes:** Some targeted artisan clusters (e.g. PM Vishwakarma) evaluate traditional skill certification with relaxed income ceilings.

If your annual family income is within ₹5,00,000, you qualify for statutory concessional interest rates (as low as 3.5% - 6.0% p.a.).',
    'ELIGIBILITY',
    TRUE
);
INSERT INTO ai_knowledge (question, keywords, answer, category, is_active)
VALUES (
    'How does EMI calculation and the moratorium work?',
    '["emi", "moratorium", "grace period", "repayment holiday", "calculate emi", "reducing balance"]'::json,
    'Here is how loan repayment and statutory grace periods work on UdyamSathi:

• **Reducing Balance EMI:** Unlike flat-rate informal credit, interest is calculated strictly on the remaining principal balance, lowering your monthly interest as you make repayments.
• **Moratorium (Repayment Holiday):** NSFDC schemes provide a statutory moratorium of **3 to 12 months** (up to 6 months for Mahila Samriddhi, up to 1 year for education loans). During this period, you only pay nominal interest (or interest is deferred) while your enterprise is getting established.
• **Female Rebate:** Female entrepreneurs receive a **0.50% interest concession**, which directly reduces the monthly EMI.

You can simulate your exact monthly schedule on our **[EMI Calculator](/calculator)**.',
    'EMI_REPAYMENT',
    TRUE
);
INSERT INTO ai_knowledge (question, keywords, answer, category, is_active)
VALUES (
    'What is the Mahila Samriddhi Yojana (MSY)?',
    '["mahila samriddhi", "msy", "women scheme", "women loan", "female entrepreneur"]'::json,
    '**Mahila Samriddhi Yojana (MSY)** is NSFDC''s flagship micro-credit program empowering women entrepreneurs from Scheduled Caste families:

• **Maximum Loan Assistance:** Up to **₹1,40,000** per beneficiary.
• **Concessional Interest Rate:** Base rate is 4.0% p.a.; with the statutory **0.5% female rebate**, the effective rate is just **3.50% per annum**.
• **Moratorium (Grace Period):** **6 months** repayment holiday to establish steady business cash flows.
• **Repayment Tenure:** Up to **3.5 years** in easy quarterly or monthly installments.
• **Eligible Trades:** Tailoring, garment shop, beauty parlor, grocery store, handicraft, dairy products, and food processing.',
    'SCHEMES',
    TRUE
);
INSERT INTO ai_knowledge (question, keywords, answer, category, is_active)
VALUES (
    'What is Dhibar Yojana and who is eligible?',
    '["dhibar", "fisheries", "fishing", "fish", "fishermen", "water body"]'::json,
    '**Dhibar Yojana** is NSFDC''s specialized financial assistance program supporting traditional fisheries and water-body livelihoods:

• **Maximum Assistance:** Up to **₹5,00,000** per beneficiary.
• **Concessional Interest Rate:** **6.00% per annum** (5.50% p.a. for female fisherwomen).
• **Moratorium:** **6 to 9 months** to align with fishing and breeding seasons.
• **Repayment Period:** Up to **5 years**.
• **Eligible Activities:** Purchase of modern fishing nets, fiberglass boats, cold storage boxes, motorized crafts, and pond fish culture.',
    'SCHEMES',
    TRUE
);
INSERT INTO ai_knowledge (question, keywords, answer, category, is_active)
VALUES (
    'How can I get an education loan under NSFDC?',
    '["education loan", "btech", "mbbs", "college loan", "study loan", "degree loan", "study abroad"]'::json,
    '**NSFDC Education Loan Scheme** provides subsidized higher education credit for students from Scheduled Caste families:

• **Maximum Assistance:** Up to **₹20,00,000** for professional degree courses in India, and up to **₹30,00,000** for recognized courses abroad.
• **Subsidized Interest Rate:** Just **4.00% per annum** (Effective **3.50% p.a.** for female students).
• **Statutory Income Limit:** Relaxed income ceiling up to **₹5,00,000 per annum**.
• **Moratorium Period:** Entire course duration plus **6 months** after securing employment (or 1 year after graduation, whichever is earlier).
• **Eligible Expenses:** College tuition fees, examination fees, hostel/boarding charges, textbooks, and computer/laptop.',
    'SCHEMES',
    TRUE
);
INSERT INTO ai_knowledge (question, keywords, answer, category, is_active)
VALUES (
    'What are Channel Partners and State Channelizing Agencies (SCAs)?',
    '["channel partner", "channel partners", "sca", "branch", "bank list", "ahmedabad", "gujarat branch"]'::json,
    'NSFDC does not disburse funds directly from its headquarters; loans are channeled through authorized local partners:

• **State Channelizing Agencies (SCAs):** State government corporations dedicated to SC welfare (e.g. **GSCDC - Gujarat Scheduled Castes Development Corporation** in Gujarat).
• **Regional Rural Banks (RRBs):** Bank of Baroda-sponsored Baroda Gujarat Gramin Bank, Saurashtra Gramin Bank, etc.
• **Public Sector Banks:** SBI, PNB, Canara Bank, and Union Bank.

**Branch Routing Tip:** On UdyamSathi''s **[Channel Partners page](/partners)**, partners are scored by recovery health, ensuring you are directed to solvent branches with active disbursement quotas.',
    'GENERAL',
    TRUE
);
INSERT INTO ai_knowledge (question, keywords, answer, category, is_active)
VALUES (
    'What is MYSY (Mukhyamantri Yuva Swavalamban Yojana) in Gujarat?',
    '["mysy", "mukhyamantri yuva swavalamban yojana", "gujarat scholarship", "engineering scholarship", "medical scholarship", "hostel allowance"]'::json,
    '**Mukhyamantri Yuva Swavalamban Yojana (MYSY)** is Gujarat''s premier education financial assistance scheme for students from economically weaker sections:

• **Eligibility:** 80th percentile or above in 10th/12th board exams, with family annual income up to **₹6,00,000**.
• **Tuition Fee Assistance (50% Subsidy):**
  - **Medical (MBBS/BDS):** Up to **₹2,00,000 per year**.
  - **Engineering, Pharmacy & Tech:** Up to **₹50,000 per year**.
  - **Degree Courses (B.Sc, B.Com, BA):** Up to **₹25,000 per year**.
  - **Diploma Courses:** Up to **₹10,000 per year**.
• **Hostel Lodging Assistance:** **₹1,200 per month** (₹12,000 per year) for students studying outside their home taluka.
• **Book & Instrument Grant:** One-time grant of **₹10,000** for medical/dental/engineering, and **₹5,000** for diploma students.
• **Official Portal:** Apply directly at **[mysy.guj.nic.in](https://mysy.guj.nic.in)**.',
    'SCHEMES',
    TRUE
);
INSERT INTO ai_knowledge (question, keywords, answer, category, is_active)
VALUES (
    'What is the Digital Gujarat Post-Matric Scholarship?',
    '["digital gujarat", "post matric scholarship", "sc scholarship", "st scholarship", "sebc scholarship", "digital gujarat portal"]'::json,
    '**Digital Gujarat Post-Matric Scholarship** provides 100% financial tuition reimbursement and living allowances for SC, ST, and SEBC/OBC students:

• **Eligibility:** SC/ST students with family annual income up to **₹2,50,000** (SEBC/EWS income limits vary between ₹1.00L to ₹2.50L).
• **100% Fee Coverage:** All compulsory, non-refundable tuition and examination fees charged by colleges/universities are reimbursed directly to the student via DBT.
• **Monthly Maintenance Stipend:** Monthly living stipend credited directly into Aadhaar-seeded bank accounts (rates higher for hostellers than day scholars).
• **Covered Courses:** ITI, Polytechnic Diplomas, UG degrees (BA, B.Com, B.Sc, B.Tech, MBBS), Masters (MA, M.Sc, M.Tech, MBA), M.Phil, and PhD.
• **Official Portal:** Apply online on the **[Digital Gujarat Portal](https://www.digitalgujarat.gov.in)**.',
    'SCHEMES',
    TRUE
);
INSERT INTO ai_knowledge (question, keywords, answer, category, is_active)
VALUES (
    'What is PM SVANidhi and how does it help street vendors?',
    '["svanidhi", "pm svanidhi", "street vendor", "hawker", "thela", "working capital vendor"]'::json,
    '**PM SVANidhi (PM Street Vendor''s AtmaNirbhar Nidhi)** is a specialized micro-credit program empowering urban street vendors:

• **Collateral-Free Loan Limits:**
  - **1st Tranche:** Up to **₹10,000** (1 year tenure).
  - **2nd Tranche:** Up to **₹20,000** (upon on-time repayment of 1st loan).
  - **3rd Tranche:** Up to **₹50,000** (36 months tenure).
• **7.00% Interest Subsidy:** Direct quarterly interest subsidy paid via DBT, reducing effective interest rate.
• **Digital Cashback:** Earn up to **₹100/month** (₹1,200/year) on UPI digital customer transactions.
• **Key Documents:** Aadhaar Card, Vending Certificate / Town Vending Committee (TVC) Letter of Recommendation (LoR), and Bank Passbook.',
    'SCHEMES',
    TRUE
);
INSERT INTO ai_knowledge (question, keywords, answer, category, is_active)
VALUES (
    'What is Shri Vajpayee Bankable Yojana (SVBY) in Gujarat?',
    '["vajpayee bankable", "svby", "gujarat cottage scheme", "artisans gujarat", "cottage industry"]'::json,
    '**Shri Vajpayee Bankable Yojana (SVBY)** is Gujarat''s premier self-employment subsidy scheme run by the Cottage and Village Industries Department:

• **Maximum Financial Assistance:**
  - **Industrial Sector:** Up to **₹8,00,000**.
  - **Service Sector:** Up to **₹8,00,000**.
  - **Business / Retail Sector:** Up to **₹4,00,000**.
• **Capital Subsidy:**
  - **SC / ST / Women / Minorities:** **40% subsidy** in rural areas (max **₹1,25,000**); **37.5%** in urban areas (max **₹1,00,000**).
  - **General Category:** 25% rural (max ₹1,00,000), 20% urban (max ₹80,000).
• **Age Limit:** 18 to 65 years.
• **Minimum Education:** 4th Standard pass (relaxed for traditional handicrafts).',
    'SCHEMES',
    TRUE
);
INSERT INTO ai_knowledge (question, keywords, answer, category, is_active)
VALUES (
    'What is PMFME (Food Processing Scheme)?',
    '["pmfme", "food processing", "spice grinding", "flour mill", "pickle", "bakery", "oil expeller"]'::json,
    '**PM Formalisation of Micro food processing Enterprises (PMFME)** provides capital subsidy for setting up or modernizing food units:

• **Credit-Linked Capital Subsidy:** **35% of eligible project cost**, up to a maximum subsidy ceiling of **₹10,00,000** per enterprise.
• **Eligible Trades:** Flour mills, chili/spice grinding, pickle & papad making, dairy packaging, bakeries, edible oil extraction, fruit pulp processing, and snacks production.
• **Beneficiary Contribution:** Minimum 10% of total project cost.
• **Statutory Requirement:** FSSAI food business registration, DPR proposal, and GST machinery quotations.',
    'SCHEMES',
    TRUE
);
