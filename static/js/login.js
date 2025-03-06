// Importar Firebase y autenticación
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { auth } from "./firebaseConfig.js";  // ✅ Importamos desde firebaseConfig.js

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

// 🔹 Verifica si el usuario ya está autenticado y evita redirección en bucle
onAuthStateChanged(auth, (user) => {
    const currentPath = window.location.pathname;

    if (user) {
        console.log("✅ Usuario ya autenticado.");

        // ✅ Redirigir solo si NO está en el dashboard
        if (currentPath !== "/dashboard") {
            console.log("➡️ Redirigiendo a /dashboard...");
            window.location.href = "/dashboard";
        }
    } else {
        console.log("⚠️ Usuario no autenticado.");
        // ✅ Si el usuario no está autenticado y NO está en login, redirigir a login
        if (currentPath !== "/auth/login") {
            console.log("➡️ Redirigiendo a /auth/login...");
            window.location.href = "/auth/login";
        }
    }
});
