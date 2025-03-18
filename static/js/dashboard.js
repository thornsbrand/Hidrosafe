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
                <td>${item.timestamp}</td>
                <td>${item.cooler_condition}</td>
                <td>${item.valve_condition}</td>
                <td>${item.pump_leakage}</td>
                <td>${item.accumulator_pressure}</td>
                <td>${item.stable}</td>
            `;
            tbody.appendChild(row);
        });

        // Generar los gráficos de las variables
        generarGrafico('chart_cooler_condition', data, 'Cooler Condition', item => item.cooler_condition);
        generarGrafico('chart_valve_condition', data, 'Valve Condition', item => item.valve_condition);
        generarGrafico('chart_pump_leakage', data, 'Pump Leakage', item => item.pump_leakage);
        generarGrafico('chart_accumulator_pressure', data, 'Accumulator Pressure', item => item.accumulator_pressure);
        generarGrafico('chart_stable_flag', data, 'Stable Flag', item => item.stable);

    } catch (error) {
        console.error('Error cargando historial de datos:', error);
    }
}

// Función genérica para generar gráficos
function generarGrafico(canvasId, data, label, getData) {
    const ctx = document.getElementById(canvasId);
    if (ctx) {
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(item => new Date(item.timestamp)),  // Usamos `new Date()` para convertir el timestamp a fecha
                datasets: [{
                    label: label,
                    data: data.map(getData),
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: false,
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        type: 'time',  // Usar escala de tiempo
                        time: {
                            unit: 'minute',  // Escala temporal por minuto
                            unitStepSize: 1,  // Opcional, ajusta el tamaño del paso de tiempo
                            tooltipFormat: 'll HH:mm', // Formato del tooltip para fechas
                        },
                        title: {
                            display: true,
                            text: 'Fecha y Hora'
                        }
                    },
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}


// Cargar historial cuando la página cargue
document.addEventListener('DOMContentLoaded', function () {
    cargarHistorial(); // Cargar historial al cargar la página
});


// Llamar a la función para cargar el historial al ingresar a la sección de Historial
function mostrarHistorial() {
    cargarHistorial();  // Cargar los datos del historial
    document.getElementById('realTimeSection').style.display = 'none';  // Ocultar la sección de Tiempo Real
    document.getElementById('historySection').style.display = 'block';  // Mostrar la sección de Historial
}

document.addEventListener('DOMContentLoaded', function () {
    // No es necesario llamar a cargarHistorial aquí si solo la mostramos cuando el usuario navega a la sección de Historial.
    console.log("Página cargada. Esperando la acción de mostrar historial...");
});

setInterval(actualizarDatos, 5000); // Actualiza los datos cada 5 segundos
actualizarDatos();  // Llamada inicial para cargar los datos en tiempo real

