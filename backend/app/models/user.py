from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Boolean
from ..db import Base

class User(Base):
    __tablename__ = "user"
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(160), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(120))
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(32), default="editor")  # admin|editor|viewer
    active: Mapped[bool] = mapped_column(default=True)
