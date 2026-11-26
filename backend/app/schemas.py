import uuid
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


DocumentType = Literal["CC", "CE", "NIT", "PASSPORT", "TI"]
PHONE_PATTERN = r"^\+?[0-9]{7,15}$"


class RegisterRequest(BaseModel):
    first_name: str = Field(min_length=2, max_length=80)
    last_name: str = Field(min_length=2, max_length=80)
    document_type: DocumentType
    document_number: str = Field(min_length=5, max_length=30, pattern=r"^[A-Za-z0-9.-]+$")
    address: str = Field(min_length=5, max_length=200)
    phone: str = Field(pattern=PHONE_PATTERN)
    email: EmailStr
    password: str = Field(min_length=10, max_length=128)
    accepted_data_policy: Literal[True]

    @field_validator("first_name", "last_name", "document_number", "address", "email")
    @classmethod
    def strip_text(cls, value: str) -> str:
        return value.strip()


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    token: str = Field(min_length=20, max_length=200)
    new_password: str = Field(min_length=10, max_length=128)


class UserOut(BaseModel):
    id: uuid.UUID
    first_name: str
    last_name: str
    document_type: str
    document_number: str
    address: str
    phone: str
    email: EmailStr
    accepted_data_policy: bool
    is_active: bool
    role_id: uuid.UUID
    role_code: str
    role_name: str
    permissions: list[str] = Field(default_factory=list)


class TokenResponse(BaseModel):
    access_token: str
    token_type: Literal["bearer"] = "bearer"
    user: UserOut


class AdminUserCreate(BaseModel):
    first_name: str = Field(min_length=2, max_length=80)
    last_name: str = Field(min_length=2, max_length=80)
    document_type: DocumentType
    document_number: str = Field(min_length=5, max_length=30, pattern=r"^[A-Za-z0-9.-]+$")
    address: str = Field(min_length=5, max_length=200)
    phone: str = Field(pattern=PHONE_PATTERN)
    email: EmailStr
    password: str = Field(min_length=10, max_length=128)
    role_id: uuid.UUID
    is_active: bool = True
    accepted_data_policy: bool = True


class AdminUserUpdate(BaseModel):
    first_name: str | None = Field(default=None, min_length=2, max_length=80)
    last_name: str | None = Field(default=None, min_length=2, max_length=80)
    document_type: DocumentType | None = None
    document_number: str | None = Field(
        default=None, min_length=5, max_length=30, pattern=r"^[A-Za-z0-9.-]+$"
    )
    address: str | None = Field(default=None, min_length=5, max_length=200)
    phone: str | None = Field(default=None, pattern=PHONE_PATTERN)
    email: EmailStr | None = None
    role_id: uuid.UUID | None = None
    is_active: bool | None = None
    accepted_data_policy: bool | None = None


class RoleCreate(BaseModel):
    code: str = Field(min_length=2, max_length=40, pattern=r"^[a-z][a-z0-9_-]*$")
    name: str = Field(min_length=2, max_length=80)
    description: str | None = Field(default=None, max_length=250)
    is_active: bool = True


class RoleUpdate(BaseModel):
    code: str | None = Field(default=None, min_length=2, max_length=40, pattern=r"^[a-z][a-z0-9_-]*$")
    name: str | None = Field(default=None, min_length=2, max_length=80)
    description: str | None = Field(default=None, max_length=250)
    is_active: bool | None = None


class RoleOut(BaseModel):
    id: uuid.UUID
    code: str
    name: str
    description: str | None
    is_active: bool
    permission_ids: list[uuid.UUID] = Field(default_factory=list)
    permission_codes: list[str] = Field(default_factory=list)


class PermissionCreate(BaseModel):
    code: str = Field(min_length=3, max_length=80, pattern=r"^[a-z][a-z0-9_.-]*$")
    name: str = Field(min_length=2, max_length=100)
    module: str = Field(min_length=2, max_length=60)
    description: str | None = Field(default=None, max_length=250)


class PermissionUpdate(BaseModel):
    code: str | None = Field(default=None, min_length=3, max_length=80, pattern=r"^[a-z][a-z0-9_.-]*$")
    name: str | None = Field(default=None, min_length=2, max_length=100)
    module: str | None = Field(default=None, min_length=2, max_length=60)
    description: str | None = Field(default=None, max_length=250)


class PermissionOut(BaseModel):
    id: uuid.UUID
    code: str
    name: str
    module: str
    description: str | None


class PermissionAssignment(BaseModel):
    permission_ids: list[uuid.UUID]


class ServiceCreate(BaseModel):
    slug: str = Field(min_length=2, max_length=100, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    title: str = Field(min_length=2, max_length=120)
    description: str = Field(min_length=5)
    is_active: bool = True
    sort_order: int = Field(default=0, ge=0)


class ServiceUpdate(BaseModel):
    slug: str | None = Field(default=None, min_length=2, max_length=100, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    title: str | None = Field(default=None, min_length=2, max_length=120)
    description: str | None = Field(default=None, min_length=5)
    is_active: bool | None = None
    sort_order: int | None = Field(default=None, ge=0)


class ServiceOut(BaseModel):
    id: uuid.UUID
    slug: str
    title: str
    description: str
    is_active: bool
    sort_order: int

    model_config = ConfigDict(from_attributes=True)


class MessageOut(BaseModel):
    message: str
