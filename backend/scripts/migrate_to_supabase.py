"""
UdyamSathi - Supabase Migration & Seeding Script
================================================
This script automates:
1. Connecting to your Supabase PostgreSQL database.
2. Creating all required tables (users, applicant_profiles, schemes, channel_partners, applications, ai_knowledge).
3. Upserting all 40 verified statutory schemes.
4. Upserting channel partners.
5. Seeding default Admin & Test Beneficiary accounts.
6. Seeding trained AI Knowledge Base Q&As.

Usage:
  python scripts/migrate_to_supabase.py
  OR
  python scripts/migrate_to_supabase.py "postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
"""

import sys
import os
import json

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Import all models to register with Base.metadata
from app.database import Base
from app.models.user import User, UserRole
from app.models.applicant_profile import ApplicantProfile
from app.models.scheme import Scheme
from app.models.channel_partner import ChannelPartner
from app.models.application import Application
from app.models.ai_knowledge import AIKnowledgeItem
from app.utils.security import hash_password
from app.config import get_settings


def get_db_url():
    if len(sys.argv) > 1 and sys.argv[1].strip():
        url = sys.argv[1].strip()
    else:
        url = get_settings().DATABASE_URL

    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
    return url


def run_migration():
    target_url = get_db_url()
    
    # Redact password for clean console output
    masked_url = target_url
    if "@" in masked_url and "://" in masked_url:
        prefix, rest = masked_url.split("://", 1)
        creds, host = rest.split("@", 1)
        user = creds.split(":")[0]
        masked_url = f"{prefix}://{user}:*****@{host}"
        
    print("=" * 60)
    print("[*] UDYAMSATHI SUPABASE MIGRATION & SEEDING")
    print("=" * 60)
    print(f"Target Database: {masked_url}")

    engine = create_engine(
        target_url,
        pool_pre_ping=True,
        pool_recycle=300
    )

    try:
        with engine.connect() as conn:
            print("[OK] Connected to database successfully.")
    except Exception as e:
        print(f"\n[ERROR] Connection failed: {e}")
        print("\nTroubleshooting tips:")
        print("1. In Supabase, go to Settings -> Database -> Connection String.")
        print("2. Choose URI mode (Transaction pooler port 6543 or Session port 5432).")
        print("3. Ensure your database password replaces [YOUR-PASSWORD].")
        print("4. Check that special characters in your password are percent-encoded.")
        sys.exit(1)

    print("\n[1/5] Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("[OK] Tables verified/created:")
    for table_name in Base.metadata.tables.keys():
        print(f"   • {table_name}")

    Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = Session()

    try:
        # Seed Admin & Test Beneficiary
        print("\n[2/5] Seeding default users...")
        admin = db.query(User).filter(User.email == "admin@udyamsathi.in").first()
        if not admin:
            admin = User(
                name="System Administrator",
                email="admin@udyamsathi.in",
                password_hash=hash_password("admin123"),
                role=UserRole.ADMIN,
                language="en",
            )
            db.add(admin)
            print("   Created: admin@udyamsathi.in (Password: admin123)")
        else:
            print("   Admin user already exists.")

        test_user = db.query(User).filter(User.email == "test@udyamsathi.in").first()
        if not test_user:
            test_user = User(
                name="Ramesh Kumar",
                email="test@udyamsathi.in",
                password_hash=hash_password("test123"),
                role=UserRole.BENEFICIARY,
                language="en",
            )
            db.add(test_user)
            db.flush()

            profile = ApplicantProfile(
                user_id=test_user.id,
                annual_income=250000,
                category="SC",
                gender="male",
                age=30,
                occupation="Small Business Owner",
                education_status="12th_standard",
                district="Ahmedabad",
                state="Gujarat",
                pincode="380001",
            )
            db.add(profile)
            print("   Created demo beneficiary: test@udyamsathi.in (Password: test123)")
        else:
            print("   Demo beneficiary already exists.")
        db.commit()

        # Seed Verified Schemes
        print("\n[3/5] Upserting statutory schemes...")
        schemes_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "app", "seed", "data", "schemes.json")
        with open(schemes_path, "r", encoding="utf-8") as f:
            schemes_data = json.load(f)

        schemes_count = 0
        for s in schemes_data:
            existing = db.query(Scheme).filter(Scheme.name == s["name"]).first()
            if existing:
                for k, v in s.items():
                    setattr(existing, k, v)
            else:
                db.add(Scheme(**s))
            schemes_count += 1
        db.commit()
        print(f"[OK] {schemes_count} statutory schemes upserted successfully.")

        # Seed Channel Partners
        print("\n[4/5] Upserting channel partners...")
        partners_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "app", "seed", "data", "partners.json")
        partners_count = 0
        if os.path.exists(partners_path):
            with open(partners_path, "r", encoding="utf-8") as f:
                partners_data = json.load(f)
            for p in partners_data:
                existing = db.query(ChannelPartner).filter(ChannelPartner.name == p["name"]).first()
                if existing:
                    for k, v in p.items():
                        setattr(existing, k, v)
                else:
                    db.add(ChannelPartner(**p))
                partners_count += 1
            db.commit()
        print(f"[OK] {partners_count} channel partners upserted.")

        # Seed AI Knowledge Base
        print("\n[5/5] Seeding AI Assistant knowledge base...")
        from scripts.seed_ai_knowledge import seed_knowledge
        seed_knowledge(db_session=db)

        total_users = db.query(User).count()
        total_schemes = db.query(Scheme).count()
        total_partners = db.query(ChannelPartner).count()
        total_ai_qa = db.query(AIKnowledgeItem).count()

        print("\n" + "=" * 60)
        print("[SUCCESS] SUPABASE MIGRATION & SEEDING COMPLETED!")
        print("=" * 60)
        print("Summary in Supabase PostgreSQL:")
        print(f"   * Users:            {total_users}")
        print(f"   * Schemes:          {total_schemes}")
        print(f"   * Channel Partners: {total_partners}")
        print(f"   * AI Q&A Entries:   {total_ai_qa}")
        print("\nNext Steps:")
        print("1. Update DATABASE_URL in your backend .env file with your Supabase URI.")
        print("2. Deploy frontend to Vercel with NEXT_PUBLIC_API_URL.")
        print("=" * 60 + "\n")

    finally:
        db.close()


if __name__ == "__main__":
    run_migration()
