import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from app.database import Base


class Scheme(Base):
    __tablename__ = "schemes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False, index=True)
    scheme_type = Column(String(50), nullable=False)  # TERM_LOAN, MICRO_CREDIT, EDUCATION_LOAN, MUDRA, PMEGP, etc.
    description = Column(Text, nullable=False)
    
    # Financial parameters
    min_income = Column(Float, nullable=True)  # Minimum income required (if any)
    max_income = Column(Float, nullable=True)  # Maximum income limit (if any)
    min_loan = Column(Float, default=0)
    max_loan = Column(Float, nullable=False)
    interest_rate = Column(Float, nullable=False)  # Annual percentage
    interest_rate_max = Column(Float, nullable=True)  # If rate is a range
    max_tenure = Column(Integer, nullable=False)  # In months
    moratorium = Column(Integer, default=0)  # Moratorium period in months
    
    # Eligibility rules (stored as structured JSON)
    eligible_purposes = Column(JSONB, default=list)  # ["business", "education", "self_employment"]
    eligible_categories = Column(JSONB, default=list)  # ["SC", "ST", "OBC", "GENERAL"]
    min_age = Column(Integer, nullable=True)
    max_age = Column(Integer, nullable=True)
    min_education = Column(String(100), nullable=True)  # e.g., "8th_standard"
    
    # Documentation
    required_documents = Column(JSONB, default=list)  # List of required document names
    subsidy_info = Column(Text, nullable=True)  # Subsidy/contribution rules
    
    # Partner types that can disburse this scheme
    partner_types = Column(JSONB, default=list)  # ["SCA", "PSB", "RRB"]
    
    # Source & Verification
    source_url = Column(String(500), nullable=True)  # Official scheme document URL
    last_verified = Column(DateTime(timezone=True), nullable=True)
    data_status = Column(String(20), default="DEMO")  # VERIFIED or DEMO
    
    # Status
    active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
