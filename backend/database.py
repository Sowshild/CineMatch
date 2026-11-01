# import os
# from sqlalchemy import create_engine
# from sqlalchemy.orm import declarative_base, sessionmaker

# # Database file location in the backend folder
# BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'cinematch.db')}"

# # SQLite requires check_same_thread=False for multi-threaded FastAPI workers
# engine = create_engine(
#     DATABASE_URL,
#     connect_args={"check_same_thread": False}
# )

# SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
# Base = declarative_base()


# def get_db():
#     """Dependency that yields an active database session and closes it cleanly."""
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()


# import os
# from pathlib import Path

# from sqlalchemy import create_engine
# from sqlalchemy.engine import URL
# from sqlalchemy.orm import declarative_base, sessionmaker

# # Local development: database inside backend folder
# BASE_DIR = Path(__file__).resolve().parent

# # Production: use the Render persistent disk
# DB_PATH = Path(
#     os.getenv(
#         "CINEMATCH_DB_PATH",
#         str(BASE_DIR / "cinematch.db")
#     )
# )

# # Ensure the database directory exists
# DB_PATH.parent.mkdir(parents=True, exist_ok=True)

# DATABASE_URL = URL.create(
#     "sqlite",
#     database=str(DB_PATH)
# )

# engine = create_engine(
#     DATABASE_URL,
#     connect_args={"check_same_thread": False}
# )

# SessionLocal = sessionmaker(
#     autocommit=False,
#     autoflush=False,
#     bind=engine
# )

# Base = declarative_base()


# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()


import os
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Use Neon when DATABASE_URL is configured.
# Otherwise, use SQLite for local development.
DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL:
    # Use the psycopg 3 driver with SQLAlchemy.
    if DATABASE_URL.startswith("postgresql://"):
        DATABASE_URL = DATABASE_URL.replace(
            "postgresql://",
            "postgresql+psycopg://",
            1
        )

    connect_args = {}

else:
    BASE_DIR = Path(__file__).resolve().parent
    DATABASE_URL = f"sqlite:///{BASE_DIR / 'cinematch.db'}"
    connect_args = {"check_same_thread": False}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
