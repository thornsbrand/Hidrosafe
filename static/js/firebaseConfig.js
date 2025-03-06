// ✅ Importar Firebase desde el CDN para evitar problemas de rutas en Render
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let firebaseApp = null;
let auth = null;
let db = null;

// 🔹 Configuración de Firebase desde variables de entorno (Render)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// 🔹 Función para inicializar Firebase si no está inicializado
function initializeFirebase() {
  if (!firebaseApp) {
    firebaseApp = initializeApp(firebaseConfig);
    auth = getAuth(firebaseApp);
    db = getFirestore(firebaseApp);
    console.log("✅ Firebase inicializado correctamente en frontend.");
  }
}

// ✅ Ejecutar la inicialización de Firebase al cargar el script
initializeFirebase();

// Exportar los módulos de Firebase
export { auth, db, initializeFirebase };
