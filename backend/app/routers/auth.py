import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from app.config import settings
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import PasswordResetToken, Role, User
from app.schemas import (
    LoginRequest,
    MessageOut,
    PasswordResetConfirm,
    PasswordResetRequest,
    RegisterRequest,
    TokenResponse,
    UserOut,
)
from app.services.email import send_password_reset_email
from app.services.security import (
    create_access_token,
    hash_password,
    validate_password,
    verify_password,
)
from app.services.users import serialize_role_permissions, serialize_user
from app.dependencies import get_current_user


router = APIRouter(prefix="/auth", tags=["Autenticación"])


def user_token_response(user: User) -> TokenResponse:
    return TokenResponse(
        access_token=create_access_token(user.id),
        user=serialize_user(user, serialize_role_permissions(user)),
    )


@router.post("/register", response_model=MessageOut, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> MessageOut:
    try:
        validate_password(payload.password, payload.first_name, payload.last_name)
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(error)) from error

    client_role = db.scalar(select(Role).where(Role.code == "client", Role.is_active.is_(True)))
    if client_role is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="No está configurado el rol de cliente.")

    user = User(
        first_name=payload.first_name,
        last_name=payload.last_name,
        document_type=payload.document_type,
        document_number=payload.document_number,
        address=payload.address,
        phone=payload.phone,
        email=str(payload.email).lower(),
        password_hash=hash_password(payload.password),
        accepted_data_policy=True,
        role_id=client_role.id,
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El correo o el número de documento ya está registrado.",
        ) from error
    return MessageOut(message="Cuenta creada. Ya puedes iniciar sesión.")


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    user = db.scalar(select(User).where(User.email == str(payload.email).lower()))
    if user is None or not user.is_active or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user_token_response(user)


@router.get("/me", response_model=UserOut)
def current_user(user: User = Depends(get_current_user)) -> UserOut:
    return serialize_user(user, serialize_role_permissions(user))


@router.post("/password-reset/request", response_model=MessageOut)
def request_password_reset(
    payload: PasswordResetRequest,
    db: Session = Depends(get_db),
) -> MessageOut:
    if not settings.smtp_host or not settings.smtp_from_email:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="La recuperación por correo no está configurada en este servidor.",
        )
    user = db.scalar(
        select(User).where(
            User.email == str(payload.email).lower(),
            User.is_active.is_(True),
            User.password_hash.is_not(None),
        )
    )
    if user is not None:
        raw_token = secrets.token_urlsafe(32)
        reset = PasswordResetToken(
            user_id=user.id,
            token_hash=hashlib.sha256(raw_token.encode("utf-8")).hexdigest(),
            expires_at=datetime.now(timezone.utc) + timedelta(minutes=30),
        )
        db.add(reset)
        db.commit()
        try:
            send_password_reset_email(user.email, raw_token)
        except RuntimeError as error:
            db.delete(reset)
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=str(error),
            ) from error
    return MessageOut(message="Si el correo está registrado, recibirás instrucciones para recuperar tu cuenta.")


@router.post("/password-reset/confirm", response_model=MessageOut)
def confirm_password_reset(
    payload: PasswordResetConfirm,
    db: Session = Depends(get_db),
) -> MessageOut:
    token_hash = hashlib.sha256(payload.token.encode("utf-8")).hexdigest()
    reset = db.scalar(
        select(PasswordResetToken).where(
            PasswordResetToken.token_hash == token_hash,
            PasswordResetToken.used_at.is_(None),
        )
    )
    if reset is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El enlace no es válido o ya fue utilizado.")
    expires_at = reset.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at <= datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El enlace de recuperación venció.")

    user = db.get(User, reset.user_id)
    if user is None or not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No se puede recuperar esta cuenta.")
    try:
        validate_password(payload.new_password, user.first_name, user.last_name)
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(error)) from error

    user.password_hash = hash_password(payload.new_password)
    reset.used_at = datetime.now(timezone.utc)
    db.commit()
    return MessageOut(message="Contraseña actualizada. Ya puedes iniciar sesión.")
