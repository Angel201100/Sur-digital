-- Sur Digital on Neon PostgreSQL. Run in Neon SQL Editor or:
-- psql "$DATABASE_URL" -f backend/database/schema.sql
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(40) NOT NULL UNIQUE,
    name VARCHAR(80) NOT NULL,
    description VARCHAR(250),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(80) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    module VARCHAR(60) NOT NULL,
    description VARCHAR(250)
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(80) NOT NULL,
    last_name VARCHAR(80) NOT NULL,
    document_type VARCHAR(20) NOT NULL CHECK (document_type IN ('CC', 'CE', 'NIT', 'PASSPORT', 'TI')),
    document_number VARCHAR(30) NOT NULL UNIQUE,
    address VARCHAR(200) NOT NULL,
    phone VARCHAR(20) NOT NULL CHECK (phone ~ '^\+?[0-9]{7,15}$'),
    email VARCHAR(254) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    accepted_data_policy BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(120) NOT NULL,
    description TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash CHAR(64) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS ix_password_reset_tokens_user_id ON password_reset_tokens(user_id);

INSERT INTO roles (code, name, description) VALUES
    ('admin', 'Administrador', 'Administra usuarios, permisos y contenido.'),
    ('employee', 'Empleado', 'Gestiona la atención y consulta de clientes.'),
    ('client', 'Cliente', 'Consulta el catálogo y administra su perfil.')
ON CONFLICT (code) DO NOTHING;

INSERT INTO permissions (code, name, module) VALUES
    ('users.read', 'Consultar usuarios', 'users'),
    ('users.create', 'Crear usuarios', 'users'),
    ('users.update', 'Actualizar usuarios', 'users'),
    ('users.delete', 'Desactivar usuarios', 'users'),
    ('clients.read', 'Consultar clientes', 'clients'),
    ('clients.create', 'Crear clientes', 'clients'),
    ('clients.update', 'Actualizar clientes', 'clients'),
    ('clients.delete', 'Desactivar clientes', 'clients'),
    ('roles.read', 'Consultar roles', 'roles'),
    ('roles.create', 'Crear roles', 'roles'),
    ('roles.update', 'Actualizar roles y permisos', 'roles'),
    ('roles.delete', 'Eliminar roles', 'roles'),
    ('permissions.read', 'Consultar permisos', 'permissions'),
    ('permissions.create', 'Crear permisos', 'permissions'),
    ('permissions.update', 'Actualizar permisos', 'permissions'),
    ('permissions.delete', 'Eliminar permisos', 'permissions'),
    ('services.read', 'Consultar servicios', 'services'),
    ('services.create', 'Crear servicios', 'services'),
    ('services.update', 'Actualizar servicios', 'services'),
    ('services.delete', 'Desactivar servicios', 'services'),
    ('profile.read', 'Consultar perfil propio', 'profile'),
    ('profile.update', 'Actualizar perfil propio', 'profile')
ON CONFLICT (code) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r CROSS JOIN permissions p
WHERE r.code = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN ('clients.read', 'clients.update', 'services.read')
WHERE r.code = 'employee'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN ('services.read', 'profile.read', 'profile.update')
WHERE r.code = 'client'
ON CONFLICT DO NOTHING;

INSERT INTO users (
    first_name, last_name, document_type, document_number, address,
    phone, email, password_hash, accepted_data_policy, role_id
)
SELECT
    'Administrador', 'Inicial', 'NIT', 'ADMIN-SEED-0001',
    'Actualizar antes de usar', '+570000000000', 'admin@surdigital.local',
    NULL, TRUE, roles.id
FROM roles
WHERE roles.code = 'admin'
ON CONFLICT (email) DO NOTHING;

INSERT INTO services (slug, title, description, sort_order) VALUES
    ('desarrollo-web', 'Desarrollo web', 'Sitios y aplicaciones rápidas, accesibles y adaptables a cualquier pantalla.', 1),
    ('aplicaciones-moviles', 'Aplicaciones móviles', 'Apps para Android e iOS pensadas para que tus clientes te lleven en el bolsillo.', 2),
    ('tiendas-en-linea', 'Tiendas en línea', 'Catálogo, carrito y pagos seguros para vender las 24 horas.', 3),
    ('diseno-interfaces', 'Diseño de interfaces', 'Pantallas claras y coherentes, probadas con personas reales antes de programarlas.', 4),
    ('analisis-datos', 'Análisis de datos', 'Tableros que convierten tus cifras en decisiones fáciles de entender.', 5),
    ('servicios-nube', 'Servicios en la nube', 'Infraestructura escalable que crece contigo y se mantiene disponible.', 6),
    ('ciberseguridad', 'Ciberseguridad', 'Revisamos y protegemos tus sistemas y los datos de tus clientes.', 7),
    ('automatizacion-procesos', 'Automatización de procesos', 'Eliminamos tareas repetitivas para que tu equipo se enfoque en lo importante.', 8),
    ('integracion-sistemas', 'Integración de sistemas', 'Conectamos tus herramientas para que la información fluya sin copiar y pegar.', 9),
    ('soporte-capacitacion', 'Soporte y capacitación', 'Acompañamos a tu equipo después de la entrega, con ayuda cuando la necesites.', 10)
ON CONFLICT (slug) DO NOTHING;
