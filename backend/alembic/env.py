# backend/alembic/env.py

from __future__ import annotations
import os, sys

# --- Agregar 'backend/' al sys.path para importar 'app.*' ---
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)
# -----------------------------------------------------------

from alembic import context
from sqlalchemy import engine_from_config, pool

# Traemos settings y metadata
from app.core.config import settings
from app.db import Base

# IMPORTANTE: importa módulos de modelos para que sus tablas queden en Base.metadata
from app.models import user, uml  # noqa: F401

# Obtener config de Alembic y setear la URL desde settings
config = context.config
if settings.DB_URL:
    config.set_main_option("sqlalchemy.url", settings.DB_URL)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Modo offline: genera SQL sin conexión real."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        compare_type=True,
        compare_server_default=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Modo online: aplica migraciones con conexión."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            compare_server_default=True,
            # version_table_schema="public",  # si usas otro esquema, descomenta y ajusta
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
