# Sur Digital — segundo entregable

Aplicación académica de servicios digitales con frontend React + Vite + Tailwind CSS y API REST FastAPI con PostgreSQL, JWT, control de roles/permisos y almacenamiento seguro de contraseñas mediante Argon2.

## Estructura

```text
proyecto/
├── frontend/
│   ├── public/                 Favicon
│   └── src/
│       ├── assets/images/      Las 10 imágenes originales del carrusel
│       ├── components/         Header, Footer, Carousel, modal, formularios y panel
│       ├── data/               Diapositivas del carrusel
│       ├── hooks/              Contexto y estado de autenticación
│       ├── pages/              Sitio público, login y páginas del panel
│       ├── services/           Cliente HTTP y servicios de API
│       └── utils/              Validaciones de formularios
├── backend/
│   ├── app/
│   │   ├── models/             Modelos SQLAlchemy
│   │   ├── routers/            Endpoints de auth, servicios y administración
│   │   ├── services/           Hash Argon2, JWT, correo y serialización
│   │   ├── config.py           Configuración de entorno
│   │   ├── database.py         Sesiones SQLAlchemy
│   │   └── seed_admin.py       Creación segura del administrador inicial
│   ├── database/MER.md         Diagrama entidad-relación
│   ├── database/schema.sql     Tablas y datos de roles/permisos/servicios
│   ├── tests/                  Pruebas API
│   └── requirements.txt
├── GUIDE_EVIDENCES.md
└── .gitignore
```

## Requisitos

- Node.js 20.19 o posterior (o 22.12 o posterior) y npm.
- Python 3.11 o posterior.
- Un proyecto Neon con una base de datos PostgreSQL.
- Una cuenta SMTP para entregar los correos de recuperación (opcional hasta activar ese flujo).

## Configuración e inicio en Windows

### 1. Preparar Neon

