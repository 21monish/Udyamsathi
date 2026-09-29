"""
Generate a complete, self-contained supabase_setup.sql file
that can be executed in the Supabase Dashboard SQL Editor in one click.
"""

import os
import sys
import json
import uuid

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.utils.security import hash_password
from scripts.seed_ai_knowledge import INITIAL_QA

def escape_sql(text):
    if text is None:
        return "NULL"
    return "'" + str(text).replace("'", "''") + "'"

def escape_json(obj):
    if obj is None:
        return "'[]'::json"
    return "'" + json.dumps(obj, ensure_ascii=False).replace("'", "''") + "'::json"

def main():
    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    output_path = os.path.join(backend_dir, "scripts", "supabase_setup.sql")

    schemes_path = os.path.join(backend_dir, "app", "seed", "data", "schemes.json")
    with open(schemes_path, "r", encoding="utf-8") as f:
        schemes = json.load(f)

    partners_path = os.path.join(backend_dir, "app", "seed", "data", "partners.json")
    with open(partners_path, "r", encoding="utf-8") as f:
        partners = json.load(f)

    sql = []
    sql.append("-- ==========================================================")
    sql.append("-- UDYAMSATHI SUPABASE SETUP & SEEDING SCRIPT")
    sql.append("-- SIH 26092: AI-Driven Scheme Matching Platform")
    sql.append("-- ==========================================================")
    sql.append("")
    sql.append("-- Enable UUID extension")
    sql.append('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')
    sql.append("")

    # Enum
    sql.append("-- UserRole Enum")
    sql.append("DO $$ BEGIN")
    sql.append("    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'userrole') THEN")
    sql.append("        CREATE TYPE userrole AS ENUM ('BENEFICIARY', 'PARTNER', 'ADMIN');")
    sql.append("    END IF;")
    sql.append("END $$;")
    sql.append("")

    # Tables DDL
    sql.append("-- 1. Users Table")
    sql.append("""CREATE TABLE IF NOT EXISTS users (
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
);""")
    sql.append("CREATE INDEX IF NOT EXISTS ix_users_email ON users(email);")
    sql.append("")

    sql.append("-- 2. Applicant Profiles Table")
    sql.append("""CREATE TABLE IF NOT EXISTS applicant_profiles (
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
);""")
    sql.append("")

    sql.append("-- 3. Schemes Table")
    sql.append("""CREATE TABLE IF NOT EXISTS schemes (
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
);""")
    sql.append("CREATE INDEX IF NOT EXISTS ix_schemes_name ON schemes(name);")
    sql.append("")

    sql.append("-- 4. Channel Partners Table")
    sql.append("""CREATE TABLE IF NOT EXISTS channel_partners (
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
);""")
    sql.append("CREATE INDEX IF NOT EXISTS ix_channel_partners_name ON channel_partners(name);")
    sql.append("CREATE INDEX IF NOT EXISTS ix_channel_partners_state ON channel_partners(state);")
    sql.append("")

    sql.append("-- 5. Applications Table")
    sql.append("""CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scheme_id UUID NOT NULL REFERENCES schemes(id) ON DELETE CASCADE,
    partner_id UUID REFERENCES channel_partners(id) ON DELETE SET NULL,
    requested_amount DOUBLE PRECISION NOT NULL,
    status VARCHAR(20) DEFAULT 'DRAFT',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);""")
    sql.append("")

    sql.append("-- 6. AI Knowledge Base Table")
    sql.append("""CREATE TABLE IF NOT EXISTS ai_knowledge (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question VARCHAR(500) NOT NULL,
    keywords JSON DEFAULT '[]'::json,
    answer TEXT NOT NULL,
    category VARCHAR(100) DEFAULT 'GENERAL',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);""")
    sql.append("CREATE INDEX IF NOT EXISTS ix_ai_knowledge_question ON ai_knowledge(question);")
    sql.append("")

    # Seed Admin & Test User
    sql.append("-- ==========================================================")
    sql.append("-- SEED USERS (Admin & Beneficiary)")
    sql.append("-- ==========================================================")
    admin_pw = hash_password("admin123")
    test_pw = hash_password("test123")
    sql.append(f"""INSERT INTO users (id, name, email, password_hash, role, language, is_active)
VALUES ('a0000000-0000-0000-0000-000000000001', 'System Administrator', 'admin@udyamsathi.in', '{admin_pw}', 'ADMIN', 'en', TRUE)
ON CONFLICT (email) DO NOTHING;""")

    sql.append(f"""INSERT INTO users (id, name, email, password_hash, role, language, is_active)
VALUES ('b0000000-0000-0000-0000-000000000002', 'Ramesh Kumar', 'test@udyamsathi.in', '{test_pw}', 'BENEFICIARY', 'en', TRUE)
ON CONFLICT (email) DO NOTHING;""")

    sql.append("""INSERT INTO applicant_profiles (id, user_id, annual_income, category, gender, age, occupation, education_status, district, state, pincode)
VALUES ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002', 250000, 'SC', 'male', 30, 'Small Business Owner', '12th_standard', 'Ahmedabad', 'Gujarat', '380001')
ON CONFLICT (user_id) DO NOTHING;""")
    sql.append("")

    # Seed Schemes
    sql.append("-- ==========================================================")
    sql.append(f"-- SEED STATUTORY SCHEMES ({len(schemes)} Verified Schemes)")
    sql.append("-- ==========================================================")
    for s in schemes:
        sql.append(f"""INSERT INTO schemes (
    name, scheme_type, description, min_income, max_income, min_loan, max_loan,
    interest_rate, interest_rate_max, max_tenure, moratorium,
    eligible_purposes, eligible_categories, min_age, max_age, min_education,
    required_documents, subsidy_info, partner_types, source_url, data_status, active
) VALUES (
    {escape_sql(s.get('name'))},
    {escape_sql(s.get('scheme_type'))},
    {escape_sql(s.get('description'))},
    {s.get('min_income') if s.get('min_income') is not None else 'NULL'},
    {s.get('max_income') if s.get('max_income') is not None else 'NULL'},
    {s.get('min_loan', 0)},
    {s.get('max_loan', 0)},
    {s.get('interest_rate', 0)},
    {s.get('interest_rate_max') if s.get('interest_rate_max') is not None else 'NULL'},
    {s.get('max_tenure', 60)},
    {s.get('moratorium', 0)},
    {escape_json(s.get('eligible_purposes'))},
    {escape_json(s.get('eligible_categories'))},
    {s.get('min_age') if s.get('min_age') is not None else 'NULL'},
    {s.get('max_age') if s.get('max_age') is not None else 'NULL'},
    {escape_sql(s.get('min_education'))},
    {escape_json(s.get('required_documents'))},
    {escape_sql(s.get('subsidy_info'))},
    {escape_json(s.get('partner_types'))},
    {escape_sql(s.get('source_url'))},
    {escape_sql(s.get('data_status', 'VERIFIED'))},
    {s.get('active', True)}
);""")
    sql.append("")

    # Seed Partners
    sql.append("-- ==========================================================")
    sql.append(f"-- SEED CHANNEL PARTNERS ({len(partners)} Channel Partners)")
    sql.append("-- ==========================================================")
    for p in partners:
        sql.append(f"""INSERT INTO channel_partners (
    name, type, address, state, district, pincode,
    latitude, longitude, supported_schemes, active, capacity_status,
    phone, email, npa_rate, fund_utilization, avg_processing_days, working_hours
) VALUES (
    {escape_sql(p.get('name'))},
    {escape_sql(p.get('type'))},
    {escape_sql(p.get('address'))},
    {escape_sql(p.get('state'))},
    {escape_sql(p.get('district'))},
    {escape_sql(p.get('pincode'))},
    {p.get('latitude', 0.0)},
    {p.get('longitude', 0.0)},
    {escape_json(p.get('supported_schemes'))},
    {p.get('active', True)},
    {escape_sql(p.get('capacity_status', 'AVAILABLE'))},
    {escape_sql(p.get('phone'))},
    {escape_sql(p.get('email'))},
    {p.get('npa_rate', 3.2)},
    {p.get('fund_utilization', 85.0)},
    {p.get('avg_processing_days', 14)},
    {escape_sql(p.get('working_hours', 'Mon-Fri 09:30 - 17:30'))}
);""")
    sql.append("")

    # Seed AI Knowledge Base
    sql.append("-- ==========================================================")
    sql.append(f"-- SEED AI KNOWLEDGE BASE ({len(INITIAL_QA)} Trained Q&As)")
    sql.append("-- ==========================================================")
    for item in INITIAL_QA:
        sql.append(f"""INSERT INTO ai_knowledge (question, keywords, answer, category, is_active)
VALUES (
    {escape_sql(item.get('question'))},
    {escape_json(item.get('keywords'))},
    {escape_sql(item.get('answer'))},
    {escape_sql(item.get('category', 'GENERAL'))},
    TRUE
);""")
    sql.append("")

    with open(output_path, "w", encoding="utf-8") as f:
        f.write("\n".join(sql))

    print(f"[OK] Generated {output_path}")
    print(f"Total SQL Lines: {len(sql)}")

if __name__ == "__main__":
    main()
