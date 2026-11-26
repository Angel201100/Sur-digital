from app.models import User
from app.schemas import UserOut


def serialize_user(user: User, permissions: list[str] | None = None) -> UserOut:
    return UserOut(
        id=user.id,
        first_name=user.first_name,
        last_name=user.last_name,
        document_type=user.document_type,
        document_number=user.document_number,
        address=user.address,
        phone=user.phone,
        email=user.email,
        accepted_data_policy=user.accepted_data_policy,
        is_active=user.is_active,
        role_id=user.role_id,
        role_code=user.role.code,
        role_name=user.role.name,
        permissions=permissions or [],
    )


def serialize_role_permissions(user: User) -> list[str]:
    return sorted(permission.code for permission in user.role.permissions)
