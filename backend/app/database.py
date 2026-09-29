from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool
from app.config import get_settings

settings = get_settings()

db_url = settings.DATABASE_URL
# Some hosting dashboards export pasted key/value pairs as one string. Accept
# that form while keeping the canonical Render value as the URI alone.
if db_url.startswith("DATABASE_URL="):
    db_url = db_url.split("=", 1)[1].strip().strip('"').strip("'")
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

engine_options = {"pool_pre_ping": True}
if db_url.startswith("sqlite"):
    engine_options["connect_args"] = {"check_same_thread": False}
elif "pooler.supabase.com" in db_url:
    # Supabase transaction pooler (port 6543) manages server-side connections.
    # Disable SQLAlchemy's client pool to avoid stale/reused transaction sessions.
    engine_options["poolclass"] = NullPool
    engine_options["connect_args"] = {"sslmode": "require"}
else:
    engine_options["pool_recycle"] = 300
    engine_options["pool_size"] = 10
    engine_options["max_overflow"] = 20

engine = create_engine(db_url, **engine_options)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dependency that provides a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
