import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.database import Base


class ChannelPartner(Base):
    __tablename__ = "channel_partners"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False, index=True)
    type = Column(String(20), nullable=False)  # SCA, PSB, RRB, NBFC_MFI
    address = Column(String(500), nullable=False)
    state = Column(String(100), nullable=False, index=True)
    district = Column(String(100), nullable=False)
    pincode = Column(String(10), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    supported_schemes = Column(JSONB, default=list)  # List of scheme IDs or names
    active = Column(Boolean, default=True)
    capacity_status = Column(String(20), default="AVAILABLE")  # AVAILABLE, LIMITED, FULL
    phone = Column(String(20), nullable=True)
    email = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
