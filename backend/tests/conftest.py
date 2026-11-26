import os

os.environ["JWT_SECRET"] = "test-only-secret-that-is-at-least-32-characters"
os.environ["DATABASE_URL"] = "sqlite:///./test-only.db"

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.main import app
from app.models import Permission, Role, User
from app.services.security import hash_password


@pytest.fixture
def client(tmp_path):
    database_path = tmp_path / "test.db"
    engine = create_engine(
        f"sqlite:///{database_path.as_posix()}",
        connect_args={"check_same_thread": False},
    )
    Base.metadata.create_all(engine)
    test_sessions = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)

    with test_sessions() as session:
        permission_definitions = [
            ("services.read", "Leer servicios", "services"),
            ("profile.read", "Leer perfil", "profile"),
            ("users.read", "Consultar usuarios", "users"),
            ("users.create", "Crear usuarios", "users"),
            ("users.update", "Actualizar usuarios", "users"),
            ("users.delete", "Desactivar usuarios", "users"),
            ("clients.read", "Consultar clientes", "clients"),
            ("clients.create", "Crear clientes", "clients"),
            ("clients.update", "Actualizar clientes", "clients"),
            ("clients.delete", "Desactivar clientes", "clients"),
            ("roles.read", "Consultar roles", "roles"),
            ("roles.create", "Crear roles", "roles"),
            ("roles.update", "Actualizar roles", "roles"),
            ("roles.delete", "Eliminar roles", "roles"),
            ("permissions.read", "Consultar permisos", "permissions"),
            ("permissions.create", "Crear permisos", "permissions"),
            ("permissions.update", "Actualizar permisos", "permissions"),
            ("permissions.delete", "Eliminar permisos", "permissions"),
            ("services.create", "Crear servicios", "services"),
            ("services.update", "Actualizar servicios", "services"),
            ("services.delete", "Desactivar servicios", "services"),
        ]
        permission_objects = {
            code: Permission(code=code, name=name, module=module)
            for code, name, module in permission_definitions
        }
        client_role = Role(
            code="client",
            name="Cliente",
            permissions=[permission_objects["services.read"], permission_objects["profile.read"]],
        )
        admin_role = Role(
            code="admin",
            name="Administrador",
            permissions=list(permission_objects.values()),
        )
        session.add_all([client_role, admin_role])
        session.commit()
        session.add(
            User(
                first_name="María",
                last_name="Equipo",
                document_type="CC",
                document_number="ADMIN-12345",
                address="Calle 1 # 2-3",
                phone="+573001234568",
                email="admin@example.com",
                password_hash=hash_password("Gestion!Segura2026"),
                accepted_data_policy=True,
                role_id=admin_role.id,
            )
        )
        session.commit()

    def override_get_db():
        with test_sessions() as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db
    app.state.test_session_factory = test_sessions
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
    del app.state.test_session_factory
    engine.dispose()
