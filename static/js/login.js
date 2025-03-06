import { auth } from "./firebaseConfig.js";  // 🔹 Asegura que solo lo importas aquí
import { signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Escuchar cambios en la autenticación
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("✅ Usuario autenticado:", user);
        window.location.href = "/dashboard";  // 🔹 Redirigir si ya está autenticado
    } else {
        console.log("⚠ No hay usuario autenticado. Permaneciendo en login.");
    }
});

// Función para iniciar sesión
async function loginUser(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("✅ Usuario autenticado:", userCredential.user);

        // Redirigir después del login
        window.location.href = "/dashboard";  // 🔹 Cambia esto por la página a la que quieres redirigir

    } catch (error) {
        console.error("❌ Error en inicio de sesión:", error.message);
        alert("Error: " + error.message);
    }
}
