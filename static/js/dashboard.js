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

        // Esperar a que el DOM esté completamente listo y el canvas visible
        setTimeout(() => {
            const ctxCooler = document.getElementById('chart_cooler_condition');
            console.log("ctxCooler: ", ctxCooler);  // Verifica si el canvas está siendo encontrado

            if (ctxCooler) {
                console.log("Generando gráfico de Cooler Condition...");

                // Generar el gráfico de Cooler Condition
                new Chart(ctxCooler, {
                    type: 'line',
                    data: {
                        labels: data.map(item => new Date(item.timestamp).getTime()),  // Convertir timestamp a milisegundos
                        datasets: [{
                            label: 'Cooler Condition',
                            data: data.map(item => item.cooler_condition),
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
                                    tooltipFormat: 'll HH:mm', // Formato del tooltip para fechas
                                },
                                title: {
                                    display: true,
                                    text: 'Timestamp'
                                }
                            },
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });
            } else {
                console.log("❌ No se encontró el canvas para el gráfico de Cooler Condition.");
            }
        }, 100); // Espera 100ms antes de ejecutar el gráfico para asegurarse de que el canvas tenga tamaño

    } catch (error) {
        console.error('Error cargando historial de datos:', error);
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

