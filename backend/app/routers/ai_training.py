from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from pydantic import BaseModel, Field
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from app.database import get_db
from app.models.ai_knowledge import AIKnowledgeItem
from app.models.user import User
from app.middleware.auth import get_current_user, get_admin_user

router = APIRouter(prefix="/ai-training", tags=["AI Training & Knowledge Base"])


class AIKnowledgeCreate(BaseModel):
    question: str = Field(..., min_length=3, max_length=500, description="The trigger question or user query")
    keywords: List[str] = Field(default=[], description="Keywords or phrases that trigger this answer")
    answer: str = Field(..., min_length=5, description="The exact official answer the AI must give")
    category: str = Field(default="GENERAL", description="Category: SCHEMES, ELIGIBILITY, DOCUMENTS, EMI_REPAYMENT, GENERAL")
    is_active: bool = Field(default=True, description="Whether this Q&A is active for the AI assistant")


class AIKnowledgeUpdate(BaseModel):
    question: Optional[str] = Field(None, min_length=3, max_length=500)
    keywords: Optional[List[str]] = None
    answer: Optional[str] = Field(None, min_length=5)
    category: Optional[str] = None
    is_active: Optional[bool] = None


class AIKnowledgeResponse(BaseModel):
    id: UUID
    question: str
    keywords: List[str]
    answer: str
    category: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TestQueryRequest(BaseModel):
    question: str


class TestQueryResponse(BaseModel):
    matched: bool
    confidence: float
    matched_question: Optional[str] = None
    category: Optional[str] = None
    answer: str


@router.get("", response_model=List[AIKnowledgeResponse])
def get_trained_qa_list(
    q: Optional[str] = Query(None, description="Search question, answer or keywords"),
    category: Optional[str] = Query(None, description="Filter by category"),
    active_only: bool = Query(False, description="Filter by active status"),
    db: Session = Depends(get_db),
):
    """
    List all trained AI Question & Answer pairs.
    """
    query = db.query(AIKnowledgeItem)

    if active_only:
        query = query.filter(AIKnowledgeItem.is_active == True)

    if category and category != "ALL":
        query = query.filter(AIKnowledgeItem.category == category)

    if q:
        search = f"%{q.lower()}%"
        query = query.filter(
            or_(
                AIKnowledgeItem.question.ilike(search),
                AIKnowledgeItem.answer.ilike(search),
            )
        )

    return query.order_by(AIKnowledgeItem.updated_at.desc()).all()


@router.post("", response_model=AIKnowledgeResponse, status_code=status.HTTP_201_CREATED)
def create_trained_qa(
    data: AIKnowledgeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Teach the AI a new question and its exact answer.
    """
    # Clean keywords
    cleaned_keywords = [k.strip().lower() for k in data.keywords if k.strip()]
    if not cleaned_keywords:
        # Auto-extract meaningful words from question
        words = [w.lower() for w in data.question.split() if len(w) > 3]
        cleaned_keywords = words[:5]

    item = AIKnowledgeItem(
        question=data.question.strip(),
        keywords=cleaned_keywords,
        answer=data.answer.strip(),
        category=data.category,
        is_active=data.is_active,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.get("/{qa_id}", response_model=AIKnowledgeResponse)
def get_trained_qa_by_id(
    qa_id: UUID,
    db: Session = Depends(get_db),
):
    """
    Get a single trained Q&A item by ID.
    """
    item = db.query(AIKnowledgeItem).filter(AIKnowledgeItem.id == qa_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Q&A item not found")
    return item


@router.put("/{qa_id}", response_model=AIKnowledgeResponse)
def update_trained_qa(
    qa_id: UUID,
    data: AIKnowledgeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update a trained question and its answer.
    """
    item = db.query(AIKnowledgeItem).filter(AIKnowledgeItem.id == qa_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Q&A item not found")

    if data.question is not None:
        item.question = data.question.strip()
    if data.keywords is not None:
        item.keywords = [k.strip().lower() for k in data.keywords if k.strip()]
    if data.answer is not None:
        item.answer = data.answer.strip()
    if data.category is not None:
        item.category = data.category
    if data.is_active is not None:
        item.is_active = data.is_active

    db.commit()
    db.refresh(item)
    return item


@router.delete("/{qa_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_trained_qa(
    qa_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Delete a trained Q&A item from the knowledge base.
    """
    item = db.query(AIKnowledgeItem).filter(AIKnowledgeItem.id == qa_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Q&A item not found")

    db.delete(item)
    db.commit()
    return None


@router.post("/test", response_model=TestQueryResponse)
def test_ai_matching(
    req: TestQueryRequest,
    db: Session = Depends(get_db),
):
    """
    Simulator for testing how the AI matches and responds to a given question.
    """
    query_text = req.question.strip().lower()
    if not query_text:
        return TestQueryResponse(
            matched=False,
            confidence=0.0,
            answer="Please enter a question to test."
        )

    # 1. Search active knowledge base items
    items = db.query(AIKnowledgeItem).filter(AIKnowledgeItem.is_active == True).all()

    best_match = None
    best_score = 0.0

    for item in items:
        score = 0.0
        q_lower = item.question.lower()

        # Exact or substring match on question
        if query_text in q_lower or q_lower in query_text:
            score += 0.8

        # Keyword match
        matched_kw_count = 0
        keywords = item.keywords or []
        for kw in keywords:
            if kw.lower() in query_text:
                matched_kw_count += 1

        if keywords:
            kw_ratio = matched_kw_count / len(keywords)
            score += kw_ratio * 0.5

        # Word overlap
        q_words = set(query_text.split())
        item_words = set(q_lower.split())
        overlap = len(q_words.intersection(item_words))
        if overlap > 0:
            score += (overlap / max(len(q_words), 1)) * 0.4

        if score > best_score:
            best_score = score
            best_match = item

    if best_match and best_score >= 0.35:
        confidence = min(round(best_score * 100, 1), 99.9)
        return TestQueryResponse(
            matched=True,
            confidence=confidence,
            matched_question=best_match.question,
            category=best_match.category,
            answer=best_match.answer
        )
    else:
        return TestQueryResponse(
            matched=False,
            confidence=0.0,
            answer="No exact custom Q&A match found. The AI will evaluate standard statutory scheme rules or provide general guidance."
        )
