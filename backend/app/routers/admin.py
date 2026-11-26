import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.dependencies import get_current_user, require_permission
from app.models import Permission, Role, Service, User
from app.schemas import (
    AdminUserCreate,
    AdminUserUpdate,
    MessageOut,
    PermissionAssignment,
    PermissionCreate,
    PermissionOut,
    PermissionUpdate,
    RoleCreate,
    RoleOut,
    RoleUpdate,
    ServiceCreate,
    ServiceOut,
    ServiceUpdate,
    UserOut,
)
from app.services.security import hash_password, validate_password
from app.services.users import serialize_user


router = APIRouter(prefix="/admin", tags=["Administración"])


def _commit_or_conflict(db: Session, error_message: str) -> None:
    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=error_message) from error


def _get_role(db: Session, role_id: uuid.UUID) -> Role:
    role = db.get(Role, role_id)
    if role is None or not role.is_active:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="El rol seleccionado no existe o está inactivo.")
    return role


def _get_user(db: Session, user_id: uuid.UUID, role_code: str | None = None) -> User:
    statement = select(User).options(joinedload(User.role)).where(User.id == user_id)
    if role_code:
        statement = statement.join(Role).where(Role.code == role_code)
    user = db.scalar(statement)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No se encontró el usuario solicitado.")
    return user


def _list_users(db: Session, limit: int, role_code: str | None = None) -> list[User]:
    statement = select(User).options(joinedload(User.role)).order_by(User.created_at.desc()).limit(limit)
    if role_code:
        statement = statement.join(Role).where(Role.code == role_code)
    return list(db.scalars(statement).unique())


def _create_user(db: Session, payload: AdminUserCreate, role: Role) -> UserOut:
    try:
        validate_password(payload.password, payload.first_name, payload.last_name)
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(error)) from error
    user = User(
        first_name=payload.first_name.strip(),
        last_name=payload.last_name.strip(),
        document_type=payload.document_type,
        document_number=payload.document_number.strip(),
        address=payload.address.strip(),
        phone=payload.phone,
        email=str(payload.email).lower(),
        password_hash=hash_password(payload.password),
        accepted_data_policy=payload.accepted_data_policy,
        is_active=payload.is_active,
        role_id=role.id,
    )
    db.add(user)
    _commit_or_conflict(db, "El correo o el número de documento ya está registrado.")
    return serialize_user(_get_user(db, user.id))


def _update_user(
    db: Session,
    user_id: uuid.UUID,
    payload: AdminUserUpdate,
    role_code: str | None = None,
) -> UserOut:
    user = _get_user(db, user_id, role_code)
    changes = {key: value for key, value in payload.model_dump(exclude_unset=True).items() if value is not None}
    if "role_id" in changes:
        if role_code == "client" and changes["role_id"] != user.role_id:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="No se puede cambiar el rol desde la gestión de clientes.")
        _get_role(db, changes["role_id"])
    if "email" in changes:
        changes["email"] = str(changes["email"]).lower()
    if "first_name" in changes:
        changes["first_name"] = changes["first_name"].strip()
    if "last_name" in changes:
        changes["last_name"] = changes["last_name"].strip()
    if "document_number" in changes:
        changes["document_number"] = changes["document_number"].strip()
    if "address" in changes:
        changes["address"] = changes["address"].strip()
    for key, value in changes.items():
        setattr(user, key, value)
    _commit_or_conflict(db, "El correo o el número de documento ya está registrado.")
    db.expire(user, ["role"])
    return serialize_user(_get_user(db, user.id))


def _deactivate_user(
    db: Session,
    user_id: uuid.UUID,
    actor: User,
    role_code: str | None = None,
) -> MessageOut:
    user = _get_user(db, user_id, role_code)
    if user.id == actor.id:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="No puedes desactivar tu propia cuenta.")
    user.is_active = False
    _commit_or_conflict(db, "No se pudo desactivar el usuario.")
    return MessageOut(message="El usuario quedó inactivo.")


def _serialize_role(role: Role) -> RoleOut:
    return RoleOut(
        id=role.id,
        code=role.code,
        name=role.name,
        description=role.description,
        is_active=role.is_active,
        permission_ids=sorted(permission.id for permission in role.permissions),
        permission_codes=sorted(permission.code for permission in role.permissions),
    )


@router.get("/users", response_model=list[UserOut])
def list_users(
    limit: int = Query(default=200, ge=1, le=500),
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("users.read")),
) -> list[UserOut]:
    return [serialize_user(user) for user in _list_users(db, limit)]


@router.post("/users", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(
    payload: AdminUserCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("users.create")),
) -> UserOut:
    if payload.role_id is None:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Selecciona un rol.")
    return _create_user(db, payload, _get_role(db, payload.role_id))


@router.patch("/users/{user_id}", response_model=UserOut)
def update_user(
    user_id: uuid.UUID,
    payload: AdminUserUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("users.update")),
) -> UserOut:
    return _update_user(db, user_id, payload)


@router.delete("/users/{user_id}", response_model=MessageOut)
def deactivate_user(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    actor: User = Depends(require_permission("users.delete")),
) -> MessageOut:
    return _deactivate_user(db, user_id, actor)


@router.get("/clients", response_model=list[UserOut])
def list_clients(
    limit: int = Query(default=200, ge=1, le=500),
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("clients.read")),
) -> list[UserOut]:
    return [serialize_user(user) for user in _list_users(db, limit, "client")]


