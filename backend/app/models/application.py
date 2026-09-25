import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class Application(Base):
    __tablename__ = "applications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    scheme_id = Column(UUID(as_uuid=True), ForeignKey("schemes.id"), nullable=False)
    partner_id = Column(UUID(as_uuid=True), ForeignKey("channel_partners.id"), nullable=True)
    requested_amount = Column(Float, nullable=False)
    status = Column(String(20), default="DRAFT")  # DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="applications")
