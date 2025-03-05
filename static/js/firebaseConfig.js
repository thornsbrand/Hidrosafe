// Importar Firebase
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

let firebaseApp = null;
let auth = null;
let db = null;

// 🔹 Función para inicializar Firebase
async function initializeFirebase() {
  if (!firebaseApp) {
    try {
      const response = await fetch("/get-firebase-config");
      const firebaseConfig = await response.json();

      firebaseApp = initializeApp(firebaseConfig); // ✅ Inicializar Firebase
      auth = getAuth(firebaseApp);
      db = getFirestore(firebaseApp);

      console.log("✅ Firebase inicializado correctamente en frontend.");
    } catch (error) {
      console.error("❌ Error al obtener la configuración de Firebase:", error);
    }
  }
}

// ✅ Ejecutar la inicialización de Firebase al cargar la app
initializeFirebase();

// Exportar los módulos de Firebase (se inicializarán cuando estén listos)
export { auth, db, initializeFirebase };
