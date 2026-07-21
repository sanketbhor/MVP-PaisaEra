"""SQLAlchemy engine/session — this backend connects to Postgres directly
with a normal database role, not through Supabase's PostgREST/anon-key
layer. That means table-level RLS policies written for a Supabase-issued
auth.uid() don't apply to these connections either way; this backend is
solely responsible for its own authorization (checking a row's user_id
against the caller's JWT) before it ever touches the database. See
Backend/README.md for why that split exists.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from .config import settings

engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass


def get_db():
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()
