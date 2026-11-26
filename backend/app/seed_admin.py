from sqlalchemy import select

from app.config import settings
from app.database import SessionLocal
from app.models import Role, User
from app.services.security import hash_password, validate_password


def main() -> None:
    email = settings.initial_admin_email
    password = (
        settings.initial_admin_password.get_secret_value()
        if settings.initial_admin_password is not None
        else ""
    )
    if not email or not password:
        raise RuntimeError(
            "Define INITIAL_ADMIN_EMAIL e INITIAL_ADMIN_PASSWORD en backend/.env antes de crear el administrador."
        )

    validate_password(password, "Administrador", "Inicial")
    with SessionLocal() as db:
        role = db.scalar(select(Role).where(Role.code == "admin"))
        if role is None:
            raise RuntimeError("No existe el rol admin. Ejecuta primero backend/database/schema.sql.")
        user = db.scalar(select(User).where(User.email == email.lower()))
        if user is None:
            user = User(
                first_name="Administrador",
                last_name="Sur Digital",
                document_type="NIT",
                document_number="ADMIN-BOOTSTRAP-0001",
                address="Actualizar datos de contacto",
                phone="+570000000000",
                email=email.lower(),
                accepted_data_policy=True,
                role_id=role.id,
            )
            db.add(user)
        user.password_hash = hash_password(password)
        user.is_active = True
        db.commit()
        print(f"Administrador configurado: {user.email}")


if __name__ == "__main__":
    main()
