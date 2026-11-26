from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.engine import URL, make_url
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import settings


def prepare_database_url(database_url: str) -> tuple[URL, dict[str, object]]:
    url = make_url(database_url)
    if url.drivername in {"postgres", "postgresql"}:
        url = url.set(drivername="postgresql+psycopg")

    connect_args: dict[str, object] = {}
    engine_options: dict[str, object] = {
        "pool_pre_ping": True,
    }

    if url.drivername.startswith("sqlite"):
        connect_args["check_same_thread"] = False
    elif url.drivername.startswith("postgresql"):
        query = dict(url.query)
        sslmode = query.get("sslmode", "require")
        if sslmode not in {"require", "verify-ca", "verify-full"}:
            sslmode = "require"
        query["sslmode"] = sslmode
        query.setdefault("connect_timeout", "10")
        url = url.set(query=query)

        engine_options.update(
            pool_recycle=300,
            pool_size=5,
            max_overflow=5,
            pool_timeout=30,
        )
        if url.host and "-pooler." in url.host.lower():
            connect_args["prepare_threshold"] = None

    return url, {"connect_args": connect_args, **engine_options}


database_url, database_options = prepare_database_url(settings.database_url)
engine = create_engine(database_url, **database_options)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


def get_db() -> Generator[Session, None, None]:
    with SessionLocal() as session:
        yield session
