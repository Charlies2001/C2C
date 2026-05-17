import os
import sys
from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

# Make `app` importable when running alembic from /backend
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.config import settings  # noqa: E402
from app.database import Base  # noqa: E402
from app.models.api_key import UserAPIKey  # noqa: F401, E402
from app.models.note import ProblemNote  # noqa: F401, E402
from app.models.notebook import Notebook, NotebookItem  # noqa: F401, E402
from app.models.problem import Problem  # noqa: F401, E402
from app.models.user import User  # noqa: F401, E402

config = context.config

# Override sqlalchemy.url from environment (DATABASE_URL takes precedence over alembic.ini)
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

# NOTE: we intentionally do NOT call fileConfig() here even though the
# alembic.ini has [loggers]/[handlers]/[formatters] sections. fileConfig
# (with the default disable_existing_loggers=True) destroys the
# RotatingFileHandler we attached to the root logger in setup_logging(),
# which silently breaks JSON request logs on every server restart.
# Alembic's own log records propagate up to root and pick up our JSON
# formatter just fine without this.
_ = fileConfig  # keep the import to make the silenced step obvious to readers

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            # Render type changes for SQLite vs PostgreSQL diff
            render_as_batch=connection.dialect.name == "sqlite",
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
