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

function cargarHistorial() {
    // Realiza la solicitud para obtener los datos del historial
    fetch('/api/history_data')
        .then(response => response.json())
        .then(data => {
            if (data.length === 0) {
                console.log("⚠️ No se encontraron datos en el historial.");
                return;
            }

            // Llenar la tabla de historial con los datos
            const tbody = document.getElementById('historyData');
            tbody.innerHTML = ''; // Limpiar tabla antes de agregar los nuevos datos
            data.forEach(item => {
                const localTimestamp = new Date(item.timestamp).toLocaleString();  // Convertir UTC a hora local
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${localTimestamp}</td>
                    <td>${item.cooler_condition || item.CE}</td>
                    <td>${item.valve_condition || item.VS1}</td>
                    <td>${item.pump_leakage || item.PS1}</td>
                    <td>${item.accumulator_pressure || item.EPS1}</td>
                    <td>${item.stable || item.SE}</td>
                `;
                tbody.appendChild(row);
            });

            // Generar los gráficos de las variables
            generarGrafico('chart_cooler_condition', data, 'Cooler Condition', item => item.cooler_condition || item.CE);
            generarGrafico('chart_valve_condition', data, 'Valve Condition', item => item.valve_condition || item.VS1);
            generarGrafico('chart_pump_leakage', data, 'Pump Leakage', item => item.pump_leakage || item.PS1);
            generarGrafico('chart_accumulator_pressure', data, 'Accumulator Pressure', item => item.accumulator_pressure || item.EPS1);
            generarGrafico('chart_stable_flag', data, 'Stable Flag', item => item.stable || item.SE);
        })
        .catch(error => {
            console.error('Error al cargar historial:', error);
        });
}


// Función genérica para generar gráficos
function generarGrafico(canvasId, data, label, getData) {
    const ctx = document.getElementById(canvasId);
    if (ctx) {
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(item => new Date(item.timestamp).toLocaleString()),  // Convertir el timestamp a fecha local
                datasets: [{
                    label: label,
                    data: data.map(getData),
                    borderColor: '#4bc0c0',  // Color de la línea
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',  // Color de fondo de la línea
                    borderWidth: 2,  // Grosor de la línea
                    pointRadius: 6,  // Tamaño de los puntos
                    pointBackgroundColor: '#4bc0c0',  // Color de los puntos
                    fill: false,  // No llenar el área bajo la línea
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        type: 'category',  // Usar 'category' si el tipo de tiempo está causando problemas
                        title: {
                            display: true,
                            text: 'Fecha y Hora'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#666',  // Color de los ticks en el eje Y
                        },
                        title: {
                            display: true,
                            text: label,
                            color: '#666',  // Color del título del eje Y
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: '#333',  // Color de las etiquetas de la leyenda
                        }
                    }
                }
            }
        });
    }
}



// Actualizar los datos y los gráficos cada 5 segundos
document.addEventListener('DOMContentLoaded', function () {
    cargarHistorial();  // Cargar historial cuando la página cargue

    setInterval(function() {
        cargarHistorial();  // Vuelve a cargar el historial y actualiza los gráficos
    }, 5000);  // Cada 5 segundos
});
