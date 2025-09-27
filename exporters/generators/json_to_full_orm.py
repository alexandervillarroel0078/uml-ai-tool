# # json_to_full_orm.py
# """
# Convierte un diagrama UML (JSON) a entidades Java con JPA.
# 👉 Combina atributos (de json_to_orm) + relaciones (de json_to_relations).
# """

# import os, json
# from json_to_relations import build_relations

# # 📂 Carpeta donde se guardarán las clases generadas
# OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "generated", "models")
# os.makedirs(OUTPUT_DIR, exist_ok=True)


# # ========================
# # Función de mapeo de tipos
# # ========================
# def map_type(attr_type: str) -> str:
#     mapping = {
#         "int": "Integer",
#         "long": "Long",
#         "string": "String",
#         "float": "Float",
#         "double": "Double",
#         "boolean": "Boolean",
#         "date": "LocalDate",
#         "datetime": "LocalDateTime"
#     }
#     return mapping.get(attr_type.lower(), "String")


# # ========================
# # Generador de entidad con relaciones
# # ========================
# def generate_entity(class_def: dict, relations_map: dict):
#     class_name = class_def["name"]
#     attributes = class_def.get("attributes", [])

#     # 🔹 Si no existe atributo "id", lo agregamos automáticamente
#     has_id = any(attr["name"].lower() == "id" for attr in attributes)
#     if not has_id:
#         attributes.insert(0, {"name": "id", "type": "long", "required": True})

#     lines = []
#     lines.append("import jakarta.persistence.*;")
#     lines.append("import java.time.*;")
#     lines.append("import java.util.*;")
#     lines.append("")
#     lines.append("@Entity")
#     lines.append(f"public class {class_name} " + "{")
#     lines.append("")

#     # ========================
#     # Atributos normales
#     # ========================
#     for attr in attributes:
#         attr_name = attr["name"]
#         attr_type = map_type(attr["type"])

#         if attr_name.lower() == "id":
#             lines.append("    @Id")
#             lines.append("    @GeneratedValue(strategy = GenerationType.IDENTITY)")
#         lines.append(f"    private {attr_type} {attr_name};")
#         lines.append("")

#     # ========================
#     # Relaciones JPA
#     # ========================
#     if class_name in relations_map:
#         for target, rel in relations_map[class_name].items():
#             rel_type = rel["type"]

#             # --- Recursivas ---
#             if rel_type == "RecursiveAssociation":
#                 if "annotation_one" in rel and "annotation_two" in rel:
#                     # Ejemplo: OneToMany + ManyToOne
#                     lines.append(f"    {rel['annotation_one']}")
#                     lines.append(f"    private List<{class_name}> children;")
#                     lines.append("")
#                     lines.append(f"    {rel['annotation_two']}")
#                     lines.append(f"    @JoinColumn(name = \"{rel['joinColumn']}\")")
#                     lines.append(f"    private {class_name} parent;")
#                 elif "annotation" in rel and rel["annotation"] == "@ManyToMany":
#                     # Muchos ↔ Muchos recursivo
#                     lines.append(f"    {rel['annotation']}")
#                     lines.append(f"    @JoinTable(name = \"{rel['joinTable']}\")")
#                     lines.append(f"    private List<{class_name}> related;")
#                 else:
#                     # Caso raro: OneToOne recursivo
#                     lines.append(f"    {rel['annotation']}")
#                     lines.append(f"    @JoinColumn(name = \"{rel['joinColumn']}\")")
#                     lines.append(f"    private {class_name} reference;")

#             # --- Relaciones normales ---
#             else:
#                 annotation = rel["annotation"]
#                 join_col = rel.get("joinColumn")

