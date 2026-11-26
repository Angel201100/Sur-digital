from sqlalchemy import select

from app.models import User


def registration_payload(**overrides):
    return {
        "first_name": "Ana",
        "last_name": "Pérez",
        "document_type": "CC",
        "document_number": "123456789",
        "address": "Calle 10 # 20-30",
        "phone": "+573001234567",
        "email": "ana@example.com",
        "password": "Fuerte!Clave72",
        "accepted_data_policy": True,
        **overrides,
    }


def test_register_login_and_enforce_server_permissions(client):
    created = client.post("/api/auth/register", json=registration_payload())
    assert created.status_code == 201

    with client.app.state.test_session_factory() as session:
        user = session.scalar(select(User).where(User.email == "ana@example.com"))
        assert user is not None
        assert user.password_hash.startswith("$argon2")
        assert user.password_hash != "Fuerte!Clave72"

    login = client.post(
        "/api/auth/login",
        json={"email": "ana@example.com", "password": "Fuerte!Clave72"},
    )
    assert login.status_code == 200
    token = login.json()["access_token"]
    assert login.json()["user"]["role_code"] == "client"
    assert "services.read" in login.json()["user"]["permissions"]

    profile = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert profile.status_code == 200
    assert profile.json()["email"] == "ana@example.com"

    forbidden = client.get("/api/admin/users", headers={"Authorization": f"Bearer {token}"})
    assert forbidden.status_code == 403


def test_register_rejects_weak_password_and_unaccepted_policy(client):
    weak_password = client.post(
        "/api/auth/register",
        json=registration_payload(password="Ana123"),
    )
    assert weak_password.status_code == 422

    missing_consent = client.post(
        "/api/auth/register",
        json=registration_payload(accepted_data_policy=False),
    )
    assert missing_consent.status_code == 422

    password_contains_name = client.post(
        "/api/auth/register",
        json=registration_payload(password="Pérez!Clave2026"),
    )
    assert password_contains_name.status_code == 422


def test_duplicate_registration_and_invalid_credentials(client):
    assert client.post("/api/auth/register", json=registration_payload()).status_code == 201
    duplicate = client.post("/api/auth/register", json=registration_payload(document_number="987654321"))
    assert duplicate.status_code == 409

    invalid_login = client.post(
        "/api/auth/login",
        json={"email": "ana@example.com", "password": "Incorrecta!2026"},
    )
    assert invalid_login.status_code == 401


def test_password_reset_email_and_single_use_token(client, monkeypatch):
    created = client.post("/api/auth/register", json=registration_payload())
    assert created.status_code == 201

    import app.routers.auth as auth_router
    from app.config import settings

    monkeypatch.setattr(settings, "smtp_host", "smtp.test")
    monkeypatch.setattr(settings, "smtp_from_email", "no-reply@example.com")
    delivered = {}

    def capture_email(recipient, token):
        delivered.update(recipient=recipient, token=token)

    monkeypatch.setattr(auth_router, "send_password_reset_email", capture_email)
    requested = client.post(
        "/api/auth/password-reset/request",
        json={"email": "ana@example.com"},
    )
    assert requested.status_code == 200
    assert "token" not in requested.json()["message"].lower()
    assert delivered["recipient"] == "ana@example.com"

    confirmation = client.post(
        "/api/auth/password-reset/confirm",
        json={"token": delivered["token"], "new_password": "Otra!Clave903"},
    )
    assert confirmation.status_code == 200

    login = client.post(
        "/api/auth/login",
        json={"email": "ana@example.com", "password": "Otra!Clave903"},
    )
    assert login.status_code == 200

    reused_token = client.post(
        "/api/auth/password-reset/confirm",
        json={"token": delivered["token"], "new_password": "Tercera!Clave904"},
    )
    assert reused_token.status_code == 400


