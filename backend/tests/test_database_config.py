from app.database import prepare_database_url


def test_neon_pooled_url_uses_psycopg_tls_and_disables_prepared_statements():
    url, options = prepare_database_url(
        "postgresql://project-user:example-password@ep-example-pooler.region.aws.neon.tech/"
        "neondb?channel_binding=require"
    )

    assert url.drivername == "postgresql+psycopg"
    assert url.query["sslmode"] == "require"
    assert url.query["channel_binding"] == "require"
    assert options["connect_args"] == {"prepare_threshold": None}


def test_neon_direct_url_keeps_tls_and_allows_existing_pooler_query():
    url, _ = prepare_database_url(
        "postgres://project-user:example-password@ep-example.region.aws.neon.tech/"
        "neondb?sslmode=verify-full"
    )

    assert url.drivername == "postgresql+psycopg"
    assert url.query["sslmode"] == "verify-full"


def test_postgres_url_cannot_disable_tls():
    url, _ = prepare_database_url(
        "postgresql+psycopg://user:password@db.example.test/app?sslmode=disable"
    )

    assert url.query["sslmode"] == "require"
