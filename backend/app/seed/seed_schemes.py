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
    """Seed the database with demo scheme data."""
    data_path = os.path.join(os.path.dirname(__file__), "data", "schemes.json")
    
    with open(data_path, "r", encoding="utf-8") as f:
        schemes_data = json.load(f)
    
    existing_count = db.query(Scheme).count()
    if existing_count > 0:
        print(f"Schemes already seeded ({existing_count} found). Skipping.")
        return
    
    for scheme_data in schemes_data:
        scheme = Scheme(**scheme_data)
        db.add(scheme)
    
    db.commit()
    print(f"Seeded {len(schemes_data)} schemes.")


def seed_admin_user(db: Session):
    """Create a default admin user."""
    existing = db.query(User).filter(User.email == "admin@schemesetu.in").first()
    if existing:
        print("Admin user already exists. Skipping.")
        return
    
    admin = User(
        name="Admin",
        email="admin@schemesetu.in",
        password_hash=hash_password("admin123"),
        role=UserRole.ADMIN,
        language="en",
    )
    db.add(admin)
    db.commit()
    print("Created admin user: admin@schemesetu.in / admin123")


def seed_test_user(db: Session):
    """Create a test beneficiary user."""
    existing = db.query(User).filter(User.email == "test@schemesetu.in").first()
    if existing:
        print("Test user already exists. Skipping.")
        return
    
    user = User(
        name="Ramesh Kumar",
        email="test@schemesetu.in",
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
    print("Created test user: test@schemesetu.in / test123")


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
        print("=== Seeding Complete ===\n")
    finally:
        db.close()


if __name__ == "__main__":
    run_seed()