@router.post("/clients", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_client(
    payload: AdminUserCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("clients.create")),
) -> UserOut:
    client_role = db.scalar(select(Role).where(Role.code == "client", Role.is_active.is_(True)))
    if client_role is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="No está configurado el rol de cliente.")
    payload.role_id = client_role.id
    return _create_user(db, payload, client_role)


@router.patch("/clients/{user_id}", response_model=UserOut)
def update_client(
    user_id: uuid.UUID,
    payload: AdminUserUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("clients.update")),
) -> UserOut:
    return _update_user(db, user_id, payload, "client")


@router.delete("/clients/{user_id}", response_model=MessageOut)
def deactivate_client(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    actor: User = Depends(require_permission("clients.delete")),
) -> MessageOut:
    return _deactivate_user(db, user_id, actor, "client")


@router.get("/roles", response_model=list[RoleOut])
def list_roles(
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("roles.read")),
) -> list[RoleOut]:
    roles = db.scalars(select(Role).order_by(Role.name)).all()
    return [_serialize_role(role) for role in roles]


@router.post("/roles", response_model=RoleOut, status_code=status.HTTP_201_CREATED)
def create_role(
    payload: RoleCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("roles.create")),
) -> RoleOut:
    role = Role(**payload.model_dump())
    db.add(role)
    _commit_or_conflict(db, "Ya existe un rol con ese código.")
    return _serialize_role(role)


@router.patch("/roles/{role_id}", response_model=RoleOut)
def update_role(
    role_id: uuid.UUID,
    payload: RoleUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("roles.update")),
) -> RoleOut:
    role = db.get(Role, role_id)
    if role is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No se encontró el rol solicitado.")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(role, key, value)
    _commit_or_conflict(db, "Ya existe un rol con ese código.")
    return _serialize_role(role)


@router.delete("/roles/{role_id}", response_model=MessageOut)
def delete_role(
    role_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("roles.delete")),
) -> MessageOut:
    role = db.get(Role, role_id)
    if role is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No se encontró el rol solicitado.")
    db.delete(role)
    _commit_or_conflict(db, "El rol está en uso y no se puede eliminar.")
    return MessageOut(message="Rol eliminado.")


@router.put("/roles/{role_id}/permissions", response_model=RoleOut)
def set_role_permissions(
    role_id: uuid.UUID,
    payload: PermissionAssignment,
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("roles.update")),
) -> RoleOut:
    role = db.get(Role, role_id)
    if role is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No se encontró el rol solicitado.")
    unique_ids = set(payload.permission_ids)
    permissions = list(db.scalars(select(Permission).where(Permission.id.in_(unique_ids)))) if unique_ids else []
    if len(permissions) != len(unique_ids):
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="La lista contiene permisos inexistentes.")
    role.permissions = permissions
    _commit_or_conflict(db, "No se pudieron guardar los permisos del rol.")
    return _serialize_role(role)


@router.get("/permissions", response_model=list[PermissionOut])
def list_permissions(
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("permissions.read")),
) -> list[PermissionOut]:
    return list(db.scalars(select(Permission).order_by(Permission.module, Permission.code)))


@router.post("/permissions", response_model=PermissionOut, status_code=status.HTTP_201_CREATED)
def create_permission(
    payload: PermissionCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("permissions.create")),
) -> PermissionOut:
    permission = Permission(**payload.model_dump())
    db.add(permission)
    _commit_or_conflict(db, "Ya existe un permiso con ese código.")
    return permission


@router.patch("/permissions/{permission_id}", response_model=PermissionOut)
def update_permission(
    permission_id: uuid.UUID,
    payload: PermissionUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("permissions.update")),
) -> PermissionOut:
    permission = db.get(Permission, permission_id)
    if permission is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No se encontró el permiso solicitado.")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(permission, key, value)
    _commit_or_conflict(db, "Ya existe un permiso con ese código.")
    return permission


@router.delete("/permissions/{permission_id}", response_model=MessageOut)
def delete_permission(
    permission_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("permissions.delete")),
) -> MessageOut:
    permission = db.get(Permission, permission_id)
    if permission is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No se encontró el permiso solicitado.")
    db.delete(permission)
    _commit_or_conflict(db, "No se pudo eliminar el permiso.")
    return MessageOut(message="Permiso eliminado.")


@router.get("/services", response_model=list[ServiceOut])
def list_services(
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("services.read")),
) -> list[ServiceOut]:
    return list(db.scalars(select(Service).order_by(Service.sort_order, Service.title)))


@router.post("/services", response_model=ServiceOut, status_code=status.HTTP_201_CREATED)
def create_service(
    payload: ServiceCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("services.create")),
) -> ServiceOut:
    service = Service(**payload.model_dump())
    db.add(service)
    _commit_or_conflict(db, "Ya existe un servicio con ese identificador.")
    return service


@router.patch("/services/{service_id}", response_model=ServiceOut)
def update_service(
    service_id: uuid.UUID,
    payload: ServiceUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("services.update")),
) -> ServiceOut:
    service = db.get(Service, service_id)
    if service is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No se encontró el servicio solicitado.")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(service, key, value)
    _commit_or_conflict(db, "Ya existe un servicio con ese identificador.")
    return service


@router.delete("/services/{service_id}", response_model=MessageOut)
def deactivate_service(
    service_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("services.delete")),
) -> MessageOut:
    service = db.get(Service, service_id)
    if service is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No se encontró el servicio solicitado.")
    service.is_active = False
    _commit_or_conflict(db, "No se pudo desactivar el servicio.")
    return MessageOut(message="El servicio quedó inactivo.")
