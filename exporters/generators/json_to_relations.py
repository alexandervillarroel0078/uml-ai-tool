"""
json_to_relations.py
Lee el JSON y genera un mapa de relaciones con anotaciones JPA sugeridas.
"""

import json

def build_relations(json_path: str):
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    relations_map = {}
    diagram = data["diagram"]

    for rel in diagram["relations"]:
        src = rel["from"]
        dst = rel["to"]
        rel_type = rel["type"]
        from_max = rel["from_max"]
        to_max = rel["to_max"]

        if src not in relations_map:
            relations_map[src] = {}

        # ==============================
        # Herencia
        # ==============================
        if rel_type == "INHERITANCE":
            relations_map[src][dst] = {
                "type": "Inheritance",
                "annotation": "@Inheritance(strategy = InheritanceType.JOINED)"
            }
            continue

        # ==============================
        # Composición (cascada fuerte)
        # Origen 1..* → Destino 1..1
        # ==============================
        if rel_type == "COMPOSITION":
            if from_max is None or from_max == "*":
                jpa_type = "@ManyToOne"
            else:
                jpa_type = "@OneToOne"

            relations_map[src][dst] = {
                "type": "Composition",
                "annotation": jpa_type + "(cascade = CascadeType.ALL)",
                "joinColumn": f"{dst.lower()}_id"
            }
            continue

        # ==============================
        # Dependencia (generalmente ManyToOne)
        # ==============================
        if rel_type == "DEPENDENCY":
            relations_map[src][dst] = {
                "type": "Dependency",
                "annotation": "@ManyToOne",
                "joinColumn": f"{dst.lower()}_id"
            }
            continue

        # ==============================
        # Asociación
        # ==============================
        if rel_type == "ASSOCIATION":
            # Caso especial: recursiva
            if src == dst:
                # Analizar multiplicidad
                if (from_max is None or from_max == "*") and (to_max is None or to_max == "*"):
                    # Muchos ↔ Muchos
                    relations_map[src][dst] = {
                        "type": "RecursiveAssociation",
                        "annotation": "@ManyToMany",
                        "joinTable": f"{src.lower()}_relations"
                    }
                elif from_max == 1 and (to_max is None or to_max == "*"):
                    # Uno → Muchos (jerárquico)
                    relations_map[src][dst] = {
                        "type": "RecursiveAssociation",
                        "annotation_one": "@OneToMany(mappedBy = \"parent\")",
                        "annotation_two": "@ManyToOne",
                        "joinColumn": f"{src.lower()}_parent_id"
                    }
                elif (from_max is None or from_max == "*") and to_max == 1:
                    # Muchos → Uno (jerárquico inverso)
                    relations_map[src][dst] = {
                        "type": "RecursiveAssociation",
                        "annotation_one": "@ManyToOne",
                        "annotation_two": "@OneToMany(mappedBy = \"child\")",
                        "joinColumn": f"{src.lower()}_child_id"
                    }
                else:
                    # Caso raro: 1 ↔ 1 recursivo
                    relations_map[src][dst] = {
                        "type": "RecursiveAssociation",
                        "annotation": "@OneToOne",
                        "joinColumn": f"{src.lower()}_ref_id"
                    }
            else:
                # Asociación normal
                if from_max == 1 and (to_max is None or to_max == "*"):
                    jpa_type = "@OneToMany"
                elif (from_max is None or from_max == "*") and to_max == 1:
                    jpa_type = "@ManyToOne"
                elif (from_max is None or from_max == "*") and (to_max is None or to_max == "*"):
                    jpa_type = "@ManyToMany"
                else:
                    jpa_type = "@OneToOne"

                relations_map[src][dst] = {
                    "type": "Association",
                    "annotation": jpa_type,
                    "joinColumn": f"{dst.lower()}_id"
                }

    return relations_map


if __name__ == "__main__":
    relations = build_relations("../json/diagram_367493a5-e490-4665-a73f-8626674b2ee2.json")
    print(json.dumps(relations, indent=4))
