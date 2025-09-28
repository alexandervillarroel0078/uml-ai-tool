
# # """
# # json_to_relations.py
# # Lee el JSON y genera un mapa de relaciones con anotaciones JPA sugeridas.
# # """

# # import json

# # def to_camel(name: str) -> str:
# #     """Convierte nombres a camelCase: UnidadMedida → unidadMedida, unidad_medida → unidadMedida"""
# #     parts = name.replace("-", "_").split("_")
# #     if not parts:
# #         return name
# #     return parts[0].lower() + "".join(p.capitalize() for p in parts[1:])

# # def build_relations(json_path: str):
# #     with open(json_path, "r", encoding="utf-8") as f:
# #         data = json.load(f)

# #     relations_map = {}
# #     diagram = data["diagram"]

# #     for rel in diagram["relations"]:
# #         src = rel["from"]   # origen en el JSON
# #         dst = rel["to"]     # destino en el JSON
# #         rel_type = rel["type"]
# #         from_max = rel["from_max"]
# #         to_max = rel["to_max"]

# #         if src not in relations_map:
# #             relations_map[src] = {}
# #         if dst not in relations_map:
# #             relations_map[dst] = {}

# #         # ==============================
# #         # Herencia
# #         # ==============================
# #         if rel_type == "INHERITANCE":
# #             hijo = src   # el "from" en tu JSON
# #             padre = dst  # el "to" en tu JSON

# #     # Para el hijo → extiende al padre
# #             relations_map[hijo][padre] = {
# #               "type": "Extends",
# #               "parent": padre
# #             }

# #     # Para el padre → marca la estrategia de herencia
# #             relations_map[padre][hijo] = {
# #               "type": "Inheritance",
# #               "annotation": "@Inheritance(strategy = InheritanceType.JOINED)"
# #             }
# #             continue
# #     # 📌 IMPORTANTE:
# #     # En la estrategia JOINED, el ID del padre (Vehiculo.id) se usa como:
# #     #  - PK de la tabla hija (ej: Auto.id, Camion.id)
# #     #  - FK hacia la tabla padre (Auto.id → Vehiculo.id)
# #     # Por eso no aparece un campo llamado "vehiculo_id",
# #     # sino que se reutiliza la columna "id" como PK y FK a la vez.
# #         # ==============================
# #         # Composición (padre-hijo fuerte)
# #         # ==============================
# #         if rel_type == "COMPOSITION":
# #             # 🚨 Ajuste: aunque JSON diga (from=Aula, to=Modulo), el PADRE es `dst`
# #             padre = dst
# #             hijo = src

# #             relations_map[padre][hijo] = {
# #                 "type": "Composition",
# #                 "annotation": "@OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)",
# #                 "mappedBy": to_camel(padre)
# #             }

# #             relations_map[hijo][padre] = {
# #                 "type": "Composition",
# #                 "annotation": "@ManyToOne",
# #                 "joinColumn": f"{to_camel(padre)}_id"
# #             }
# #             continue

# #         # ==============================
# #         # Dependencia
# #         # ==============================
# #         if rel_type == "DEPENDENCY":
# #             relations_map[src][dst] = {
# #                 "type": "Dependency",
# #                 "annotation": "@ManyToOne",
# #                 "joinColumn": f"{to_camel(dst)}_id"
# #             }
# #             continue

# #         # ==============================
# #         # Asociación
# #         # ==============================
# #         if rel_type == "ASSOCIATION":
# #             if src == dst:
# #                 # Recursivas
# #                 if (from_max in (None, "*")) and (to_max in (None, "*")):
# #                     relations_map[src][dst] = {
# #                         "type": "RecursiveAssociation",
# #                         "annotation": "@ManyToMany",
# #                         "joinTable": f"{to_camel(src)}Relations"
# #                     }
# #                 elif from_max == 1 and (to_max in (None, "*")):
# #                     relations_map[src][dst] = {
# #                         "type": "RecursiveAssociation",
# #                         "annotation_one": "@OneToMany(mappedBy = \"parent\")",
# #                         "annotation_two": "@ManyToOne",
# #                         "joinColumn": f"{to_camel(src)}Parent_id"
# #                     }
# #                 elif (from_max in (None, "*")) and to_max == 1:
# #                     relations_map[src][dst] = {
# #                         "type": "RecursiveAssociation",
# #                         "annotation_one": "@ManyToOne",
# #                         "annotation_two": "@OneToMany(mappedBy = \"child\")",
# #                         "joinColumn": f"{to_camel(src)}Child_id"
# #                     }
# #                 else:
# #                     relations_map[src][dst] = {
# #                         "type": "RecursiveAssociation",
# #                         "annotation": "@OneToOne",
# #                         "joinColumn": f"{to_camel(src)}Ref_id"
# #                     }
# #             else:
# #                 # Asociación normal
# #                 if from_max == 1 and (to_max in (None, "*")):
# #                     relations_map[src][dst] = {
# #                         "type": "OneToMany",
# #                         "annotation": "@OneToMany"
# #                     }
# #                     relations_map[dst][src] = {
# #                         "type": "ManyToOne",
# #                         "annotation": "@ManyToOne",
# #                         "joinColumn": f"{to_camel(src)}_id"
# #                     }

