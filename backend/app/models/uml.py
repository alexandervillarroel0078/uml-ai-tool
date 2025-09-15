from sqlalchemy import String, Boolean, ForeignKey, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..db import Base
import enum

class RelType(str, enum.Enum):
    ONE_TO_ONE = "ONE_TO_ONE"
    ONE_TO_MANY = "ONE_TO_MANY"
    MANY_TO_MANY = "MANY_TO_MANY"

class Clase(Base):
    __tablename__ = "clase"
    id: Mapped[int] = mapped_column(primary_key=True)
    nombre: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    atributos: Mapped[list["Atributo"]] = relationship(
        back_populates="clase", cascade="all, delete-orphan"
    )

class Atributo(Base):
    __tablename__ = "atributo"
    id: Mapped[int] = mapped_column(primary_key=True)
    nombre: Mapped[str] = mapped_column(String(120))
    tipo: Mapped[str] = mapped_column(String(60), default="string")
    requerido: Mapped[bool] = mapped_column(Boolean, default=False)
    clase_id: Mapped[int] = mapped_column(ForeignKey("clase.id"))
    clase: Mapped[Clase] = relationship(back_populates="atributos")

class Relacion(Base):
    __tablename__ = "relacion"
    id: Mapped[int] = mapped_column(primary_key=True)
    origen_id: Mapped[int] = mapped_column(ForeignKey("clase.id"))
    destino_id: Mapped[int] = mapped_column(ForeignKey("clase.id"))
    tipo: Mapped[RelType] = mapped_column(Enum(RelType))
