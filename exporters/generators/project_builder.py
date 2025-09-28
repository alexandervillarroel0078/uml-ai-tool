# # project_builder.py
# import os, shutil
# from json_to_full_orm import generate_from_json

# TEMPLATES_DIR = os.path.join(os.path.dirname(__file__), "..", "templates")
# OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "output", "generated_project_test")

# def render_template(template_path, context):
#     with open(template_path, "r", encoding="utf-8") as f:
#         content = f.read().lstrip()
#     for key, value in context.items():
#         content = content.replace("{{ " + key + " }}", value)
#     return content

# def build_project(json_path):
#     src_main = os.path.join(OUTPUT_DIR, "src", "main", "java", "com", "test")
#     src_models = os.path.join(src_main, "models")
#     resources = os.path.join(OUTPUT_DIR, "src", "main", "resources")

#     os.makedirs(src_main, exist_ok=True)
#     os.makedirs(src_models, exist_ok=True)
#     os.makedirs(resources, exist_ok=True)

#     # 1) Generar modelos
#     generate_from_json(json_path)

#     # 2) Copiar modelos generados
#     GENERATED_MODELS = os.path.join(os.path.dirname(__file__), "..", "generated", "models")
#     if os.path.exists(GENERATED_MODELS):
#         for file in os.listdir(GENERATED_MODELS):
#             if file.endswith(".java"):
#                 shutil.copy(os.path.join(GENERATED_MODELS, file), src_models)
#                 print(f"📦 Copiado: {file} → {src_models}")
#     else:
#         print("⚠️ No se encontraron modelos generados.")

#     # 3) Renderizar pom.xml
#     pom_content = render_template(
#         os.path.join(TEMPLATES_DIR, "pom.xml.j2"),
#         {"groupId": "com.test", "artifactId": "demo"}
#     )
#     with open(os.path.join(OUTPUT_DIR, "pom.xml"), "w", encoding="utf-8") as f:
#         f.write(pom_content)

#     # 4) Renderizar application.properties
#     props_content = render_template(
#         os.path.join(TEMPLATES_DIR, "application.properties.j2"),
#         {"db_name": "testdb", "db_user": "postgres", "db_pass": "1234"}
#     )
#     with open(os.path.join(resources, "application.properties"), "w", encoding="utf-8") as f:
#         f.write(props_content)

#     # 5) Clase principal
#     main_class_content = render_template(
#         os.path.join(TEMPLATES_DIR, "main.java.j2"),
#         {"groupId": "com.test", "artifactId": "demo"}
#     )
#     with open(os.path.join(src_main, "DemoApplication.java"), "w", encoding="utf-8") as f:
#         f.write(main_class_content)
#     print("🚀 Clase principal generada: DemoApplication.java")

#     # 6) Controlador básico
#     controller_content = render_template(
#         os.path.join(TEMPLATES_DIR, "controller.java.j2"),
#         {"groupId": "com.test"}
#     )
#     with open(os.path.join(src_main, "HealthController.java"), "w", encoding="utf-8") as f:
#         f.write(controller_content)
#     print("🌐 Controlador generado: HealthController.java")

#     print(f"✅ Proyecto generado en: {OUTPUT_DIR}")

# if __name__ == "__main__":
#     build_project("../json/diagram_367493a5-e490-4665-a73f-8626674b2ee2.json")
# project_builder.py
import os
from json_to_full_orm import generate_from_json

TEMPLATES_DIR = os.path.join(os.path.dirname(__file__), "..", "templates")
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "output", "generated_project_test")

def render_template(template_path, context):
    with open(template_path, "r", encoding="utf-8") as f:
        content = f.read().lstrip()
    for key, value in context.items():
        content = content.replace("{{ " + key + " }}", value)
    return content

def build_project(json_path):
    src_main = os.path.join(OUTPUT_DIR, "src", "main", "java", "com", "test")
    src_models = os.path.join(src_main, "models")
    resources = os.path.join(OUTPUT_DIR, "src", "main", "resources")

    os.makedirs(src_main, exist_ok=True)
    os.makedirs(src_models, exist_ok=True)
    os.makedirs(resources, exist_ok=True)

    # 1) Generar modelos directamente en src_models
    generate_from_json(json_path, src_models)

    # 2) Renderizar pom.xml
    pom_content = render_template(
        os.path.join(TEMPLATES_DIR, "pom.xml.j2"),
        {"groupId": "com.test", "artifactId": "demo"}
    )
    with open(os.path.join(OUTPUT_DIR, "pom.xml"), "w", encoding="utf-8") as f:
        f.write(pom_content)

    # 3) Renderizar application.properties
    props_content = render_template(
        os.path.join(TEMPLATES_DIR, "application.properties.j2"),
        {"db_name": "testdb", "db_user": "postgres", "db_pass": "1234"}
    )
    with open(os.path.join(resources, "application.properties"), "w", encoding="utf-8") as f:
        f.write(props_content)

    # 4) Clase principal
    main_class_content = render_template(
        os.path.join(TEMPLATES_DIR, "main.java.j2"),
        {"groupId": "com.test", "artifactId": "demo"}
    )
    with open(os.path.join(src_main, "DemoApplication.java"), "w", encoding="utf-8") as f:
        f.write(main_class_content)
    print("🚀 Clase principal generada: DemoApplication.java")

    # 5) Controlador básico
    controller_content = render_template(
        os.path.join(TEMPLATES_DIR, "controller.java.j2"),
        {"groupId": "com.test"}
    )
    with open(os.path.join(src_main, "HealthController.java"), "w", encoding="utf-8") as f:
        f.write(controller_content)
    print("🌐 Controlador generado: HealthController.java")

    print(f"✅ Proyecto generado en: {OUTPUT_DIR}")

if __name__ == "__main__":
    build_project("../json/diagram_367493a5-e490-4665-a73f-8626674b2ee2.json")
