import argparse, os, json, glob

# ===== Configuración =====
PROJECT_DIR = "spring_project"
JAVA_BASE = os.path.join(PROJECT_DIR, "src", "main", "java", "com", "example", "app")

# ===== Helpers =====
def ensure_dir(path):
    os.makedirs(path, exist_ok=True)

def write_file(path, content):
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

# ===== Generadores =====
def generar_entity(clase, relations):
    fields = []

    for attr in clase["attributes"]:
        java_type = "String" if attr["type"] == "string" else "int"  # simplificado
        if attr["name"].lower() == "id":
            fields.append(f'    @Id\n    private {java_type} {attr["name"]};')
        else:
            fields.append(f'    private {java_type} {attr["name"]};')

    # Relaciones básicas (ASSOCIATION → ManyToOne/OneToMany)
    for rel in relations:
        if rel["to_class"] == clase["id"]:
            # Otro apunta a mí → OneToMany
            fields.append(
                f'    @OneToMany(mappedBy = "{rel["from_class"].lower()}")\n'
                f'    private List<{rel["from_class"]}> {rel["from_class"].lower()}s;'
            )
        if rel["from_class"] == clase["id"]:
            # Yo apunto a otro → ManyToOne
            fields.append(
                f'    @ManyToOne\n'
                f'    private {rel["to_class"]} {rel["to_class"].lower()};'
            )

    entity = f"""package com.example.app.models;

import jakarta.persistence.*;
import lombok.*;
import java.util.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class {clase["name"]} {{
{os.linesep.join(fields)}
}}
"""
    ensure_dir(JAVA_BASE + "/models")
    write_file(JAVA_BASE + f"/models/{clase['name']}.java", entity)


def generar_repository(clase):
    repo = f"""package com.example.app.repositories;

import com.example.app.models.{clase["name"]};
import org.springframework.data.jpa.repository.JpaRepository;

public interface {clase["name"]}Repository extends JpaRepository<{clase["name"]}, String> {{
}}
"""
    ensure_dir(JAVA_BASE + "/repositories")
    write_file(JAVA_BASE + f"/repositories/{clase['name']}Repository.java", repo)


def generar_service(clase):
    service = f"""package com.example.app.services;

import com.example.app.models.{clase["name"]};
import com.example.app.repositories.{clase["name"]}Repository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class {clase["name"]}Service {{
    private final {clase["name"]}Repository repo;

    public {clase["name"]}Service({clase["name"]}Repository repo) {{
        this.repo = repo;
    }}

    public List<{clase["name"]}> findAll() {{
        return repo.findAll();
    }}

    public {clase["name"]} save({clase["name"]} obj) {{
        return repo.save(obj);
    }}

    public void delete(String id) {{
        repo.deleteById(id);
    }}
}}
"""
    ensure_dir(JAVA_BASE + "/services")
    write_file(JAVA_BASE + f"/services/{clase['name']}Service.java", service)


def generar_controller(clase):
    varname = clase["name"].lower()
    controller = f"""package com.example.app.controllers;

import com.example.app.models.{clase["name"]};
import com.example.app.services.{clase["name"]}Service;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/{varname}s")
public class {clase["name"]}Controller {{
    private final {clase["name"]}Service service;

    public {clase["name"]}Controller({clase["name"]}Service service) {{
        this.service = service;
    }}

    @GetMapping
    public List<{clase["name"]}> all() {{
        return service.findAll();
    }}

    @PostMapping
    public {clase["name"]} create(@RequestBody {clase["name"]} obj) {{
        return service.save(obj);
    }}

    @DeleteMapping("/{{{varname}Id}}")
    public void delete(@PathVariable String {varname}Id) {{
        service.delete({varname}Id);
    }}
}}
"""
    ensure_dir(JAVA_BASE + "/controllers")
    write_file(JAVA_BASE + f"/controllers/{clase['name']}Controller.java", controller)


# ===== MAIN =====
if __name__ == "__main__":
    # Argumentos CLI
    parser = argparse.ArgumentParser()
    parser.add_argument("--id", help="UUID del diagrama a exportar", default=None)
    args = parser.parse_args()

    export_dir = "backend/exports"

    if args.id:
        file_path = os.path.join(export_dir, f"{args.id}.json")
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"❌ No existe export para el diagrama {args.id}")
    else:
        json_files = glob.glob(os.path.join(export_dir, "*.json"))
        if not json_files:
            raise FileNotFoundError("❌ No se encontró ningún JSON en backend/exports/")
        file_path = max(json_files, key=os.path.getctime)

    print("📄 Usando JSON:", file_path)

    with open(file_path, "r", encoding="utf-8") as f:
        uml = json.load(f)

    classes = {c["id"]: c for c in uml["classes"]}
    relations = uml.get("relations", [])

    for clase in uml["classes"]:
        generar_entity(clase, relations)
        generar_repository(clase)
        generar_service(clase)
        generar_controller(clase)

    print("🚀 Backend generado en", JAVA_BASE)