# #                 elif (from_max in (None, "*")) and to_max == 1:
# #                     relations_map[src][dst] = {
# #                         "type": "ManyToOne",
# #                         "annotation": "@ManyToOne",
# #                         "joinColumn": f"{to_camel(dst)}_id"
# #                     }
# #                     relations_map[dst][src] = {
# #                         "type": "OneToMany",
# #                         "annotation": f"@OneToMany(mappedBy = \"{to_camel(dst)}\")"
# #                     }

# #                 elif (from_max in (None, "*")) and (to_max in (None, "*")):
# #                     relations_map[src][dst] = {
# #                         "type": "ManyToMany",
# #                         "annotation": "@ManyToMany",
# #                         "joinTable": f"{to_camel(src)}_{to_camel(dst)}"
# #                     }
# #                     relations_map[dst][src] = {
# #                         "type": "ManyToMany",
# #                         "annotation": f"@ManyToMany(mappedBy = \"{to_camel(src)}\")"
# #                     }

# #                 else:
# #                     relations_map[src][dst] = {
# #                         "type": "OneToOne",
# #                         "annotation": "@OneToOne",
# #                         "joinColumn": f"{to_camel(dst)}_id"
# #                     }
# #                     relations_map[dst][src] = {
# #                         "type": "OneToOne",
# #                         "annotation": f"@OneToOne(mappedBy = \"{to_camel(src)}\")"
# #                     }

# #     return relations_map

# # if __name__ == "__main__":
# #     relations = build_relations("../json/diagram.json")
# #     print(json.dumps(relations, indent=4))
# """
# json_to_relations.py
# Lee el JSON y genera un mapa de relaciones con anotaciones JPA sugeridas.
# """

# import json

# def to_camel(name: str) -> str:
#     """Convierte nombres a camelCase: UnidadMedida → unidadMedida, unidad_medida → unidadMedida"""
#     parts = name.replace("-", "_").split("_")
#     if not parts:
#         return name
#     return parts[0].lower() + "".join(p.capitalize() for p in parts[1:])

# def build_relations(json_path: str):
#     with open(json_path, "r", encoding="utf-8") as f:
#         data = json.load(f)

#     relations_map = {}
#     diagram = data["diagram"]

#     for rel in diagram["relations"]:
#         src = rel["from"]   # origen en el JSON
#         dst = rel["to"]     # destino en el JSON
#         rel_type = rel["type"]
#         from_max = rel["from_max"]
#         to_max = rel["to_max"]

#         if src not in relations_map:
#             relations_map[src] = {}
#         if dst not in relations_map:
#             relations_map[dst] = {}

#         # ==============================
#         # Herencia
#         # ==============================
#         if rel_type == "INHERITANCE":
#             hijo = src   # el "from" en tu JSON
#             padre = dst  # el "to" en tu JSON

#             # Para el hijo → extiende al padre
#             relations_map[hijo][padre] = {
#               "type": "Extends",
#               "parent": padre
#             }

#             # Para el padre → marca la estrategia de herencia
#             relations_map[padre][hijo] = {
#               "type": "Inheritance",
#               "annotation": "@Inheritance(strategy = InheritanceType.JOINED)"
#             }
#             continue

#         # ==============================
#         # Composición (padre-hijo fuerte)
#         # ==============================
#         if rel_type == "COMPOSITION":
#             # 🚨 Ajuste: aunque JSON diga (from=Aula, to=Modulo), el PADRE es `dst`
#             padre = dst
#             hijo = src

#             relations_map[padre][hijo] = {
#                 "type": "Composition",
#                 "annotation": "@OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)",
#                 "mappedBy": to_camel(padre)
#             }

#             relations_map[hijo][padre] = {
#                 "type": "Composition",
#                 "annotation": "@ManyToOne",
#                 "joinColumn": f"{to_camel(padre)}_id"
#             }
#             continue