1. Crea o abre el proyecto en [Neon Console](https://console.neon.tech/).
2. Usa **Connect** y copia la cadena de conexión **pooled** para la aplicación.
3. En **SQL Editor**, abre `backend/database/schema.sql`, ejecútalo contra la base del proyecto y confirma que se crearon tablas y datos iniciales. También puedes usar `psql`:

```powershell
psql $env:DATABASE_URL -f backend\database\schema.sql
```

Neon administra el servidor y la base de datos; no ejecutes `createdb` ni instales PostgreSQL localmente para este proyecto. El script crea las tablas, los tres roles, permisos iniciales, diez servicios y una fila administrativa sin contraseña utilizable. Consulta el [MER](backend/database/MER.md).

### 2. Configurar e iniciar el backend

```powershell
Copy-Item backend\.env.example backend\.env
py -3 -m venv backend\.venv
backend\.venv\Scripts\Activate.ps1
python -m pip install -r backend\requirements.txt
```

Edita `backend\.env` (no se versiona):

- `DATABASE_URL`: cadena copiada de **Neon Console → Connect**. Para el API usa la cadena pooled (host con `-pooler`), conserva `sslmode=require` y no publiques ni subas la cadena. El backend adapta `postgresql://` al driver Psycopg 3 y exige TLS.
- `JWT_SECRET`: clave aleatoria de al menos 32 caracteres.
- `INITIAL_ADMIN_EMAIL` y `INITIAL_ADMIN_PASSWORD`: correo y contraseña segura del administrador inicial (mínimo 10 caracteres, mayúscula, minúscula, número y carácter especial).
- `CORS_ORIGINS`: origen local del frontend.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_FROM_EMAIL`: servidor para recuperación de contraseña. El transporte requiere STARTTLS.
- `FRONTEND_BASE_URL`: origen donde se abrirá el enlace enviado por correo.

Configura el usuario administrativo y arranca FastAPI:

```powershell
python -m app.seed_admin
python -m uvicorn app.main:app --reload
```

Se entrega en `http://127.0.0.1:8000`; Swagger UI: `http://127.0.0.1:8000/docs`; salud: `http://127.0.0.1:8000/health`.

### 3. Configurar e iniciar el frontend

En otra consola:

```powershell
Copy-Item frontend\.env.example frontend\.env
Set-Location frontend
npm install
npm run dev
```

Abre la dirección de Vite (normalmente `http://localhost:5173`). Para una compilación de producción ejecuta `npm run build`.

### Pruebas del backend

```powershell
Set-Location backend
.\.venv\Scripts\Activate.ps1
python -m pytest -q
```

Las pruebas usan SQLite temporal y no escriben datos en Neon. En ejecución, `DATABASE_URL` es obligatoria: la aplicación no cambia silenciosamente a SQLite. El script SQL se ejecuta en Neon SQL Editor o contra la cadena de conexión Neon.

## Usuarios de prueba y acceso

- **Administrador:** usa `INITIAL_ADMIN_EMAIL` y `INITIAL_ADMIN_PASSWORD` que configuraste, luego ejecuta `python -m app.seed_admin`. No existe una contraseña administrativa predefinida en el código.
- **Cliente:** abre `/login`, selecciona **Crear una cuenta**, completa el formulario y luego inicia sesión con ese correo/contraseña.
- **Empleado:** crea o cambia un usuario desde `/admin/users` como administrador y asigna el rol Empleado.
- El backend devuelve el rol y la lista de permisos en el token de sesión. El frontend adapta el menú, y la API valida los mismos permisos en cada operación.

## Rutas principales

| Ruta | Uso |
|---|---|
| `/` | Inicio y carrusel de servicios |
| `/nosotros` | Información de Sur Digital |
| `/contacto` | Contacto y mapa |
| `/login` | Inicio de sesión y modal de registro |
| `/recuperar-contrasena` | Solicitar correo de recuperación |
| `/recuperar-contrasena?token=...` | Asignar nueva contraseña desde un enlace de correo |
| `/admin` | Panel según el rol y permisos |
| `/admin/users` | Usuarios |
| `/admin/clients` | Clientes |
| `/admin/roles` | Roles y asignación de permisos |
| `/admin/permissions` | Permisos |
| `/admin/services` | Servicios del carrusel |

## API

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `POST /api/auth/password-reset/request`, `POST /api/auth/password-reset/confirm`
- `GET /api/services`
- `/api/admin/users`, `/api/admin/clients`, `/api/admin/roles`, `/api/admin/permissions`, `/api/admin/services`
- Los módulos administrativos implementan `GET`, `POST`, `PATCH` y `DELETE`; las bajas de usuarios, clientes y servicios son lógicas.
- `PUT /api/admin/roles/{role_id}/permissions` reemplaza la asignación del rol.
- Todas las rutas administrativas requieren JWT y el permiso específico asociado.

## Identidad visual

La paleta se define en `frontend/tailwind.config.js`: azul tinta `#1b2a41`, turquesa `#2ec4b6` / `#0e7c72`, ámbar `#f2b134`, fondo `#f3f5f7` y blanco. Tipografía Sora; isotipo SVG en `frontend/src/components/BrandMark.jsx`. Navbar fijo, interfaz responsive, carrusel con teclado/flechas/indicadores, botón de WhatsApp y Footer con mapa, redes y contacto.

## Valores de ejemplo editables

El teléfono `+57 311 700 6818`, ubicación de Bogotá, enlaces de Instagram/LinkedIn, textos de la política de datos, la URL de prueba del administrador y los servicios son datos de demostración. Sustitúyelos por información oficial antes de publicar. La política de datos es una plantilla académica, no asesoría legal.

## Alcance e integración

El proyecto conserva las diez imágenes, sus títulos y textos del primer entregable. El catálogo del carrusel intenta cargar los registros activos de la API; si no está disponible, la página informa del problema y muestra las diapositivas locales. Las imágenes se asignan por el campo `sort_order`.

La API implementa envío de recuperación por SMTP con enlace de un solo uso, caducidad de 30 minutos y hash almacenado. Configura SMTP antes de probar ese flujo. Para producción, añade migraciones versionadas, limitación de intentos, política de privacidad revisada, renovación/revocación de JWT y proveedor de correo operativo.

El navegador gestiona sesiones mediante JWT almacenado en `sessionStorage` (o `localStorage` cuando se marca «Recordarme»); en un despliegue público se recomienda migrar a cookies `HttpOnly`, `Secure`, `SameSite` y aplicar TLS.
