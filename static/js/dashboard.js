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

function showSection(sectionId) {
    document.getElementById("realTimeSection").style.display = (sectionId === 'realTime') ? 'block' : 'none';
    document.getElementById("historySection").style.display = (sectionId === 'history') ? 'block' : 'none';
}

// Función para cargar y actualizar los datos filtrados por fechas
async function cargarHistorialConFiltro(startDate, endDate) {
    try {
        const response = await fetch(`/api/history_data?startDate=${startDate}&endDate=${endDate}`);
        
        // Verificar si la respuesta es válida (si el servidor devuelve un 404 o error)
        if (!response.ok) {
            // Si no es OK (404, 500, etc.), mostrar un mensaje específico
            throw new Error(`Error ${response.status}: No se encontraron datos para las fechas seleccionadas.`);
        }

        const data = await response.json();

        // Verificar que los datos sean un array antes de intentar procesarlos
        if (!Array.isArray(data)) {
            throw new Error("Error: Los datos recibidos no son un arreglo.");
        }

        if (data.length === 0) {
            console.log("⚠️ No se encontraron datos en el historial para el rango seleccionado.");
            return;
        }

        // Limpiar la tabla y los gráficos
        const tbody = document.getElementById('historyData');
        tbody.innerHTML = '';  // Limpiar tabla

        // Llenar la tabla de historial con los datos filtrados
        data.forEach(item => {
            const localTimestamp = new Date(item.timestamp).toLocaleString();  // Convertir UTC a hora local
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${localTimestamp}</td>
                <td>${item.cooler_condition}</td>
                <td>${item.valve_condition}</td>
                <td>${item.pump_leakage}</td>
                <td>${item.accumulator_pressure}</td>
                <td>${item.stable}</td>
            `;
            tbody.appendChild(row);
        });

        // Generar los gráficos de las variables filtradas
        generarGrafico('chart_cooler_condition', data, 'Cooler Condition', item => item.cooler_condition);
        generarGrafico('chart_valve_condition', data, 'Valve Condition', item => item.valve_condition);
        generarGrafico('chart_pump_leakage', data, 'Pump Leakage', item => item.pump_leakage);
        generarGrafico('chart_accumulator_pressure', data, 'Accumulator Pressure', item => item.accumulator_pressure);
        generarGrafico('chart_stable_flag', data, 'Stable Flag', item => item.stable);

    } catch (error) {
        console.error('Error cargando historial filtrado:', error);
        alert("Hubo un problema al cargar los datos. Asegúrate de que el rango de fechas sea válido y que haya datos disponibles.");
    }
}

// Objeto global para almacenar los gráficos
const charts = {};

// Función para generar un gráfico y destruir el anterior si existe
function generarGrafico(canvasId, data, label, getData) {
    const ctx = document.getElementById(canvasId);

    // Si ya existe un gráfico en ese canvas, destruirlo antes de crear uno nuevo
    if (ctx && charts[canvasId]) {
        charts[canvasId].destroy();  // Destruir el gráfico anterior
    }

    // Crear el gráfico nuevo
    if (ctx) {
        charts[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(item => new Date(item.timestamp).toLocaleString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                })),  // Convertir a formato corto
                datasets: [{
                    label: label,
                    data: data.map(getData),
                    borderColor: '#4bc0c0',  
                    backgroundColor: 'rgba(75, 192, 192, 0.2)', 
                    borderWidth: 2,  
                    pointRadius: 6,  
                    pointBackgroundColor: '#4bc0c0',
                    fill: false,  
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        type: 'category',  
                        title: {
                            display: true,
                            text: 'Fecha y Hora'
                        },
                        ticks: {
                            maxRotation: 45,  // Rotar las etiquetas a 45 grados
                            minRotation: 45   // Rotar las etiquetas a 45 grados
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#666',  
                        },
                        title: {
                            display: true,
                            text: label,
                            color: '#666',
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false,  // Desactivar la leyenda
                    }
                }
            }
        });
    }
}


function aplicarFiltro() {
    let startDate = document.getElementById('startDate').value;
    let endDate = document.getElementById('endDate').value;

    // Si no se seleccionan fechas, establecer valores predeterminados (últimos 15 días)
    if (!startDate || !endDate) {
        const today = new Date();
        const fifteenDaysAgo = new Date();
        fifteenDaysAgo.setDate(today.getDate() - 15);

        startDate = fifteenDaysAgo.toISOString().split('T')[0];  // Convertir a formato YYYY-MM-DD
        endDate = today.toISOString().split('T')[0];  // Fecha actual
    }

    // Cargar el historial con las fechas seleccionadas (o las predeterminadas)
    cargarHistorialConFiltro(startDate, endDate);
}

// Llamar a la función para cargar el historial al ingresar a la sección de Historial
function mostrarHistorial() {
    cargarHistorial();  // Cargar los datos del historial
    document.getElementById('realTimeSection').style.display = 'none';  // Ocultar la sección de Tiempo Real
    document.getElementById('historySection').style.display = 'block';  // Mostrar la sección de Historial
}

// Al cargar la página, configurar fechas predeterminadas si no se seleccionan
document.addEventListener('DOMContentLoaded', function () {
    // Establecer fechas predeterminadas si no se seleccionan
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    // Si no se seleccionan fechas, usar las fechas predeterminadas (últimos 15 días)
    if (!startDate || !endDate) {
        const today = new Date();
        const fifteenDaysAgo = new Date();
        fifteenDaysAgo.setDate(today.getDate() - 15);

        const defaultStartDate = fifteenDaysAgo.toISOString().split('T')[0];  
        const defaultEndDate = today.toISOString().split('T')[0];  

        document.getElementById('startDate').value = defaultStartDate;
        document.getElementById('endDate').value = defaultEndDate;

        cargarHistorialConFiltro(defaultStartDate, defaultEndDate);  // Llamar a cargarHistorial con las fechas predeterminadas
    } else {
        cargarHistorialConFiltro(startDate, endDate);
    }

    console.log("Página cargada. Esperando la acción de mostrar historial...");
});

setInterval(actualizarDatos, 5000); // Actualiza los datos cada 5 segundos
actualizarDatos();  // Llamada inicial para cargar los datos en tiempo real