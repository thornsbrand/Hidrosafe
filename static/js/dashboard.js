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

// Llamar a la API para obtener los datos históricos
async function cargarHistorial() {
    try {
        // Obtener los datos históricos de la API
        const response = await fetch('/api/history_data');
        const data = await response.json();

        if (data.error) {
            console.error("No se encontraron datos en el historial");
            return;
        }

        // Crear gráficos usando Chart.js
        const labels = data.map(item => new Date(item.timestamp).toLocaleString());  // Extrae fechas de los datos
        const coolerData = data.map(item => item.cooler_condition);
        const valveData = data.map(item => item.valve_condition);
        const pumpLeakageData = data.map(item => item.pump_leakage);
        const accumulatorPressureData = data.map(item => item.accumulator_pressure);
        const stableData = data.map(item => item.stable ? 'Stable' : 'Unstable');

        // Configuración para cada gráfico
        new Chart(document.getElementById('chart_cooler_condition'), {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Cooler Condition',
                    data: coolerData,
                    fill: false,
                    borderColor: 'blue',
                    tension: 0.1
                }]
            }
        });

        new Chart(document.getElementById('chart_valve_condition'), {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Valve Condition',
                    data: valveData,
                    fill: false,
                    borderColor: 'green',
                    tension: 0.1
                }]
            }
        });

        new Chart(document.getElementById('chart_pump_leakage'), {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Pump Leakage',
                    data: pumpLeakageData,
                    fill: false,
                    borderColor: 'red',
                    tension: 0.1
                }]
            }
        });

        new Chart(document.getElementById('chart_accumulator_pressure'), {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Accumulator Pressure',
                    data: accumulatorPressureData,
                    fill: false,
                    borderColor: 'purple',
                    tension: 0.1
                }]
            }
        });

        new Chart(document.getElementById('chart_stable'), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Stability',
                    data: stableData.map(status => status === 'Stable' ? 1 : 0),
                    backgroundColor: stableData.map(status => status === 'Stable' ? 'green' : 'red')
                }]
            }
        });

    } catch (error) {
        console.error("Error cargando historial de datos:", error);
    }
}

cargarHistorial();


// Llamar a la función para cargar el historial al ingresar a la sección de Historial
function mostrarHistorial() {
    cargarHistorial();
    document.getElementById('realTimeSection').style.display = 'none';
    document.getElementById('historySection').style.display = 'block';
}

setInterval(actualizarDatos, 5000);

actualizarDatos();
