async function cargarDatosSensores() {
    try {
        const response = await fetch('/api/sensor_data');
        const data = await response.json();
        console.log("📥 Datos recibidos de sensor_data:", data);

        if (!data) {
            console.error("❌ No se recibieron datos de sensor_data.");
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
        console.error("⚠️ Error cargando datos en tiempo real:", error);
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

function showSection(sectionId) {
    document.getElementById("realTimeSection").style.display = (sectionId === 'realTime') ? 'block' : 'none';
    document.getElementById("historySection").style.display = (sectionId === 'history') ? 'block' : 'none';
}

// Cargar los datos históricos para los gráficos
async function cargarHistorial() {
    try {
        const response = await fetch('/api/history_data');
        const data = await response.json();

        if (data.length === 0) {
            console.log("⚠️ No se encontraron datos en el historial.");
            return;
        }

        // Verifica que los canvas existan antes de crear los gráficos
        const ctxCooler = document.getElementById('chart_cooler_condition');
        if (ctxCooler) {
            new Chart(ctxCooler.getContext('2d'), { /* chart options */ });
        }

        const ctxValve = document.getElementById('chart_valve_condition');
        if (ctxValve) {
            new Chart(ctxValve.getContext('2d'), { /* chart options */ });
        }

        const ctxLeakage = document.getElementById('chart_pump_leakage');
        if (ctxLeakage) {
            new Chart(ctxLeakage.getContext('2d'), { /* chart options */ });
        }

        const ctxAccumulator = document.getElementById('chart_accumulator_pressure');
        if (ctxAccumulator) {
            new Chart(ctxAccumulator.getContext('2d'), { /* chart options */ });
        }

        const ctxStable = document.getElementById('chart_stable_flag');
        if (ctxStable) {
            new Chart(ctxStable.getContext('2d'), { /* chart options */ });
        }

    } catch (error) {
        console.error('Error cargando historial de datos:', error);
    }
}



// Llamar a la función para cargar el historial al ingresar a la sección de Historial
function mostrarHistorial() {
    cargarHistorial();  // Cargar los datos del historial
    document.getElementById('realTimeSection').style.display = 'none';  // Ocultar la sección de Tiempo Real
    document.getElementById('historySection').style.display = 'block';  // Mostrar la sección de Historial
}

document.addEventListener('DOMContentLoaded', function () {
    cargarHistorial(); // Cargar historial cuando la página cargue
});

setInterval(actualizarDatos, 5000);

actualizarDatos();
