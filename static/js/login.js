import { auth } from "./firebaseConfig.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { auth } from "./firebaseConfig.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// 🔹 Verificar si el usuario está autenticado
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("✅ Usuario autenticado:", user);
    } else {
        console.log("⚠ Usuario no autenticado. Redirigiendo a login...");
        window.location.href = "/auth/login";  // Asegúrate de que esta es tu ruta de login
    }
});


// 🔹 Función para iniciar sesión con Firebase
async function loginUser(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("✅ Usuario autenticado:", userCredential.user);

        // 🔹 Redirigir a la página de Dashboard o la que corresponda
        window.location.href = "/dashboard";  // Cambia "/dashboard" por tu URL real

    } catch (error) {
        console.error("❌ Error en inicio de sesión:", error.message);
        alert("Error: " + error.message);
    }
}   

// 🔹 Manejar el evento de envío del formulario
document.getElementById("login-form").addEventListener("submit", function (event) {
    event.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    loginUser(email, password);
});
