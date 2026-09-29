import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Text, Uuid, JSON
from app.database import Base


class AIKnowledgeItem(Base):
    __tablename__ = "ai_knowledge"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    question = Column(String(500), nullable=False, index=True)
    keywords = Column(JSON, default=list)  # Trigger keywords/phrases
    answer = Column(Text, nullable=False)
    category = Column(String(100), default="GENERAL")  # SCHEMES, ELIGIBILITY, DOCUMENTS, EMI_REPAYMENT, GENERAL
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
