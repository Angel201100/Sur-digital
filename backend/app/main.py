from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from app.config import settings
from app.database import Base, SessionLocal, engine
from app.models import Permission, Role, Service, User
from app.routers import admin, auth, public
from app.services.security import hash_password, validate_password


PERMISSIONS = [
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
    ("roles.update", "Actualizar roles y permisos", "roles"),
    ("roles.delete", "Eliminar roles", "roles"),
    ("permissions.read", "Consultar permisos", "permissions"),
    ("permissions.create", "Crear permisos", "permissions"),
    ("permissions.update", "Actualizar permisos", "permissions"),
    ("permissions.delete", "Eliminar permisos", "permissions"),
    ("services.read", "Consultar servicios", "services"),
    ("services.create", "Crear servicios", "services"),
    ("services.update", "Actualizar servicios", "services"),
    ("services.delete", "Desactivar servicios", "services"),
    ("profile.read", "Consultar perfil propio", "profile"),
    ("profile.update", "Actualizar perfil propio", "profile"),
]

SERVICES = [
    ("desarrollo-web", "Desarrollo web", "Sitios y aplicaciones rápidas, accesibles y adaptables a cualquier pantalla.", 1),
    ("aplicaciones-moviles", "Aplicaciones móviles", "Apps para Android e iOS pensadas para que tus clientes te lleven en el bolsillo.", 2),
    ("tiendas-en-linea", "Tiendas en línea", "Catálogo, carrito y pagos seguros para vender las 24 horas.", 3),
    ("diseno-interfaces", "Diseño de interfaces", "Pantallas claras y coherentes, probadas con personas reales antes de programarlas.", 4),
    ("analisis-datos", "Análisis de datos", "Tableros que convierten tus cifras en decisiones fáciles de entender.", 5),
    ("servicios-nube", "Servicios en la nube", "Infraestructura escalable que crece contigo y se mantiene disponible.", 6),
    ("ciberseguridad", "Ciberseguridad", "Revisamos y protegemos tus sistemas y los datos de tus clientes.", 7),
    ("automatizacion-procesos", "Automatización de procesos", "Eliminamos tareas repetitivas para que tu equipo se enfoque en lo importante.", 8),
    ("integracion-sistemas", "Integración de sistemas", "Conectamos tus herramientas para que la información fluya sin copiar y pegar.", 9),
    ("soporte-capacitacion", "Soporte y capacitación", "Acompañamos a tu equipo después de la entrega, con ayuda cuando la necesites.", 10),
]


def initialize_database() -> None:
    """Create local tables and reference data when the configured database is empty."""
    Base.metadata.create_all(engine)
    with SessionLocal() as db:
        role_definitions = [
            ("admin", "Administrador", "Administra usuarios, permisos y contenido."),
            ("employee", "Empleado", "Gestiona la atención y consulta de clientes."),
            ("client", "Cliente", "Consulta el catálogo y administra su perfil."),
        ]
        roles = {}
        for code, name, description in role_definitions:
            role = db.scalar(select(Role).where(Role.code == code))
            if role is None:
                role = Role(code=code, name=name, description=description)
                db.add(role)
                db.flush()
            roles[code] = role

        permissions = {}
        for code, name, module in PERMISSIONS:
            permission = db.scalar(select(Permission).where(Permission.code == code))
            if permission is None:
                permission = Permission(code=code, name=name, module=module)
                db.add(permission)
                db.flush()
            permissions[code] = permission

        roles["admin"].permissions = list(permissions.values())
        roles["employee"].permissions = [
            permissions["clients.read"],
            permissions["clients.update"],
            permissions["services.read"],
        ]
        roles["client"].permissions = [
            permissions["services.read"],
            permissions["profile.read"],
            permissions["profile.update"],
        ]

        for slug, title, description, sort_order in SERVICES:
            if db.scalar(select(Service).where(Service.slug == slug)) is None:
                db.add(Service(slug=slug, title=title, description=description, sort_order=sort_order))

        if settings.initial_admin_email and settings.initial_admin_password:
            email = settings.initial_admin_email.lower()
            password = settings.initial_admin_password.get_secret_value()
            validate_password(password, "Administrador", "Sur Digital")
            user = db.scalar(select(User).where(User.email == email))
            if user is None:
                user = db.scalar(select(User).where(User.document_number == "ADMIN-BOOTSTRAP-0001"))
            if user is None:
                user = User(
                    first_name="Administrador",
                    last_name="Sur Digital",
                    document_type="NIT",
                    document_number="ADMIN-BOOTSTRAP-0001",
                    address="Actualizar datos de contacto",
                    phone="+570000000000",
                    email=email,
                    accepted_data_policy=True,
                    role_id=roles["admin"].id,
                )
                db.add(user)
            else:
                user.email = email
            user.password_hash = hash_password(password)
            user.is_active = True
            user.role_id = roles["admin"].id

        db.commit()


@asynccontextmanager
async def lifespan(_: FastAPI):
    initialize_database()
    yield


app = FastAPI(
    title="Sur Digital API",
    description="API REST para autenticación, permisos, clientes y servicios de Sur Digital.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(public.router, prefix="/api")
app.include_router(admin.router, prefix="/api")


@app.get("/health", tags=["Sistema"])
def health() -> dict[str, str]:
    return {"status": "ok"}
