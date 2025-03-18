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
        const historyData = await response.json();
        
        // Verificar si recibimos datos válidos
        if (historyData.length > 0) {
            console.log("📥 Datos recibidos de history_data:", historyData);

            // Insertar los datos en la tabla
            let historyTable = '';
            historyData.forEach(item => {
                historyTable += `
                    <tr>
                        <td>${item.cycle}</td>
                        <td>${item.cooler_condition}</td>
                        <td>${item.valve_condition}</td>
                        <td>${item.pump_leakage}</td>
                        <td>${item.accumulator_pressure}</td>
                        <td>${item.stable ? "Sí" : "No"}</td>
                    </tr>
                `;
            });
            document.getElementById('historyData').innerHTML = historyTable;

            // Preparar los datos para el gráfico
            const labels = historyData.map(item => `Ciclo ${item.cycle}`);
            const coolerCondition = historyData.map(item => item.cooler_condition);
            const valveCondition = historyData.map(item => item.valve_condition);
            const pumpLeakage = historyData.map(item => item.pump_leakage);
            const accumulatorPressure = historyData.map(item => item.accumulator_pressure);
            const stableFlag = historyData.map(item => item.stable ? 1 : 0);

            // Crear el gráfico de líneas con Chart.js
            const ctx = document.getElementById('chart_history').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Cooler Condition',
                            data: coolerCondition,
                            borderColor: 'rgba(0, 123, 255, 1)',
                            fill: false
                        },
                        {
                            label: 'Valve Condition',
                            data: valveCondition,
                            borderColor: 'rgba(255, 99, 132, 1)',
                            fill: false
                        },
                        {
                            label: 'Pump Leakage',
                            data: pumpLeakage,
                            borderColor: 'rgba(75, 192, 192, 1)',
                            fill: false
                        },
                        {
                            label: 'Accumulator Pressure',
                            data: accumulatorPressure,
                            borderColor: 'rgba(153, 102, 255, 1)',
                            fill: false
                        },
                        {
                            label: 'Stable Flag',
                            data: stableFlag,
                            borderColor: 'rgba(255, 159, 64, 1)',
                            fill: false
                        }
                    ]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });

        } else {
            console.log("⚠ No se encontraron datos para los últimos 15 días.");
        }

    } catch (error) {
        console.error("Error cargando historial de datos:", error);
    }
}

// Llamar a la función para cargar el historial al ingresar a la sección de Historial
function mostrarHistorial() {
    cargarHistorial();
    document.getElementById('realTimeSection').style.display = 'none';
    document.getElementById('historySection').style.display = 'block';
}

setInterval(actualizarDatos, 5000);

actualizarDatos();
