// login.js
import { auth } from "./firebaseConfig.js";  // ✅ Importamos `auth` desde firebaseConfig.js
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";

// 🔹 Detecta el estado del usuario y redirige solo si es necesario
onAuthStateChanged(auth, (user) => {
    const currentPath = window.location.pathname;

    if (user) {
        console.log("✅ Usuario autenticado:", user);
        if (currentPath !== "/dashboard") {
            console.log("➡️ Redirigiendo a /dashboard...");
            window.location.href = "/dashboard";
        }
    }
});

// 🔹 Manejo del formulario de login
document.getElementById("login-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("✅ Inicio de sesión exitoso:", userCredential.user);
        window.location.href = "/dashboard";
    } catch (error) {
        console.error("❌ Error en inicio de sesión:", error.message);
        alert("Error en el inicio de sesión. Verifica tus credenciales.");
    }
});
