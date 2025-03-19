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
        // Crear el gráfico y almacenarlo en el objeto global
        charts[canvasId] = new Chart(ctx, {
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

    // Ajustar las fechas para incluir todo el día de la fecha seleccionada
    const adjustedStartDate = new Date(startDate);
    adjustedStartDate.setHours(0, 0, 0, 0);  // Configura la hora de inicio a las 00:00:00

    const adjustedEndDate = new Date(endDate);
    adjustedEndDate.setHours(23, 59, 59, 999);  // Configura la hora de finalización a las 23:59:59

    // Convertir las fechas ajustadas a formato ISO, pero solo con la fecha sin zona horaria
    const startDateISO = adjustedStartDate.toISOString().split('T')[0];  // Solo fecha (YYYY-MM-DD)
    const endDateISO = adjustedEndDate.toISOString().split('T')[0];  // Solo fecha (YYYY-MM-DD)

    // Cargar el historial con las fechas ajustadas
    cargarHistorialConFiltro(startDateISO, endDateISO);
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