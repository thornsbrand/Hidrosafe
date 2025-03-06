// Asegúrate de usar imports correctos en ES Modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

// Importa la configuración de Firebase
import { firebaseConfig } from "./firebaseConfig.js";

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Función para iniciar sesión
const loginUser = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("✅ Usuario autenticado:", userCredential.user);
        window.location.href = "/dashboard";  // Redirigir tras iniciar sesión
    } catch (error) {
        console.error("❌ Error en inicio de sesión:", error.message);
    }
};

// Manejo del evento de formulario
document.getElementById("loginForm").addEventListener("submit", function (event) {
    event.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    loginUser(email, password);
});

// Verifica si el usuario ya está autenticado
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("✅ Usuario ya autenticado, redirigiendo...");
        window.location.href = "/dashboard";
    }
});
