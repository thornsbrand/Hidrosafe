async function cargarDatosSensores() {
    try {
        const response = await fetch('/api/sensor_data');
        const data = await response.json();
        
        if (!data) {
            console.error("No se recibieron datos.");
            return;
        }

        Object.keys(data).forEach(sensor => {
            const element = document.getElementById(sensor);
            if (element) {
                element.textContent = `${data[sensor]} ${sensor.includes('PS') ? 'bar' :
                    sensor.includes('EPS') ? 'W' :
                    sensor.includes('FS') ? 'l/min' :
                    sensor.includes('TS') ? '°C' :
                    sensor.includes('VS') ? 'mm/s' :
                    sensor.includes('CE') ? '%' :
                    sensor.includes('CP') ? 'kW' :
                    sensor.includes('SE') ? '%' : ''}`;
            }
        });
    } catch (error) {
        console.error("Error cargando datos:", error);
    }
}


async function cargarEstadoSistema() {
    try {
        const response = await fetch('/api/system_status');
        const data = await response.json();
        console.log("📥 Datos recibidos de system_status:", data);

        if (!data) {
            console.error("❌ No se recibieron datos de system_status.");
            return;
        }

        const mapeo = {
            cooler_condition: "Cooler",
            valve_condition: "Valve",
            pump_leakage: "Pump Leakage",
            accumulator_pressure: "Accumulator Pressure",
            stable: "Stability"
        };

        Object.keys(mapeo).forEach(key => {
            const element = document.getElementById(mapeo[key].toLowerCase().replace(/ /g, '_'));
            if (element) {
                element.textContent = data[key];
            } else {
                console.warn(`⚠️ No se encontró '${key}' en los datos recibidos.`);
            }
        });
    } catch (error) {
        console.error("⚠️ Error cargando estado del sistema:", error);
    }
}

async function actualizarDatos() {
    await cargarDatosSensores();
    await cargarEstadoSistema();
}

// Reemplazamos setInterval() por el Realtime Listener
import { getFirestore, collection, query, where, orderBy, limit, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const db = getFirestore();

function escucharDatosSensores() {
    const uid = sessionStorage.getItem("uid");  // Obtén el uid del usuario logueado
    if (!uid) {
        console.error("No hay usuario logueado");
        return;
    }

    const sensoresRef = collection(db, "sensores");
    const q = query(sensoresRef, where("usuario_id", "==", uid), orderBy("timestamp", "desc"), limit(1));

    // Escuchar los cambios en tiempo real
    onSnapshot(q, (querySnapshot) => {
        if (querySnapshot.empty) {
            console.log("No hay datos de sensores.");
            return;
        }

        // Obtener el primer documento (más reciente)
        const doc = querySnapshot.docs[0];
        const sensorData = doc.data();

        Object.keys(sensorData).forEach(sensor => {
            const element = document.getElementById(sensor);
            if (element) {
                element.textContent = `${sensorData[sensor]} ${sensor.includes('PS') ? 'bar' :
                    sensor.includes('EPS') ? 'W' :
                    sensor.includes('FS') ? 'l/min' :
                    sensor.includes('TS') ? '°C' :
                    sensor.includes('VS') ? 'mm/s' :
                    sensor.includes('CE') ? '%' :
                    sensor.includes('CP') ? 'kW' :
                    sensor.includes('SE') ? '%' : ''}`;
            }
        });
    });
}

function escucharEstadoSistema() {
    const uid = sessionStorage.getItem("uid");  // Obtén el uid del usuario logueado
    if (!uid) {
        console.error("No hay usuario logueado");
        return;
    }

    const condicionesRef = collection(db, "condiciones");
    const q = query(condicionesRef, where("usuario_id", "==", uid), orderBy("timestamp", "desc"), limit(1));

    // Escuchar los cambios en tiempo real
    onSnapshot(q, (querySnapshot) => {
        if (querySnapshot.empty) {
            console.log("No hay datos de condiciones.");
            return;
        }

        // Obtener el primer documento (más reciente)
        const doc = querySnapshot.docs[0];
        const condicionesData = doc.data();

        const estados = ["cooler_condition", "valve_condition", "pump_leakage", "accumulator_pressure", "stable"];
        estados.forEach(state => {
            const element = document.getElementById(state);
            if (element) {
                element.textContent = condicionesData[state];
            }
        });
    });
}

// Iniciar el listener cuando la página se carga
document.addEventListener('DOMContentLoaded', function () {
    escucharDatosSensores();
    escucharEstadoSistema();
});
