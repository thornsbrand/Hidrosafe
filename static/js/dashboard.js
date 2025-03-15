document.addEventListener("DOMContentLoaded", function () {
    actualizarDatos();  // Cargar datos en tiempo real al inicio
    setInterval(actualizarDatos, 5000);  // Actualizar cada 5 segundos
});

// Función principal que llama ambas APIs
async function actualizarDatos() {
    await cargarDatosSensores();
    await cargarEstadoSistema();
}

// 📌 Función para actualizar sensores en el Dashboard
async function cargarDatosSensores() {
    try {
        const response = await fetch("/api/sensor_data");
        const data = await response.json();

        console.log("📥 Datos recibidos de sensor_data:", data);  // 🔎 Debugging

        if (!data || typeof data !== "object") {
            console.error("⚠️ Error: La API no devolvió un objeto válido.");
            return;
        }

        // 🔹 Lista de sensores esperados en la respuesta
        const sensores = ["PS1", "PS2", "PS3", "PS4", "PS5", "PS6", "EPS1", "FS1", "FS2", "TS1", "TS2", "TS3", "TS4", "VS1", "CE", "CP", "SE"];

        sensores.forEach(sensor => {
            const element = document.getElementById(sensor);
            if (element && data[sensor] !== undefined) {
                element.innerText = `${data[sensor]}`;  // 📌 Se asigna directamente el valor recibido
            } else {
                console.warn(`⚠️ No se encontró '${sensor}' en los datos recibidos.`);
            }
        });

    } catch (error) {
        console.error("❌ Error cargando datos en tiempo real:", error);
    }
}

// 📌 Función para actualizar el estado del sistema en el Dashboard
async function cargarEstadoSistema() {
    try {
        const response = await fetch("/api/system_status");
        const data = await response.json();

        console.log("📥 Datos recibidos de system_status:", data);  // 🔎 Debugging

        if (!data || typeof data !== "object") {
            console.error("⚠️ Error: La API no devolvió un objeto válido.");
            return;
        }

        // 🔹 Mapeo de los valores de estado a sus elementos en el Dashboard
        const statusMapping = {
            "cooler_condition": "Cooler Condition",
            "valve_condition": "Valve Condition",
            "pump_leakage": "Pump Leakage",
            "accumulator_pressure": "Accumulator Pressure",
            "stable": "Stability"
        };

        Object.entries(statusMapping).forEach(([key, label]) => {
            const element = document.getElementById(key);
            if (element && data[key] !== undefined) {
                if (key === "stable") {
                    element.innerText = data[key] ? "Stable ✅" : "Unstable ❌";
                } else {
                    element.innerText = data[key];  // 📌 Muestra el valor recibido
                }
            } else {
                console.warn(`⚠️ No se encontró '${key}' en los datos recibidos.`);
            }
        });

    } catch (error) {
        console.error("❌ Error cargando estado del sistema:", error);
    }
}

// 📌 Asegurar que se ejecuta la función en la carga de la página
document.addEventListener("DOMContentLoaded", function () {
    actualizarDatos();
    setInterval(actualizarDatos, 5000);  // Recargar cada 5 segundos
});
