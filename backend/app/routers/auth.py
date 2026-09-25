from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, UserRole
from app.models.applicant_profile import ApplicantProfile
from app.schemas.user import UserRegister, UserLogin, AuthResponse, UserResponse
from app.utils.security import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(data: UserRegister, db: Session = Depends(get_db)):
    """Register a new user."""
    # Check if email already exists
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    # Create user
    user = User(
        name=data.name,
        email=data.email,
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
            created_at=user.created_at,
        ),
    )


@router.post("/login", response_model=AuthResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    """Login with email and password."""
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
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
            created_at=user.created_at,
        ),
    )
