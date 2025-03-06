// Importa solo una vez
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";  // 🔹 Agrega esta línea

// Configuración de Firebase desde el backend
export const firebaseConfig = await fetch("/get-firebase-config")
    .then(response => response.json())
    .catch(error => console.error("Error al obtener la configuración de Firebase:", error));


// 🔹 Configuración de Firebase (Reemplaza con tus valores reales)
const firebaseConfig = {
  apiKey: "AIzaSyADxmST-tVzWPery7a7tYksjeBNKlbYMxk",
  authDomain: "hydrosafe-b8635.firebaseapp.com",
  projectId: "hydrosafe-b8635",
  storageBucket: "hydrosafe-b8635.firebasestorage.app",
  messagingSenderId: "670282184676",
  appId: "1:670282184676:web:ca9e9c512e7a6d5c6fb9f1",
  measurementId: "G-Q2WRN959TS"
};

// 🔹 Inicializar Firebase si no está inicializado
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
console.log("✅ Firebase inicializado correctamente en frontend.");

// Exportar módulos de Firebase
export { auth, db };
