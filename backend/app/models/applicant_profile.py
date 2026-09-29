import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Uuid
from sqlalchemy.orm import relationship
from app.database import Base


class ApplicantProfile(Base):
    __tablename__ = "applicant_profiles"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    annual_income = Column(Float, nullable=True)
    category = Column(String(20), nullable=True)  # SC, ST, OBC, GENERAL
    gender = Column(String(20), default="male")  # male, female, other
    age = Column(Integer, nullable=True)
    occupation = Column(String(100), nullable=True)
    education_status = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    pincode = Column(String(10), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="profile")
