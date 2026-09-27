from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.channel_partner import ChannelPartner
from app.schemas.partner import PartnerResponse, PartnerCreate, PartnerUpdate
from app.services.partner_locator import filter_and_rank_partners, calculate_partner_health

router = APIRouter(prefix="/partners", tags=["Channel Partners"])


@router.get("/", response_model=List[PartnerResponse])
def get_partners(
    lat: Optional[float] = Query(None, description="User latitude"),
    lon: Optional[float] = Query(None, description="User longitude"),
    radius_km: float = Query(100.0, description="Search radius in kilometers"),
    partner_type: Optional[str] = Query(None, description="SCA, PSB, RRB, NBFC_MFI"),
    scheme_name: Optional[str] = Query(None, description="Filter by supported scheme"),
    district: Optional[str] = Query(None, description="Filter by district"),
    state: Optional[str] = Query(None, description="Filter by state"),
    exclude_high_npa: bool = Query(False, description="Exclude partners with NPA > 5%"),
    db: Session = Depends(get_db),
):
    """
    Find nearest channel partners with geolocation distance, filters for type and supported schemes.
    """
    partners = db.query(ChannelPartner).filter(ChannelPartner.active == True).all()
    results = filter_and_rank_partners(
        partners=partners,
        user_lat=lat,
        user_lon=lon,
        radius_km=radius_km,
        partner_type=partner_type,
        scheme_name=scheme_name,
        district=district,
        state=state,
        exclude_high_npa=exclude_high_npa,
    )
    return results


def _build_partner_response(partner: ChannelPartner, distance: Optional[float] = None) -> PartnerResponse:
    npa = partner.npa_rate if partner.npa_rate is not None else 3.2
    util = partner.fund_utilization if partner.fund_utilization is not None else 85.0
    sla = partner.avg_processing_days if partner.avg_processing_days is not None else 14
    score, is_flagged = calculate_partner_health(npa, util, sla)
    
    return PartnerResponse(
        id=str(partner.id),
        name=partner.name,
        type=partner.type,
        address=partner.address,
        state=partner.state,
        district=partner.district,
        pincode=partner.pincode,
        latitude=partner.latitude,
        longitude=partner.longitude,
        supported_schemes=partner.supported_schemes or [],
        active=partner.active,
        capacity_status=partner.capacity_status,
        phone=partner.phone,
        email=partner.email,
        distance=distance,
        npa_rate=npa,
        fund_utilization=util,
        avg_processing_days=sla,
        health_score=score,
        is_npa_flagged=is_flagged,
        working_hours=partner.working_hours or "Mon-Fri 09:30 - 17:30",
    )


@router.get("/{partner_id}", response_model=PartnerResponse)
def get_partner(partner_id: str, db: Session = Depends(get_db)):
    partner = db.query(ChannelPartner).filter(ChannelPartner.id == partner_id).first()
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")
    return _build_partner_response(partner)


@router.post("/", response_model=PartnerResponse, status_code=201)
def create_partner(data: PartnerCreate, db: Session = Depends(get_db)):
    partner = ChannelPartner(**data.model_dump())
    db.add(partner)
    db.commit()
    db.refresh(partner)
    return _build_partner_response(partner)


@router.put("/{partner_id}", response_model=PartnerResponse)
def update_partner(partner_id: str, data: PartnerUpdate, db: Session = Depends(get_db)):
    partner = db.query(ChannelPartner).filter(ChannelPartner.id == partner_id).first()
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")
    
    update_data = data.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(partner, field, val)
    
    db.commit()
    db.refresh(partner)
    return _build_partner_response(partner)


@router.delete("/{partner_id}")
def delete_partner(partner_id: str, db: Session = Depends(get_db)):
    partner = db.query(ChannelPartner).filter(ChannelPartner.id == partner_id).first()
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")
    
    db.delete(partner)
    db.commit()
    return {"status": "success", "message": f"Partner {partner_id} deleted successfully"}
