document.addEventListener("DOMContentLoaded", function () {
    actualizarDatos();  // Cargar datos en tiempo real al inicio
    setInterval(actualizarDatos, 5000);  // Actualizar cada 5 segundos
});

// Función principal que llama ambas APIs
async function actualizarDatos() {
    await cargarDatosSensores();
    await cargarEstadoSistema();
}

// 📌 Función para actualizar sensores
async function cargarDatosSensores() {
    try {
        const response = await fetch("/api/sensor_data");
        const data = await response.json();

        if (data.error) {
            console.error("Error al obtener datos de sensores:", data.error);
            return;
        }

        // 🔹 Actualizar cada sensor en el Dashboard
        const sensores = ["PS1", "PS2", "PS3", "PS4", "PS5", "PS6", "EPS1", "FS1", "FS2", "TS1", "TS2", "TS3", "TS4", "VS1", "CE", "CP", "SE"];

        sensores.forEach(sensor => {
            if (document.getElementById(sensor)) {
                document.getElementById(sensor).innerText = data.sensors[sensor] + " " + (data.units[sensor] || "");
            }
        });

    } catch (error) {
        console.error("Error cargando datos en tiempo real:", error);
    }
}

// 📌 Función para actualizar el estado del sistema
async function cargarEstadoSistema() {
    try {
        const response = await fetch("/api/system_status");
        const data = await response.json();

        if (data.error) {
            console.error("Error al obtener estado del sistema:", data.error);
            return;
        }

        // 🔹 Mapeo de IDs en el HTML a los datos de la API
        const statusMapping = {
            "cooler_condition": "Cooler Condition",
            "valve_condition": "Valve Condition",
            "pump_leakage": "Pump Leakage",
            "accumulator_pressure": "Accumulator Pressure",
            "stable": "Stability"
        };

        Object.entries(statusMapping).forEach(([key, label]) => {
            const element = document.getElementById(key);
            if (element) {
                element.innerText = key === "stable" ? (data[key] ? "Stable" : "Unstable") : data[key] + (key.includes("pressure") ? " bar" : " %");
            }
        });

    } catch (error) {
        console.error("Error cargando estado del sistema:", error);
    }
}
