import json
import os
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models.scheme import Scheme
from app.models.user import User, UserRole
from app.models.applicant_profile import ApplicantProfile
from app.models.channel_partner import ChannelPartner
from app.models.application import Application
from app.utils.security import hash_password


def seed_schemes(db: Session):
    """Seed the database with verified government scheme data (upsert)."""
    data_path = os.path.join(os.path.dirname(__file__), "data", "schemes.json")
    
    with open(data_path, "r", encoding="utf-8") as f:
        schemes_data = json.load(f)
    
    upserted_count = 0
    for scheme_data in schemes_data:
        existing = db.query(Scheme).filter(Scheme.name == scheme_data["name"]).first()
        if existing:
            for k, v in scheme_data.items():
                setattr(existing, k, v)
        else:
            scheme = Scheme(**scheme_data)
            db.add(scheme)
        upserted_count += 1
    
    db.commit()
    print(f"Upserted {upserted_count} verified schemes.")


def seed_partners(db: Session):
    """Seed the database with realistic channel partners."""
    data_path = os.path.join(os.path.dirname(__file__), "data", "partners.json")
    if not os.path.exists(data_path):
        return
        
    with open(data_path, "r", encoding="utf-8") as f:
        partners_data = json.load(f)
        
    upserted_count = 0
    for partner_data in partners_data:
        existing = db.query(ChannelPartner).filter(ChannelPartner.name == partner_data["name"]).first()
        if existing:
            for k, v in partner_data.items():
                setattr(existing, k, v)
        else:
            partner = ChannelPartner(**partner_data)
            db.add(partner)
        upserted_count += 1
        
    db.commit()
    print(f"Upserted {upserted_count} channel partners.")


def seed_admin_user(db: Session):
    """Create a default admin user."""
    existing = db.query(User).filter(User.email == "admin@udyamsathi.in").first()
    if existing:
        print("Admin user already exists. Skipping.")
        return
    
    admin = User(
        name="Admin",
        email="admin@udyamsathi.in",
        password_hash=hash_password("admin123"),
        role=UserRole.ADMIN,
        language="en",
    )
    db.add(admin)
    db.commit()
    print("Created admin user: admin@udyamsathi.in / admin123")


def seed_test_user(db: Session):
    """Create a test beneficiary user."""
    existing = db.query(User).filter(User.email == "test@udyamsathi.in").first()
    if existing:
        print("Test user already exists. Skipping.")
        return
    
    user = User(
        name="Ramesh Kumar",
        email="test@udyamsathi.in",
        password_hash=hash_password("test123"),
        role=UserRole.BENEFICIARY,
        language="en",
    )
    db.add(user)
    db.flush()
    
    profile = ApplicantProfile(
        user_id=user.id,
        annual_income=250000,
        category="SC",
        age=30,
        occupation="Small Business Owner",
        education_status="12th_standard",
        district="Ahmedabad",
        state="Gujarat",
        pincode="380001",
    )
    db.add(profile)
    db.commit()
    print("Created test user: test@udyamsathi.in / test123")


def run_seed():
    """Run all seed functions."""
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        print("\n=== Seeding Database ===")
        seed_admin_user(db)
        seed_test_user(db)
        seed_schemes(db)
        seed_partners(db)
        print("=== Seeding Complete ===\n")
    finally:
        db.close()


if __name__ == "__main__":
    run_seed()
