from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, UserRole
from app.models.applicant_profile import ApplicantProfile
from app.schemas.user import (
    UserRegister, UserLogin, AuthResponse, UserResponse,
    UserAdminCreate, UserAdminUpdate, ProfileResponse, ProfileUpdate
)
from app.utils.security import hash_password, verify_password, create_access_token
from app.middleware.auth import get_optional_admin

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(data: UserRegister, db: Session = Depends(get_db)):
    """Register a new user."""
    email = data.email.strip().lower()
    # Check if email already exists
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    # Create user
    user = User(
        name=data.name,
        email=email,
        password_hash=hash_password(data.password),
        mobile=data.mobile,
        language=data.language or "en",
        role=UserRole.BENEFICIARY,
    )
    db.add(user)
    db.flush()
    
    # Create empty applicant profile
    profile = ApplicantProfile(user_id=user.id)
    db.add(profile)
    db.commit()
    db.refresh(user)
    
    # Generate token
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return AuthResponse(
        access_token=access_token,
        user=UserResponse(
            id=str(user.id),
            name=user.name,
            email=user.email,
            mobile=user.mobile,
            language=user.language,
            role=user.role.value,
            location=user.location,
            is_active=user.is_active if user.is_active is not None else True,
            created_at=user.created_at,
        ),
    )


@router.post("/login", response_model=AuthResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    """Login with email and password."""
    email = data.email.strip().lower()
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is suspended. Please contact administrator.",
        )
    
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return AuthResponse(
        access_token=access_token,
        user=UserResponse(
            id=str(user.id),
            name=user.name,
            email=user.email,
            mobile=user.mobile,
            language=user.language,
            role=user.role.value,
            location=user.location,
            is_active=user.is_active if user.is_active is not None else True,
            created_at=user.created_at,
        ),
    )


@router.get("/users", response_model=List[UserResponse])
def list_users(db: Session = Depends(get_db)):
    """List all users."""
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [
        UserResponse(
            id=str(u.id),
            name=u.name,
            email=u.email,
            mobile=u.mobile,
            language=u.language,
            role=u.role.value,
            location=u.location,
            is_active=u.is_active if u.is_active is not None else True,
            created_at=u.created_at,
        )
        for u in users
    ]


@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def admin_create_user(data: UserAdminCreate, db: Session = Depends(get_db)):
    """Admin create user."""
    email = data.email.strip().lower()
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    try:
        user_role = UserRole[data.role.upper()]
    except KeyError:
        user_role = UserRole.BENEFICIARY
        
    user = User(
        name=data.name,
        email=email,
        password_hash=hash_password(data.password),
        mobile=data.mobile,
        language=data.language or "en",
        role=user_role,
        is_active=data.is_active if data.is_active is not None else True,
    )
    db.add(user)
    db.flush()
    profile = ApplicantProfile(user_id=user.id)
    db.add(profile)
    db.commit()
    db.refresh(user)
    return UserResponse(
        id=str(user.id),
        name=user.name,
        email=user.email,
        mobile=user.mobile,
        language=user.language,
        role=user.role.value,
        location=user.location,
        is_active=user.is_active if user.is_active is not None else True,
        created_at=user.created_at,
    )


@router.put("/users/{user_id}", response_model=UserResponse)
def admin_update_user(user_id: str, data: UserAdminUpdate, db: Session = Depends(get_db)):
    """Admin update user details or role."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if data.name is not None:
        user.name = data.name
    if data.email is not None:
        user.email = data.email.strip().lower()
    if data.mobile is not None:
        user.mobile = data.mobile
    if data.language is not None:
        user.language = data.language
    if data.role is not None:
        try:
            user.role = UserRole[data.role.upper()]
        except KeyError:
            pass
    if data.is_active is not None:
        user.is_active = data.is_active
            
    db.commit()
    db.refresh(user)
    return UserResponse(
        id=str(user.id),
        name=user.name,
        email=user.email,
        mobile=user.mobile,
        language=user.language,
        role=user.role.value,
        location=user.location,
        is_active=user.is_active if user.is_active is not None else True,
        created_at=user.created_at,
    )


@router.delete("/users/{user_id}")
def admin_delete_user(user_id: str, db: Session = Depends(get_db)):
    """Admin delete user."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    db.delete(user)
    db.commit()
    return {"status": "success", "message": f"User {user_id} deleted successfully"}


def _build_profile_response(user: User, profile: Optional[ApplicantProfile]) -> ProfileResponse:
    return ProfileResponse(
        user_id=str(user.id),
        name=user.name,
        email=user.email,
        mobile=user.mobile,
        language=user.language or "en",
        role=user.role.value if hasattr(user.role, 'value') else str(user.role),
        annual_income=profile.annual_income if profile else None,
        category=profile.category if profile else None,
        gender=profile.gender if profile else "male",
        age=profile.age if profile else None,
        occupation=profile.occupation if profile else None,
        education_status=profile.education_status if profile else None,
        district=profile.district if profile else None,
        state=profile.state if profile else None,
        pincode=profile.pincode if profile else None,
        created_at=profile.created_at if profile and profile.created_at else user.created_at,
    )


@router.get("/me", response_model=ProfileResponse)
def get_me(db: Session = Depends(get_db), current_user: Optional[User] = Depends(get_optional_admin)):
    """Get current user details and applicant profile."""
    user = current_user
    if not user:
        user = db.query(User).filter(User.role == UserRole.BENEFICIARY).first() or db.query(User).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    profile = db.query(ApplicantProfile).filter(ApplicantProfile.user_id == user.id).first()
    return _build_profile_response(user, profile)


@router.get("/profile", response_model=ProfileResponse)
def get_profile(db: Session = Depends(get_db), current_user: Optional[User] = Depends(get_optional_admin)):
    """Get current beneficiary profile."""
    user = current_user
    if not user:
        user = db.query(User).filter(User.role == UserRole.BENEFICIARY).first() or db.query(User).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    profile = db.query(ApplicantProfile).filter(ApplicantProfile.user_id == user.id).first()
    if not profile:
        profile = ApplicantProfile(user_id=user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return _build_profile_response(user, profile)


@router.put("/profile", response_model=ProfileResponse)
def update_profile(data: ProfileUpdate, db: Session = Depends(get_db), current_user: Optional[User] = Depends(get_optional_admin)):
    """Update user personal details and applicant profile data."""
    user = current_user
    if not user:
        user = db.query(User).filter(User.role == UserRole.BENEFICIARY).first() or db.query(User).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if data.name is not None and data.name.strip():
        user.name = data.name.strip()
    if data.mobile is not None:
        user.mobile = data.mobile.strip() if data.mobile else None
    if data.language is not None and data.language.strip():
        user.language = data.language.strip()
        
    profile = db.query(ApplicantProfile).filter(ApplicantProfile.user_id == user.id).first()
    if not profile:
        profile = ApplicantProfile(user_id=user.id)
        db.add(profile)
        
    if data.annual_income is not None:
        profile.annual_income = data.annual_income
    if data.category is not None:
        profile.category = data.category.strip()
    if data.gender is not None:
        profile.gender = data.gender.strip()
    if data.age is not None:
        profile.age = data.age
    if data.occupation is not None:
        profile.occupation = data.occupation.strip()
    if data.education_status is not None:
        profile.education_status = data.education_status.strip()
    if data.district is not None:
        profile.district = data.district.strip()
    if data.state is not None:
        profile.state = data.state.strip()
    if data.pincode is not None:
        profile.pincode = data.pincode.strip()
        
    db.commit()
    db.refresh(user)
    db.refresh(profile)
    return _build_profile_response(user, profile)