#         # ==============================
#         # Dependencia
#         # ==============================
#         if rel_type == "DEPENDENCY":
#             relations_map[src][dst] = {
#                 "type": "Dependency",
#                 "annotation": "@ManyToOne",
#                 "joinColumn": f"{to_camel(dst)}_id"
#             }
#             continue

#         # ==============================
#         # Asociación
#         # ==============================
#         if rel_type == "ASSOCIATION":
#             if src == dst:
#                 # Recursivas
#                 if (from_max in (None, "*")) and (to_max in (None, "*")):
#                     label = rel.get("label", "related")
#                     relations_map[src][dst] = {
#                         "type": "RecursiveAssociation",
#                         "annotation": "@ManyToMany",
#                         "joinTable": f"{to_camel(src)}_{to_camel(dst)}",
#                         "label": label
#                     }
#                     relations_map[dst][src] = {
#                         "type": "RecursiveAssociation",
#                         "annotation": f"@ManyToMany(mappedBy = \"{label}\")",
#                         "label": label + "De"
#                     }

#                 elif from_max == 1 and (to_max in (None, "*")):
#                     relations_map[src][dst] = {
#                         "type": "RecursiveAssociation",
#                         "annotation_one": "@OneToMany(mappedBy = \"parent\")",
#                         "annotation_two": "@ManyToOne",
#                         "joinColumn": f"{to_camel(src)}Parent_id"
#                     }
#                 elif (from_max in (None, "*")) and to_max == 1:
#                     relations_map[src][dst] = {
#                         "type": "RecursiveAssociation",
#                         "annotation_one": "@ManyToOne",
#                         "annotation_two": "@OneToMany(mappedBy = \"child\")",
#                         "joinColumn": f"{to_camel(src)}Child_id"
#                     }
#                 else:
#                     relations_map[src][dst] = {
#                         "type": "RecursiveAssociation",
#                         "annotation": "@OneToOne",
#                         "joinColumn": f"{to_camel(src)}Ref_id"
#                     }
#             else:
#                 # Asociación normal
#                 if from_max == 1 and (to_max in (None, "*")):
#                     relations_map[src][dst] = {
#                         "type": "OneToMany",
#                         "annotation": "@OneToMany"
#                     }
#                     relations_map[dst][src] = {
#                         "type": "ManyToOne",
#                         "annotation": "@ManyToOne",
#                         "joinColumn": f"{to_camel(src)}_id"
#                     }

#                 elif (from_max in (None, "*")) and to_max == 1:
#                     relations_map[src][dst] = {
#                         "type": "ManyToOne",
#                         "annotation": "@ManyToOne",
#                         "joinColumn": f"{to_camel(dst)}_id"
#                     }
#                     relations_map[dst][src] = {
#                         "type": "OneToMany",
#                         "annotation": f"@OneToMany(mappedBy = \"{to_camel(dst)}\")"
#                     }

#                 elif (from_max in (None, "*")) and (to_max in (None, "*")):
#                     relations_map[src][dst] = {
#                         "type": "ManyToMany",
#                         "annotation": "@ManyToMany",
#                         "joinTable": f"{to_camel(src)}_{to_camel(dst)}"
#                     }
#                     relations_map[dst][src] = {
#                         "type": "ManyToMany",
#                         "annotation": f"@ManyToMany(mappedBy = \"{to_camel(src)}\")"
#                     }

#                 else:
#                     relations_map[src][dst] = {
#                         "type": "OneToOne",
#                         "annotation": "@OneToOne",
#                         "joinColumn": f"{to_camel(dst)}_id"
#                     }
#                     relations_map[dst][src] = {
#                         "type": "OneToOne",
#                         "annotation": f"@OneToOne(mappedBy = \"{to_camel(src)}\")"
#                     }

#     return relations_map

# if __name__ == "__main__":
#     relations = build_relations("../json/diagram.json")
#     print(json.dumps(relations, indent=4))
"""
json_to_relations.py
Lee el JSON y genera un mapa de relaciones con anotaciones JPA sugeridas.
"""

import json

def to_camel(name: str) -> str:
    """Convierte nombres a camelCase: UnidadMedida → unidadMedida, unidad_medida → unidadMedida"""
    parts = name.replace("-", "_").split("_")
    if not parts:
        return name
    return parts[0].lower() + "".join(p.capitalize() for p in parts[1:])