def test_recovery_requires_smtp_without_exposing_account_existence(client):
    assert client.post("/api/auth/register", json=registration_payload()).status_code == 201

    configured_account = client.post(
        "/api/auth/password-reset/request",
        json={"email": "ana@example.com"},
    )
    unknown_account = client.post(
        "/api/auth/password-reset/request",
        json={"email": "unknown@example.com"},
    )
    assert configured_account.status_code == 503
    assert unknown_account.status_code == 503


def test_admin_crud_for_users_roles_permissions_and_services(client):
    login = client.post(
        "/api/auth/login",
        json={"email": "admin@example.com", "password": "Gestion!Segura2026"},
    )
    assert login.status_code == 200
    headers = {"Authorization": f"Bearer {login.json()['access_token']}"}

    role = client.post(
        "/api/admin/roles",
        headers=headers,
        json={"code": "support", "name": "Soporte", "description": "Rol de prueba"},
    )
    assert role.status_code == 201
    role_id = role.json()["id"]
    role_update = client.patch(
        f"/api/admin/roles/{role_id}",
        headers=headers,
        json={"name": "Soporte técnico"},
    )
    assert role_update.status_code == 200
    assert role_update.json()["name"] == "Soporte técnico"

    permission = client.post(
        "/api/admin/permissions",
        headers=headers,
        json={"code": "support.read", "name": "Consultar soporte", "module": "support"},
    )
    assert permission.status_code == 201
    permission_id = permission.json()["id"]
    permission_update = client.patch(
        f"/api/admin/permissions/{permission_id}",
        headers=headers,
        json={"description": "Permiso actualizado"},
    )
    assert permission_update.status_code == 200
    assert permission_update.json()["description"] == "Permiso actualizado"
    assigned = client.put(
        f"/api/admin/roles/{role_id}/permissions",
        headers=headers,
        json={"permission_ids": [permission_id]},
    )
    assert assigned.status_code == 200
    assert assigned.json()["permission_codes"] == ["support.read"]

    client_role = client.get("/api/admin/roles", headers=headers).json()
    client_role_id = next(item["id"] for item in client_role if item["code"] == "client")
    created_user = client.post(
        "/api/admin/users",
        headers=headers,
        json={
            "first_name": "Laura",
            "last_name": "Prueba",
            "document_type": "CC",
            "document_number": "9876543210",
            "address": "Carrera 10 # 20-30",
            "phone": "+573001234569",
            "email": "laura@example.com",
            "password": "Cuenta!Segura2026",
            "role_id": role_id,
        },
    )
    assert created_user.status_code == 201
    user_id = created_user.json()["id"]
    updated_user = client.patch(
        f"/api/admin/users/{user_id}",
        headers=headers,
        json={"role_id": client_role_id, "is_active": False},
    )
    assert updated_user.status_code == 200
    assert updated_user.json()["is_active"] is False
    assert updated_user.json()["role_code"] == "client"
    deleted_user = client.delete(f"/api/admin/users/{user_id}", headers=headers)
    assert deleted_user.status_code == 200

    service = client.post(
        "/api/admin/services",
        headers=headers,
        json={"slug": "prueba-api", "title": "Servicio de prueba", "description": "Servicio de prueba de administración"},
    )
    assert service.status_code == 201
    service_id = service.json()["id"]
    service_update = client.patch(
        f"/api/admin/services/{service_id}",
        headers=headers,
        json={"is_active": False},
    )
    assert service_update.status_code == 200
    assert service_update.json()["is_active"] is False
    assert client.delete(f"/api/admin/services/{service_id}", headers=headers).status_code == 200

    assert client.delete(f"/api/admin/permissions/{permission_id}", headers=headers).status_code == 200
    assert client.delete(f"/api/admin/roles/{role_id}", headers=headers).status_code == 200


def test_admin_panel_endpoints_reject_missing_authentication(client):
    for path in (
        "/api/admin/users",
        "/api/admin/clients",
        "/api/admin/roles",
        "/api/admin/permissions",
        "/api/admin/services",
    ):
        response = client.get(path)
        assert response.status_code == 401
