// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_STORAGE_BUCKET",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID",
  measurementId: "TU_MEASUREMENT_ID",
};

// 🔹 Inicializar Firebase solo una vez
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);  // ✅ Exportamos `auth`

export { auth };  // 🚀 Exportamos la autenticación para reutilizarla
