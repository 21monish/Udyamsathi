from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.scheme import Scheme
from app.schemas.scheme import SchemeCreate, SchemeResponse, SchemeUpdate
from app.middleware.auth import get_current_user, get_admin_user
from app.models.user import User

router = APIRouter(prefix="/schemes", tags=["Schemes"])


@router.get("/", response_model=List[SchemeResponse])
def list_schemes(
    scheme_type: Optional[str] = None,
    category: Optional[str] = None,
    purpose: Optional[str] = None,
    active_only: bool = True,
    db: Session = Depends(get_db),
):
    """List all schemes with optional filters."""
    query = db.query(Scheme)
    
    if active_only:
        query = query.filter(Scheme.active == True)
    if scheme_type:
        query = query.filter(Scheme.scheme_type == scheme_type)
    
    schemes = query.order_by(Scheme.name).all()
    
    # Apply JSON field filters in Python (PostgreSQL JSONB containment could also work)
    results = []
    for s in schemes:
        if category and category not in (s.eligible_categories or []):
            continue
        if purpose and purpose not in (s.eligible_purposes or []):
            continue
        results.append(SchemeResponse(
            id=str(s.id),
            name=s.name,
            scheme_type=s.scheme_type,
            description=s.description,
            min_income=s.min_income,
            max_income=s.max_income,
            min_loan=s.min_loan,
            max_loan=s.max_loan,
            interest_rate=s.interest_rate,
            interest_rate_max=s.interest_rate_max,
            max_tenure=s.max_tenure,
            moratorium=s.moratorium,
            eligible_purposes=s.eligible_purposes or [],
            eligible_categories=s.eligible_categories or [],
            min_age=s.min_age,
            max_age=s.max_age,
            min_education=s.min_education,
            required_documents=s.required_documents or [],
            subsidy_info=s.subsidy_info,
            partner_types=s.partner_types or [],
            source_url=s.source_url,
            last_verified=s.last_verified,
            data_status=s.data_status,
            active=s.active,
            created_at=s.created_at,
        ))
    
    return results


@router.get("/{scheme_id}", response_model=SchemeResponse)
def get_scheme(scheme_id: str, db: Session = Depends(get_db)):
    """Get a single scheme by ID."""
    scheme = db.query(Scheme).filter(Scheme.id == scheme_id).first()
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")
    
    return SchemeResponse(
        id=str(scheme.id),
        name=scheme.name,
        scheme_type=scheme.scheme_type,
        description=scheme.description,
        min_income=scheme.min_income,
        max_income=scheme.max_income,
        min_loan=scheme.min_loan,
        max_loan=scheme.max_loan,
        interest_rate=scheme.interest_rate,
        interest_rate_max=scheme.interest_rate_max,
        max_tenure=scheme.max_tenure,
        moratorium=scheme.moratorium,
        eligible_purposes=scheme.eligible_purposes or [],
        eligible_categories=scheme.eligible_categories or [],
        min_age=scheme.min_age,
        max_age=scheme.max_age,
        min_education=scheme.min_education,
        required_documents=scheme.required_documents or [],
        subsidy_info=scheme.subsidy_info,
        partner_types=scheme.partner_types or [],
        source_url=scheme.source_url,
        last_verified=scheme.last_verified,
        data_status=scheme.data_status,
        active=scheme.active,
        created_at=scheme.created_at,
    )


@router.post("/", response_model=SchemeResponse, status_code=status.HTTP_201_CREATED)
def create_scheme(
    data: SchemeCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    """Create a new scheme (admin only)."""
    scheme = Scheme(**data.model_dump())
    db.add(scheme)
    db.commit()
    db.refresh(scheme)
    
    return SchemeResponse(
        id=str(scheme.id),
        name=scheme.name,
        scheme_type=scheme.scheme_type,
        description=scheme.description,
        min_income=scheme.min_income,
        max_income=scheme.max_income,
        min_loan=scheme.min_loan,
        max_loan=scheme.max_loan,
        interest_rate=scheme.interest_rate,
        interest_rate_max=scheme.interest_rate_max,
        max_tenure=scheme.max_tenure,
        moratorium=scheme.moratorium,
        eligible_purposes=scheme.eligible_purposes or [],
        eligible_categories=scheme.eligible_categories or [],
        min_age=scheme.min_age,
        max_age=scheme.max_age,
        min_education=scheme.min_education,
        required_documents=scheme.required_documents or [],
        subsidy_info=scheme.subsidy_info,
        partner_types=scheme.partner_types or [],
        source_url=scheme.source_url,
        last_verified=scheme.last_verified,
        data_status=scheme.data_status,
        active=scheme.active,
        created_at=scheme.created_at,
    )
