import { auth, initializeFirebase } from "./firebaseConfig.js";
import { signInWithEmailAndPassword } from "firebase/auth";

async function loginUser(event) {
    event.preventDefault(); // Evita que el formulario recargue la página

    // ✅ Asegurar que Firebase se ha inicializado antes de intentar usar `auth`
    await initializeFirebase();

    // Capturar datos del formulario
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Iniciar sesión con Firebase
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            console.log("✅ Usuario autenticado:", userCredential.user);
            window.location.href = "dashboard.html"; // Redirigir al usuario
        })
        .catch((error) => {
            console.error("❌ Error al iniciar sesión:", error);
            alert("Error al iniciar sesión: " + error.message);
        });
}

// ✅ Asignar la función al formulario de inicio de sesión
document.getElementById("login-form").addEventListener("submit", loginUser);