#                 if "OneToMany" in annotation:
#                     role_name = rel.get("label") or target.lower() + "s"
#                     lines.append(f"    {annotation}")
#                     if "joinTable" in rel:
#                      lines.append(f"    @JoinTable(name = \"{rel['joinTable']}\")")
#                     lines.append(f"    private List<{target}> {role_name};")                    
#                     # lines.append(f"    {annotation}(mappedBy = \"{class_name.lower()}\")")
#                     # lines.append(f"    private List<{target}> {target.lower()}s;")
#                 elif "ManyToOne" in annotation:
#                     lines.append(f"    {annotation}")
#                     lines.append(f"    @JoinColumn(name = \"{join_col}\")")
#                     lines.append(f"    private {target} {target.lower()};")
#                 elif "ManyToMany" in annotation:
#                     lines.append(f"    {annotation}")
#                     lines.append(f"    private List<{target}> {target.lower()}s;")
#                 elif "OneToOne" in annotation:
#                     lines.append(f"    {annotation}")
#                     lines.append(f"    @JoinColumn(name = \"{join_col}\")")
#                     lines.append(f"    private {target} {target.lower()};")
#                 elif "Inheritance" in annotation:
#                     lines.append(f"    {annotation}")  # Se aplica a la clase padre

#             lines.append("")

#     # ========================
#     # Getters y Setters
#     # ========================
#     for attr in attributes:
#         attr_name = attr["name"]
#         attr_type = map_type(attr["type"])
#         method_name = attr_name[0].upper() + attr_name[1:]

#         # Getter
#         lines.append(f"    public {attr_type} get{method_name}() " + "{")
#         lines.append(f"        return {attr_name};")
#         lines.append("    }")
#         lines.append("")

#         # Setter
#         lines.append(f"    public void set{method_name}({attr_type} {attr_name}) " + "{")
#         lines.append(f"        this.{attr_name} = {attr_name};")
#         lines.append("    }")
#         lines.append("")

#     lines.append("}")
#     return "\n".join(lines)



# # ========================
# # Función principal
# # ========================
# def generate_from_json(json_path: str):
#     with open(json_path, "r", encoding="utf-8") as f:
#         data = json.load(f)

#     diagram = data["diagram"]
#     relations_map = build_relations(json_path)

#     for c in diagram["classes"]:
#         code = generate_entity(c, relations_map)
#         file_path = os.path.join(OUTPUT_DIR, f"{c['name']}.java")
#         with open(file_path, "w", encoding="utf-8") as f:
#             f.write(code)
#         print(f"✅ Generada entidad con relaciones: {file_path}")


# # ========================
# # Ejecución directa
# # ========================
# if __name__ == "__main__":
#     generate_from_json("../json/diagram_367493a5-e490-4665-a73f-8626674b2ee2.json")
# json_to_full_orm.py
"""
Convierte un diagrama UML (JSON) a entidades Java con JPA.
👉 Combina atributos (de json_to_orm) + relaciones (de json_to_relations).
"""

import os, json
from json_to_relations import build_relations

# 📂 Carpeta donde se guardarán las clases generadas
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "generated", "models")
os.makedirs(OUTPUT_DIR, exist_ok=True)


# ========================
# Función de mapeo de tipos
# ========================
def map_type(attr_type: str) -> str:
    mapping = {
        "int": "Integer",
        "long": "Long",
        "string": "String",
        "float": "Float",
        "double": "Double",
        "boolean": "Boolean",
        "date": "LocalDate",
        "datetime": "LocalDateTime"
    }
    return mapping.get(attr_type.lower(), "String")


