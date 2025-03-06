import { auth } from "./firebaseConfig.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// 🔹 Función para iniciar sesión con Firebase
async function loginUser(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("✅ Usuario autenticado:", userCredential.user);
        window.location.href = "/dashboard";  // Redirigir tras inicio de sesión
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
