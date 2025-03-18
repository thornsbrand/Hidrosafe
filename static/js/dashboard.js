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
        const response = await fetch('/api/history_data');
        const data = await response.json();
        
        if (data.length === 0) {
            console.log("⚠️ No se encontraron datos en el historial.");
            return;
        }
        
        // Llenar la tabla con los datos del historial
        const historyData = document.getElementById('historyData');
        historyData.innerHTML = ''; // Limpiar la tabla antes de agregar datos
        data.forEach((entry, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${entry.cooler_condition}</td>
                <td>${entry.valve_condition}</td>
                <td>${entry.pump_leakage}</td>
                <td>${entry.accumulator_pressure}</td>
                <td>${entry.stable}</td>
            `;
            historyData.appendChild(row);
        });

        // Crear gráfico
        const ctx = document.getElementById('chart_history').getContext('2d');
        const chartData = {
            labels: data.map(entry => new Date(entry.timestamp).toLocaleString()),
            datasets: [{
                label: 'Cooler Condition',
                data: data.map(entry => entry.cooler_condition),
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
                fill: false
            }, {
                label: 'Valve Condition',
                data: data.map(entry => entry.valve_condition),
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                fill: false
            }, {
                label: 'Pump Leakage',
                data: data.map(entry => entry.pump_leakage),
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                fill: false
            }]
        };

        const chartOptions = {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Fecha'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Valor'
                    }
                }
            }
        };

        const chart = new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: chartOptions
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
