import os

# Estructura de carpetas y archivos
structure = {
    "exporters": {
        "templates": [
            "model.java.j2",
            "repository.java.j2",
            "service.java.j2",
            "controller.java.j2",
            "dto.java.j2",
            "pom.xml.j2",
            "application.properties.j2",
            "docker-compose.yml.j2",
        ],
        "generators": [
            "validator.py",
            "uml_to_json.py",
            "json_to_orm.py",
            "orm_to_crud.py",
            "project_builder.py",
        ],
        "output": {
            "generated_project_001": [
                "pom.xml"  # ejemplo de archivo inicial
            ]
        },
        "tests": [
            "test_validator.py",
            "test_generators.py",
        ],
        ".": [  # raíz de exporters
            "requirements.txt",
            "README.md",
        ],
    }
}


def create_structure(base_path, structure):
    for name, content in structure.items():
        path = os.path.join(base_path, name)
        if isinstance(content, dict):
            os.makedirs(path, exist_ok=True)
            create_structure(path, content)
        elif isinstance(content, list):
            os.makedirs(path, exist_ok=True)
            for file in content:
                file_path = os.path.join(path, file)
                if not os.path.exists(file_path):
                    with open(file_path, "w") as f:
                        if file.endswith(".py"):
                            f.write("# " + file + " (auto-generated)\n")
                        elif file.endswith(".j2"):
                            f.write("// Template: " + file + "\n")
                        elif file.endswith(".md"):
                            f.write("# " + file.replace(".md", "") + "\n")
                        else:
                            f.write("")  # archivo vacío por ahora
        else:
            raise ValueError("Estructura no válida")


if __name__ == "__main__":
    create_structure(".", structure)
    print("✅ Estructura de 'exporters/' creada exitosamente.")
