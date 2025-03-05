// Importar las funciones necesarias de Firebase
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 🔹 Si estás cargando variables desde un backend, necesitas obtenerlas desde un archivo JSON
async function getFirebaseConfig() {
  try {
    const response = await fetch("/get-firebase-config");
    const firebaseConfig = await response.json();
    
    // ✅ Inicializar Firebase con los datos recibidos
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    console.log("✅ Firebase inicializado correctamente en frontend.");
    return { auth, db };
  } catch (error) {
    console.error("❌ Error al obtener la configuración de Firebase:", error);
  }
}

// Exportar la inicialización de Firebase
export const firebaseServices = getFirebaseConfig();
