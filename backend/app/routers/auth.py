from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, UserRole
from app.models.applicant_profile import ApplicantProfile
from app.schemas.user import UserRegister, UserLogin, AuthResponse, UserResponse, UserAdminCreate, UserAdminUpdate
from app.utils.security import hash_password, verify_password, create_access_token

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
