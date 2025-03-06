// Importar Firebase y autenticación
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { auth } from "./firebaseConfig.js";  // ✅ Importamos desde firebaseConfig.js
import { getAuth, onAuthStateChanged } from "firebase/auth";


// Obtén la instancia de autenticación
const auth = getAuth();

// 🔹 Función para iniciar sesión
const loginUser = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("✅ Usuario autenticado:", userCredential.user);
        window.location.href = "/dashboard";  // Redirigir tras iniciar sesión
    } catch (error) {
        console.error("❌ Error en inicio de sesión:", error.message);
    }
};

// 🔹 Manejo del evento de formulario
document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            loginUser(email, password);
        });
    }
});

// 🔹 Detecta el estado del usuario y redirige solo si es necesario
onAuthStateChanged(auth, (user) => {
    const currentPath = window.location.pathname;  // Obtiene la ruta actual

    if (user) {
        console.log("✅ Usuario autenticado:", user);

        // ✅ Evita redirección en bucle si ya está en "/dashboard"
        if (currentPath !== "/dashboard") {
            console.log("➡️ Redirigiendo a /dashboard...");
            window.location.href = "/dashboard";
        }
    } else {
        console.log("⚠️ Usuario no autenticado.");

        // ✅ Evita redirección en bucle si ya está en "/auth/login"
        if (currentPath !== "/auth/login") {
            console.log("➡️ Redirigiendo a /auth/login...");
            window.location.href = "/auth/login";
        }
    }
});