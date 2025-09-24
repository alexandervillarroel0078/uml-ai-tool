// // src/hooks/useMethods.js
// import { useEffect, useState } from "react";
// import {
//   listMethods,
//   createMethod as apiCreateMethod,
//   updateMethod as apiUpdateMethod,
//   deleteMethod as apiDeleteMethod,
// } from "../api/classes";
// import { onEvent } from "../api/realtime";

// export default function useMethods(classId) {
//   const [methods, setMethods] = useState([]);
//   const [selectedMethodId, setSelectedMethodId] = useState(null);

//   const selectedMethod =
//     methods.find((m) => m.id === selectedMethodId) || null;

//   // ====== CARGA INICIAL ======
//   async function loadMethods() {
//     if (!classId) return;
//     try {
//       const items = await listMethods(classId);
//       setMethods(items || []);
//       if (selectedMethodId && !items?.some((x) => x.id === selectedMethodId)) {
//         setSelectedMethodId(null);
//       }
//     } catch {
//       setMethods([]);
//     }
//   }

//   useEffect(() => {
//     if (classId) loadMethods();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [classId]);

//   // ====== CRUD (solo API, sin tocar state) ======
//   async function createMethod(body) {
//     return await apiCreateMethod(classId, body);
//   }

//   async function updateMethod(methodId, patch) {
//     return await apiUpdateMethod(methodId, patch);
//   }

//   async function deleteMethod(methodId) {
//     if (!confirm("¿Eliminar este método?")) return;
//     return await apiDeleteMethod(methodId);
//   }

//   // ====== EVENTOS EN TIEMPO REAL ======
//   useEffect(() => {
//     if (!classId) return;

//     // crear
//     onEvent("method.created", (m) => {
//       if (m.clase_id === classId) {
//         setMethods((prev) => [...prev, m]);
//       }
//     });

//     // actualizar
//     onEvent("method.updated", (m) => {
//       if (m.clase_id === classId) {
//         setMethods((prev) =>
//           prev.map((x) => (x.id === m.id ? { ...x, ...m } : x))
//         );
//       }
//     });

//     // eliminar
//     onEvent("method.deleted", ({ id }) => {
//       setMethods((prev) => prev.filter((x) => x.id !== id));
//       if (selectedMethodId === id) setSelectedMethodId(null);
//     });
//   }, [classId, selectedMethodId]);

//   return {
//     methods,
//     selectedMethodId,
//     setSelectedMethodId,
//     selectedMethod,

//     loadMethods,
//     createMethod,
//     updateMethod,
//     deleteMethod,
//   };
// }
import { useEffect, useState } from "react";
import {
  listMethods,
  createMethod as apiCreateMethod,
  updateMethod as apiUpdateMethod,
  deleteMethod as apiDeleteMethod,
} from "../api/classes";

export default function useMethods(classId) {
  const [methods, setMethods] = useState([]);
  const [selectedMethodId, setSelectedMethodId] = useState(null);

  const selectedMethod =
    methods.find((m) => m.id === selectedMethodId) || null;

  async function loadMethods() {
    if (!classId) return;
    try {
      const items = await listMethods(classId);
      setMethods(items || []);
      if (selectedMethodId && !items?.some((x) => x.id === selectedMethodId)) {
        setSelectedMethodId(null);
      }
    } catch {
      setMethods([]);
    }
  }

  useEffect(() => {
    if (classId) loadMethods();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  async function createMethod(body) {
    return await apiCreateMethod(classId, body);
  }

  async function updateMethod(methodId, patch) {
    return await apiUpdateMethod(methodId, patch);
  }

  async function deleteMethod(methodId) {
    if (!confirm("¿Eliminar este método?")) return;
    return await apiDeleteMethod(methodId);
  }

  return {
    methods,
    selectedMethodId,
    setSelectedMethodId,
    selectedMethod,

    loadMethods,
    createMethod,
    updateMethod,
    deleteMethod,
  };
}