def build_relations(json_path: str):
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    relations_map = {}
    diagram = data["diagram"]

    for rel in diagram["relations"]:
        src = rel["from"]   # origen en el JSON
        dst = rel["to"]     # destino en el JSON
        rel_type = rel["type"]
        from_max = rel["from_max"]
        to_max = rel["to_max"]

        if src not in relations_map:
            relations_map[src] = {}
        if dst not in relations_map:
            relations_map[dst] = {}

        # ==============================
        # Herencia
        # ==============================
        if rel_type == "INHERITANCE":
            hijo = src
            padre = dst

            relations_map[hijo][padre] = {
              "type": "Extends",
              "parent": padre
            }

            relations_map[padre][hijo] = {
              "type": "Inheritance",
              "annotation": "@Inheritance(strategy = InheritanceType.JOINED)"
            }
            continue

        # ==============================
        # Composición
        # ==============================
        if rel_type == "COMPOSITION":
            padre = dst
            hijo = src

            relations_map[padre][hijo] = {
                "type": "Composition",
                "annotation": "@OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)",
                "mappedBy": to_camel(padre)
            }

            relations_map[hijo][padre] = {
                "type": "Composition",
                "annotation": "@ManyToOne",
                "joinColumn": f"{to_camel(padre)}_id"
            }
            continue

        # ==============================
        # Dependencia
        # ==============================
        if rel_type == "DEPENDENCY":
            relations_map[src][dst] = {
                "type": "Dependency",
                "annotation": "@ManyToOne",
                "joinColumn": f"{to_camel(dst)}_id"
            }
            continue

        # ==============================
        # Asociación
        # ==============================
        if rel_type == "ASSOCIATION":
            if src == dst:
                # Recursivas
                if (from_max in (None, "*")) and (to_max in (None, "*")):
                    label = rel.get("label", "related")
                    relations_map[src][dst] = {
                        "type": "RecursiveAssociation",
                        "annotation": "@ManyToMany",
                        "joinTable": f"{to_camel(src)}_{to_camel(dst)}",
                        "label": label
                    }
                    relations_map[dst][src] = {
                        "type": "RecursiveAssociation",
                        "annotation": f"@ManyToMany(mappedBy = \"{label}\")",
                        "label": label + "De",
                        "mappedByTarget": label  # 👈 Campo dueño al que referencia
                    }

                elif from_max == 1 and (to_max in (None, "*")):
                    relations_map[src][dst] = {
                        "type": "RecursiveAssociation",
                        "annotation_one": "@OneToMany(mappedBy = \"parent\")",
                        "annotation_two": "@ManyToOne",
                        "joinColumn": f"{to_camel(src)}Parent_id"
                    }
                elif (from_max in (None, "*")) and to_max == 1:
                    relations_map[src][dst] = {
                        "type": "RecursiveAssociation",
                        "annotation_one": "@ManyToOne",
                        "annotation_two": "@OneToMany(mappedBy = \"child\")",
                        "joinColumn": f"{to_camel(src)}Child_id"
                    }
                else:
                    relations_map[src][dst] = {
                        "type": "RecursiveAssociation",
                        "annotation": "@OneToOne",
                        "joinColumn": f"{to_camel(src)}Ref_id"
                    }
            else:
                # Asociación normal
                if from_max == 1 and (to_max in (None, "*")):
                    relations_map[src][dst] = {
                        "type": "OneToMany",
                        "annotation": "@OneToMany"
                    }
                    relations_map[dst][src] = {
                        "type": "ManyToOne",
                        "annotation": "@ManyToOne",
                        "joinColumn": f"{to_camel(src)}_id"
                    }

                elif (from_max in (None, "*")) and to_max == 1:
                    relations_map[src][dst] = {
                        "type": "ManyToOne",
                        "annotation": "@ManyToOne",
                        "joinColumn": f"{to_camel(dst)}_id"
                    }
                    relations_map[dst][src] = {
                        "type": "OneToMany",
                        "annotation": f"@OneToMany(mappedBy = \"{to_camel(dst)}\")"
                    }

                elif (from_max in (None, "*")) and (to_max in (None, "*")):
                    relations_map[src][dst] = {
                        "type": "ManyToMany",
                        "annotation": "@ManyToMany",
                        "joinTable": f"{to_camel(src)}_{to_camel(dst)}"
                    }
                    relations_map[dst][src] = {
                        "type": "ManyToMany",
                        "annotation": f"@ManyToMany(mappedBy = \"{to_camel(src)}\")"
                    }

                else:
                    relations_map[src][dst] = {
                        "type": "OneToOne",
                        "annotation": "@OneToOne",
                        "joinColumn": f"{to_camel(dst)}_id"
                    }
                    relations_map[dst][src] = {
                        "type": "OneToOne",
                        "annotation": f"@OneToOne(mappedBy = \"{to_camel(src)}\")"
                    }

    return relations_map

if __name__ == "__main__":
    relations = build_relations("../json/diagram.json")
    print(json.dumps(relations, indent=4))
