from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from uuid import UUID

from app.database import get_db
from app.models.application import Application
from app.models.user import User
from app.models.scheme import Scheme
from app.models.channel_partner import ChannelPartner
from app.schemas.application import ApplicationCreate, ApplicationUpdate, ApplicationResponse
from app.middleware.auth import get_optional_admin

router = APIRouter(prefix="/applications", tags=["Applications"])

def _build_response(app_obj, db: Session) -> ApplicationResponse:
    user = db.query(User).filter(User.id == app_obj.user_id).first()
    scheme = db.query(Scheme).filter(Scheme.id == app_obj.scheme_id).first()
    partner = None
    if app_obj.partner_id:
        partner = db.query(ChannelPartner).filter(ChannelPartner.id == app_obj.partner_id).first()
    return ApplicationResponse(
        id=str(app_obj.id),
        user_id=str(app_obj.user_id),
        scheme_id=str(app_obj.scheme_id),
        partner_id=str(app_obj.partner_id) if app_obj.partner_id else None,
        requested_amount=app_obj.requested_amount,
        status=app_obj.status,
        created_at=app_obj.created_at,
        updated_at=app_obj.updated_at,
        user_name=user.name if user else None,
        user_email=user.email if user else None,
        scheme_name=scheme.name if scheme else None,
        partner_name=partner.name if partner else None,
    )

@router.get("/", response_model=List[ApplicationResponse])
def get_applications(
    status: Optional[str] = None,
    user_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Application)
    if status:
        query = query.filter(Application.status == status)
    if user_id:
        query = query.filter(Application.user_id == user_id)
    
    apps = query.all()
    return [_build_response(app, db) for app in apps]

@router.get("/stats/summary")
def get_application_stats(db: Session = Depends(get_db)):
    total = db.query(func.count(Application.id)).scalar() or 0
    status_counts = dict(
        db.query(Application.status, func.count(Application.id))
        .group_by(Application.status)
        .all()
    )
    return {
        "total": total,
        "draft": status_counts.get("DRAFT", 0),
        "submitted": status_counts.get("SUBMITTED", 0),
        "under_review": status_counts.get("UNDER_REVIEW", 0),
        "approved": status_counts.get("APPROVED", 0),
        "rejected": status_counts.get("REJECTED", 0),
    }

@router.get("/my", response_model=List[ApplicationResponse])
def get_my_applications(
    db: Session = Depends(get_db),
    current_user=Depends(get_optional_admin)
):
    """Retrieve all loan applications belonging to current user."""
    user = current_user
    if not user:
        user = db.query(User).filter(User.role == "BENEFICIARY").first() or db.query(User).first()
    if not user:
        return []
    apps = db.query(Application).filter(Application.user_id == user.id).order_by(Application.created_at.desc()).all()
    return [_build_response(a, db) for a in apps]

@router.get("/{application_id}", response_model=ApplicationResponse)
def get_application(application_id: str, db: Session = Depends(get_db)):
    app_obj = db.query(Application).filter(Application.id == application_id).first()
    if not app_obj:
        raise HTTPException(status_code=404, detail="Application not found")
    return _build_response(app_obj, db)

@router.post("/", response_model=ApplicationResponse)
def create_application(
    app_in: ApplicationCreate,
    user_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    admin_user=Depends(get_optional_admin)
):
    # Determine user_id to use
    if user_id and user_id.strip():
        target_user = db.query(User).filter(User.id == user_id.strip()).first()
        if not target_user:
            raise HTTPException(status_code=404, detail="Specified user not found")
        final_user_id = target_user.id
    elif admin_user and hasattr(admin_user, 'id'):
        final_user_id = admin_user.id
    else:
        # Default user fallback: find first beneficiary user or test user
        first_user = db.query(User).filter(User.role == "BENEFICIARY").first() or db.query(User).first()
        if not first_user:
            raise HTTPException(status_code=400, detail="No users exist to assign application")
        final_user_id = first_user.id

    scheme = db.query(Scheme).filter(Scheme.id == app_in.scheme_id).first()
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")

    partner_id = None
    if app_in.partner_id and app_in.partner_id.strip():
        partner = db.query(ChannelPartner).filter(ChannelPartner.id == app_in.partner_id.strip()).first()
        if not partner:
            raise HTTPException(status_code=404, detail="Channel partner not found")
        partner_id = partner.id

    db_app = Application(
        user_id=final_user_id,
        scheme_id=scheme.id,
        partner_id=partner_id,
        requested_amount=app_in.requested_amount,
        status=app_in.status
    )
    db.add(db_app)
    db.commit()
    db.refresh(db_app)
    return _build_response(db_app, db)

@router.put("/{application_id}", response_model=ApplicationResponse)
def update_application(
    application_id: str,
    app_in: ApplicationUpdate,
    db: Session = Depends(get_db),
    admin_user=Depends(get_optional_admin)
):
    db_app = db.query(Application).filter(Application.id == application_id).first()
    if not db_app:
        raise HTTPException(status_code=404, detail="Application not found")
        
    update_data = app_in.model_dump(exclude_unset=True)
    if "partner_id" in update_data:
        p_id = update_data["partner_id"]
        if not p_id or not str(p_id).strip():
            update_data["partner_id"] = None
        else:
            p_obj = db.query(ChannelPartner).filter(ChannelPartner.id == str(p_id).strip()).first()
            if not p_obj:
                raise HTTPException(status_code=404, detail="Channel partner not found")
            update_data["partner_id"] = p_obj.id

    for field, value in update_data.items():
        setattr(db_app, field, value)
        
    db.commit()
    db.refresh(db_app)
    return _build_response(db_app, db)

@router.delete("/{application_id}")
def delete_application(
    application_id: str,
    db: Session = Depends(get_db),
    admin_user=Depends(get_optional_admin)
):
    db_app = db.query(Application).filter(Application.id == application_id).first()
    if not db_app:
        raise HTTPException(status_code=404, detail="Application not found")
        
    db.delete(db_app)
    db.commit()
    return {"message": "Application deleted successfully"}
