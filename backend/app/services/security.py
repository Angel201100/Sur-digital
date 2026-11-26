import re
import uuid
from datetime import datetime, timedelta, timezone

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError, VerifyMismatchError

from app.config import settings


password_hasher = PasswordHasher()


def validate_password(password: str, first_name: str = "", last_name: str = "") -> None:
    checks = (
        (len(password) >= 10, "Debe tener al menos 10 caracteres."),
        (len(password) <= 128, "No debe superar 128 caracteres."),
        (re.search(r"[A-Z]", password) is not None, "Debe incluir una letra mayúscula."),
        (re.search(r"[a-z]", password) is not None, "Debe incluir una letra minúscula."),
        (re.search(r"\d", password) is not None, "Debe incluir un número."),
        (re.search(r"[^A-Za-z0-9]", password) is not None, "Debe incluir un carácter especial."),
    )
    failed = [message for valid, message in checks if not valid]
    normalized_password = password.casefold()
    for label, value in (("nombre", first_name), ("apellido", last_name)):
        normalized_value = value.strip().casefold()
        if normalized_value and normalized_value in normalized_password:
            failed.append(f"No debe incluir el {label} del usuario.")
    if failed:
        raise ValueError(" ".join(failed))


def hash_password(password: str) -> str:
    return password_hasher.hash(password)


def verify_password(password: str, encoded_hash: str | None) -> bool:
    if not encoded_hash:
        return False
    try:
        return password_hasher.verify(encoded_hash, password)
    except (InvalidHashError, VerificationError, VerifyMismatchError):
        return False


def create_access_token(user_id: uuid.UUID) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "iat": now,
        "exp": now + timedelta(minutes=settings.access_token_minutes),
    }
    return jwt.encode(payload, settings.jwt_secret.get_secret_value(), algorithm=settings.jwt_algorithm)
