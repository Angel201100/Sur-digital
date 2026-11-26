# Modelo entidad-relación

El motor objetivo es PostgreSQL administrado en Neon. La API se conecta al endpoint pooled por TLS; el diagrama y las tablas corresponden al schema `public` de la base Neon.

```mermaid
erDiagram
    ROLES ||--o{ USERS : asigna
    ROLES ||--o{ ROLE_PERMISSIONS : autoriza
    PERMISSIONS ||--o{ ROLE_PERMISSIONS : incluye
    USERS ||--o{ PASSWORD_RESET_TOKENS : solicita
    SERVICES {
        uuid id PK
        string slug UK
        string title
        text description
        boolean is_active
        int sort_order
    }
    ROLES {
        uuid id PK
        string code UK
        string name
        boolean is_active
    }
    PERMISSIONS {
        uuid id PK
        string code UK
        string name
        string module
    }
    ROLE_PERMISSIONS {
        uuid role_id PK, FK
        uuid permission_id PK, FK
    }
    USERS {
        uuid id PK
        string email UK
        string document_number UK
        uuid role_id FK
        string password_hash
        boolean accepted_data_policy
        boolean is_active
    }
    PASSWORD_RESET_TOKENS {
        uuid id PK
        uuid user_id FK
        string token_hash UK
        datetime expires_at
        datetime used_at
    }
```

Un usuario tiene un rol; un rol reúne permisos mediante la relación muchos-a-muchos `role_permissions`. Los tokens de recuperación se guardan como hashes y vencen. Los servicios son un catálogo independiente. La cuenta administrativa inicial se crea sin contraseña utilizable y se habilita con `python -m app.seed_admin`, que lee las credenciales locales desde `backend/.env`.
