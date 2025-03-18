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

async function cargarHistorial() {
    try {
        const response = await fetch('/api/history_data');
        const data = await response.json();

        if (data.length === 0) {
            console.log("⚠️ No se encontraron datos en el historial.");
            return;
        }

        // Llenar la tabla de historial con los datos
        const tbody = document.getElementById('historyData');
        tbody.innerHTML = ''; // Limpiar tabla antes de agregar los nuevos datos
        data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.cycle}</td>
                <td>${item.cooler_condition}</td>
                <td>${item.valve_condition}</td>
                <td>${item.pump_leakage}</td>
                <td>${item.accumulator_pressure}</td>
                <td>${item.stable}</td>
            `;
            tbody.appendChild(row);
        });

        // Gráfico de Cooler Condition
        const ctxCooler = document.getElementById('chart_cooler_condition');
        if (ctxCooler) {
            new Chart(ctxCooler.getContext('2d'), {
                type: 'line',  // Tipo de gráfico (puede ser 'line', 'bar', etc.)
                data: {
                    labels: data.map(item => item.timestamp),  // Utiliza los timestamps como etiquetas
                    datasets: [{
                        label: 'Cooler Condition',
                        data: data.map(item => item.cooler_condition),  // Extrae los datos de la condición del cooler
                        borderColor: 'rgba(75, 192, 192, 1)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        fill: false,
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        x: {
                            type: 'linear',  // O 'category' dependiendo del tipo de datos
                            position: 'bottom'
                        },
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }

        // Repite lo mismo para los otros gráficos (Valve Condition, Pump Leakage, etc.)
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
