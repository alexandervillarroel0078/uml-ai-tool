import argparse
import csv
from pathlib import Path
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db import SessionLocal
from app.models.user import User
from app.models.uml import Clase, Atributo, Relacion, RelType
from app.services.users import hash_password

PG_TABLES = ['atributo', 'relacion', 'clase', '"user"']

def parse_bool(s: str | None) -> bool:
    if s is None:
        return False
    return str(s).strip().lower() in {"1", "true", "t", "yes", "y"}

def reset_data(session: Session):
    """
    Limpia datos manteniendo el esquema (recomendado si usas Alembic).
    En PostgreSQL: TRUNCATE ... RESTART IDENTITY CASCADE.
    Fallback: DELETE para SQLite u otros.
    """
    try:
        session.execute(text(f'TRUNCATE {", ".join(PG_TABLES)} RESTART IDENTITY CASCADE;'))
        session.commit()
        print("[OK] TRUNCATE + RESTART IDENTITY")
    except Exception as e:
        session.rollback()
        print("[WARN] TRUNCATE falló, usando DELETE…", e)
        for tbl in ['atributo', 'relacion', 'clase', 'user']:
            try:
                session.execute(text(f'DELETE FROM {tbl};'))
                session.commit()
            except Exception as e2:
                session.rollback()
                print(f"[ERR] DELETE {tbl}: {e2}")

def upsert_user(session: Session, row: dict):
    email = row["email"].strip()
    u = session.query(User).filter(User.email == email).first()
    if u:
        # actualizar campos básicos
        if row.get("name"):
            u.name = row["name"]
        if row.get("password"):
            u.password_hash = hash_password(row["password"])
        if row.get("role"):
            u.role = row["role"]
        if "active" in row:
            u.active = parse_bool(row["active"])
        print(f"[SKIP/UPD] user {email}")
        return u
    u = User(
        email=email,
        name=row.get("name", email.split("@")[0]),
        password_hash=hash_password(row.get("password", "changeme123")),
        role=row.get("role", "editor"),
        active=parse_bool(row.get("active", "true")),
    )
    session.add(u)
    session.flush()
    print(f"[NEW] user {email}")
    return u

def upsert_class(session: Session, nombre: str) -> Clase:
    nombre = nombre.strip()
    c = session.query(Clase).filter(Clase.nombre == nombre).first()
    if c:
        print(f"[SKIP] class {nombre}")
        return c
    c = Clase(nombre=nombre)
    session.add(c)
    session.flush()
    print(f"[NEW] class {nombre}")
    return c

def upsert_attribute(session: Session, clase_nombre: str, nombre: str, tipo: str, req: str):
    c = upsert_class(session, clase_nombre)
    a = session.query(Atributo).filter(
        Atributo.clase_id == c.id, Atributo.nombre == nombre.strip()
    ).first()
    if a:
        a.tipo = (tipo or "string").strip()
        a.requerido = parse_bool(req)
        print(f"[SKIP/UPD] attr {clase_nombre}.{nombre}")
        return a
    a = Atributo(
        nombre=nombre.strip(),
        tipo=(tipo or "string").strip(),
        requerido=parse_bool(req),
        clase=c,
    )
    session.add(a)
    session.flush()
    print(f"[NEW] attr {clase_nombre}.{nombre}")
    return a

def upsert_relation(session: Session, origen: str, destino: str, tipo: str):
    co = upsert_class(session, origen)
    cd = upsert_class(session, destino)
    rtype = RelType(tipo.strip())
    r = session.query(Relacion).filter(
        Relacion.origen_id == co.id,
        Relacion.destino_id == cd.id,
        Relacion.tipo == rtype
    ).first()
    if r:
        print(f"[SKIP] rel {origen} -> {destino} ({rtype})")
        return r
    r = Relacion(origen_id=co.id, destino_id=cd.id, tipo=rtype)
    session.add(r)
    session.flush()
    print(f"[NEW] rel {origen} -> {destino} ({rtype})")
    return r

def load_csvs(base_dir: Path, reset: bool):
    users_csv = base_dir / "users.csv"
    classes_csv = base_dir / "classes.csv"
    attributes_csv = base_dir / "attributes.csv"
    relations_csv = base_dir / "relations.csv"

    with SessionLocal() as session:
        if reset:
            reset_data(session)

        # USERS
        if users_csv.exists():
            with users_csv.open(newline="", encoding="utf-8") as f:
                for row in csv.DictReader(f):
                    upsert_user(session, row)
            session.commit()

        # CLASSES
        if classes_csv.exists():
            with classes_csv.open(newline="", encoding="utf-8") as f:
                for row in csv.DictReader(f):
                    if row.get("nombre"):
                        upsert_class(session, row["nombre"])
            session.commit()

        # ATTRIBUTES
        if attributes_csv.exists():
            with attributes_csv.open(newline="", encoding="utf-8") as f:
                for row in csv.DictReader(f):
                    upsert_attribute(session, row["clase"], row["nombre"], row.get("tipo","string"), row.get("requerido","false"))
            session.commit()

        # RELATIONS
        if relations_csv.exists():
            with relations_csv.open(newline="", encoding="utf-8") as f:
                for row in csv.DictReader(f):
                    upsert_relation(session, row["origen"], row["destino"], row["tipo"])
            session.commit()

    print("[DONE] CSV load complete.")

def main():
    parser = argparse.ArgumentParser(description="Carga datos desde CSV a la BD.")
    parser.add_argument("--dir", default="data", help="Directorio de los CSVs")
    parser.add_argument("--reset", action="store_true", help="TRUNCATE + RESTART IDENTITY antes de cargar")
    args = parser.parse_args()

    base_dir = Path(args.dir).resolve()
    if not base_dir.exists():
        raise SystemExit(f"No existe el directorio CSV: {base_dir}")

    load_csvs(base_dir, reset=args.reset)

if __name__ == "__main__":
    main()


# SELECT * FROM "user";
# SELECT * FROM clase;
# SELECT * FROM atributo;
# SELECT * FROM relacion;
# SELECT * FROM alembic_version;
