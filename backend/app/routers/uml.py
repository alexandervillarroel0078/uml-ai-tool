from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db import SessionLocal
from ..models.uml import Clase, Atributo
from ..schemas.uml import ClaseIn, ClaseOut

router = APIRouter(prefix="/uml", tags=["uml"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/classes", response_model=ClaseOut)
def create_class(data: ClaseIn, db: Session = Depends(get_db)):
    if db.query(Clase).filter(Clase.nombre == data.nombre).first():
        raise HTTPException(409, "Clase ya existe")
    c = Clase(nombre=data.nombre)
    db.add(c)
    db.flush()
    for a in data.atributos:
        db.add(Atributo(nombre=a.nombre, tipo=a.tipo, requerido=a.requerido, clase=c))
    db.commit(); db.refresh(c)
    return c

@router.get("/classes", response_model=list[ClaseOut])
def list_classes(db: Session = Depends(get_db)):
    return db.query(Clase).all()
