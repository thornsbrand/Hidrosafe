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

        // Gráfico: Cooler Condition
        const ctxCooler = document.getElementById('chart_cooler_condition').getContext('2d');
        const chartDataCooler = {
            labels: data.map(entry => new Date(entry.timestamp).toLocaleString()),
            datasets: [{
                label: 'Cooler Condition',
                data: data.map(entry => entry.cooler_condition),
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
                fill: false
            }]
        };
        new Chart(ctxCooler, {
            type: 'line',
            data: chartDataCooler,
            options: {
                responsive: true,
                scales: {
                    x: { title: { display: true, text: 'Fecha' } },
                    y: { title: { display: true, text: 'Valor' } }
                }
            }
        });

        // Gráfico: Valve Condition
        const ctxValve = document.getElementById('chart_valve_condition').getContext('2d');
        const chartDataValve = {
            labels: data.map(entry => new Date(entry.timestamp).toLocaleString()),
            datasets: [{
                label: 'Valve Condition',
                data: data.map(entry => entry.valve_condition),
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                fill: false
            }]
        };
        new Chart(ctxValve, {
            type: 'line',
            data: chartDataValve,
            options: {
                responsive: true,
                scales: {
                    x: { title: { display: true, text: 'Fecha' } },
                    y: { title: { display: true, text: 'Valor' } }
                }
            }
        });

        // Gráfico: Pump Leakage
        const ctxLeakage = document.getElementById('chart_pump_leakage').getContext('2d');
        const chartDataLeakage = {
            labels: data.map(entry => new Date(entry.timestamp).toLocaleString()),
            datasets: [{
                label: 'Pump Leakage',
                data: data.map(entry => entry.pump_leakage),
                borderColor: 'rgba(255, 159, 64, 1)',
                borderWidth: 1,
                fill: false
            }]
        };
        new Chart(ctxLeakage, {
            type: 'line',
            data: chartDataLeakage,
            options: {
                responsive: true,
                scales: {
                    x: { title: { display: true, text: 'Fecha' } },
                    y: { title: { display: true, text: 'Valor' } }
                }
            }
        });

        // Gráfico: Accumulator Pressure
        const ctxAccumulator = document.getElementById('chart_accumulator_pressure').getContext('2d');
        const chartDataAccumulator = {
            labels: data.map(entry => new Date(entry.timestamp).toLocaleString()),
            datasets: [{
                label: 'Accumulator Pressure',
                data: data.map(entry => entry.accumulator_pressure),
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                fill: false
            }]
        };
        new Chart(ctxAccumulator, {
            type: 'line',
            data: chartDataAccumulator,
            options: {
                responsive: true,
                scales: {
                    x: { title: { display: true, text: 'Fecha' } },
                    y: { title: { display: true, text: 'Valor' } }
                }
            }
        });

        // Gráfico: Stable Flag
        const ctxStable = document.getElementById('chart_stable_flag').getContext('2d');
        const chartDataStable = {
            labels: data.map(entry => new Date(entry.timestamp).toLocaleString()),
            datasets: [{
                label: 'Stable Flag',
                data: data.map(entry => entry.stable ? 1 : 0),  // 1 si stable, 0 si no
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1,
                fill: false
            }]
        };
        new Chart(ctxStable, {
            type: 'line',
            data: chartDataStable,
            options: {
                responsive: true,
                scales: {
                    x: { title: { display: true, text: 'Fecha' } },
                    y: { title: { display: true, text: 'Valor' } }
                }
            }
        });

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