# ========================
# Generador de entidad con relaciones
# ========================
def generate_entity(class_def: dict, relations_map: dict):
    class_name = class_def["name"]
    attributes = class_def.get("attributes", [])

    # 🔹 Si no existe atributo "id", lo agregamos automáticamente
    has_id = any(attr["name"].lower() == "id" for attr in attributes)
    if not has_id:
        attributes.insert(0, {"name": "id", "type": "long", "required": True})

    lines = []
    lines.append("import jakarta.persistence.*;")
    lines.append("import java.time.*;")
    lines.append("import java.util.*;")
    lines.append("")
    lines.append("@Entity")
    lines.append(f"public class {class_name} " + "{")
    lines.append("")

    # ========================
    # Atributos normales
    # ========================
    for attr in attributes:
        attr_name = attr["name"]
        attr_type = map_type(attr["type"])

        if attr_name.lower() == "id":
            lines.append("    @Id")
            lines.append("    @GeneratedValue(strategy = GenerationType.IDENTITY)")
        lines.append(f"    private {attr_type} {attr_name};")
        lines.append("")

    # ========================
    # Relaciones JPA
    # ========================
    if class_name in relations_map:
        for target, rel in relations_map[class_name].items():
            rel_type = rel["type"]

            # --- Recursivas ---
            if rel_type == "RecursiveAssociation":
                if "annotation_one" in rel and "annotation_two" in rel:
                    # Ejemplo: OneToMany + ManyToOne
                    lines.append(f"    {rel['annotation_one']}")
                    lines.append(f"    private List<{class_name}> children;")
                    lines.append("")
                    lines.append(f"    {rel['annotation_two']}")
                    lines.append(f"    @JoinColumn(name = \"{rel['joinColumn']}\")")
                    lines.append(f"    private {class_name} parent;")
                elif "annotation" in rel and rel["annotation"] == "@ManyToMany":
                    # Muchos ↔ Muchos recursivo
                    role_name = rel.get("label") or "related"
                    lines.append(f"    {rel['annotation']}")
                    lines.append(f"    @JoinTable(name = \"{rel['joinTable']}\")")
                    lines.append(f"    private List<{class_name}> {role_name};")
                else:
                    # Caso raro: OneToOne recursivo
                    role_name = rel.get("label") or "reference"
                    lines.append(f"    {rel['annotation']}")
                    lines.append(f"    @JoinColumn(name = \"{rel['joinColumn']}\")")
                    lines.append(f"    private {class_name} {role_name};")

            # --- Relaciones normales ---
            else:
                annotation = rel["annotation"]
                join_col = rel.get("joinColumn")

                if "OneToMany" in annotation:
                    role_name = rel.get("label") or target.lower() + "s"
                    lines.append(f"    {annotation}(mappedBy = \"{class_name.lower()}\")")
                    lines.append(f"    private List<{target}> {role_name};")

                elif "ManyToOne" in annotation:
                    role_name = rel.get("label") or target.lower()
                    lines.append(f"    {annotation}")
                    lines.append(f"    @JoinColumn(name = \"{join_col}\")")
                    lines.append(f"    private {target} {role_name};")

                elif "ManyToMany" in annotation:
                    role_name = rel.get("label") or target.lower() + "s"
                    lines.append(f"    {annotation}")
                    if "joinTable" in rel:
                        lines.append(f"    @JoinTable(name = \"{rel['joinTable']}\")")
                    lines.append(f"    private List<{target}> {role_name};")

                elif "OneToOne" in annotation:
                    role_name = rel.get("label") or target.lower()
                    lines.append(f"    {annotation}")
                    lines.append(f"    @JoinColumn(name = \"{join_col}\")")
                    lines.append(f"    private {target} {role_name};")

                elif "Inheritance" in annotation:
                    lines.append(f"    {annotation}")  # Se aplica a la clase padre

            lines.append("")

    # ========================
    # Getters y Setters
    # ========================
    for attr in attributes:
        attr_name = attr["name"]
        attr_type = map_type(attr["type"])
        method_name = attr_name[0].upper() + attr_name[1:]

        # Getter
        lines.append(f"    public {attr_type} get{method_name}() " + "{")
        lines.append(f"        return {attr_name};")
        lines.append("    }")
        lines.append("")

        # Setter
        lines.append(f"    public void set{method_name}({attr_type} {attr_name}) " + "{")
        lines.append(f"        this.{attr_name} = {attr_name};")
        lines.append("    }")
        lines.append("")

    lines.append("}")
    return "\n".join(lines)


# ========================
# Función principal
# ========================
def generate_from_json(json_path: str):
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    diagram = data["diagram"]
    relations_map = build_relations(json_path)

    for c in diagram["classes"]:
        code = generate_entity(c, relations_map)
        file_path = os.path.join(OUTPUT_DIR, f"{c['name']}.java")
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(code)
        print(f"✅ Generada entidad con relaciones: {file_path}")


# ========================
# Ejecución directa
# ========================
if __name__ == "__main__":
    generate_from_json("../json/diagram_367493a5-e490-4665-a73f-8626674b2ee2.json")
