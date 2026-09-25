import math
from typing import List, Optional
from app.models.channel_partner import ChannelPartner
from app.schemas.partner import PartnerResponse


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great-circle distance between two points in kilometers.
    """
    radius = 6371.0  # Earth's radius in km

    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (
        math.sin(d_lat / 2.0) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(d_lon / 2.0) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(radius * c, 2)


def filter_and_rank_partners(
    partners: List[ChannelPartner],
    user_lat: Optional[float] = None,
    user_lon: Optional[float] = None,
    radius_km: float = 100.0,
    partner_type: Optional[str] = None,
    scheme_name: Optional[str] = None,
    district: Optional[str] = None,
    state: Optional[str] = None,
) -> List[PartnerResponse]:
    results = []

    for p in partners:
        if not p.active:
            continue

        if partner_type and p.type != partner_type:
            continue

        if district and district.lower() not in p.district.lower():
            continue

        if state and state.lower() not in p.state.lower():
            continue

        if scheme_name:
            supported = [s.lower() for s in (p.supported_schemes or [])]
            if not any(scheme_name.lower() in s for s in supported):
                continue

        dist = None
        if user_lat is not None and user_lon is not None:
            dist = haversine_distance(user_lat, user_lon, p.latitude, p.longitude)
            if dist > radius_km:
                continue

        results.append(
            PartnerResponse(
                id=str(p.id),
                name=p.name,
                type=p.type,
                address=p.address,
                state=p.state,
                district=p.district,
                pincode=p.pincode,
                latitude=p.latitude,
                longitude=p.longitude,
                supported_schemes=p.supported_schemes or [],
                active=p.active,
                capacity_status=p.capacity_status,
                phone=p.phone,
                email=p.email,
                distance=dist,
            )
        )

    # Sort by distance if available, otherwise by name
    if user_lat is not None and user_lon is not None:
        results.sort(key=lambda x: (x.distance if x.distance is not None else 999999))
    else:
        results.sort(key=lambda x: x.name)

    return results
