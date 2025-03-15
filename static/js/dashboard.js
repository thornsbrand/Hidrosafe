document.addEventListener("DOMContentLoaded", function () {
    loadRealTimeData(); // Cargar datos en tiempo real al inicio
});

function showSection(section) {
    if (section === 'realTime') {
        document.getElementById('realTimeSection').style.display = 'block';
        document.getElementById('historySection').style.display = 'none';
        loadRealTimeData();
    } else {
        document.getElementById('realTimeSection').style.display = 'none';
        document.getElementById('historySection').style.display = 'block';
        loadHistoryData();
    }
}

function loadRealTimeData() {
    fetch('/api/sensor_data')
        .then(response => response.json())
        .then(data => {
            const sensorContainer = document.getElementById('sensorData');
            sensorContainer.innerHTML = '';
            Object.entries(data.sensors).forEach(([key, value]) => {
                sensorContainer.innerHTML += `<div class="col-md-4">
                    <div class="card text-white bg-dark mb-3">
                        <div class="card-header">${key}</div>
                        <div class="card-body">
                            <h5 class="card-title">${value} ${data.units[key] || ''}</h5>
                        </div>
                    </div>
                </div>`;
            });
            
            const systemStatus = document.getElementById('systemStatus');
            systemStatus.innerHTML = `<ul>
                <li><strong>Cooler Condition:</strong> ${data.system.cooler}%</li>
                <li><strong>Valve Condition:</strong> ${data.system.valve}%</li>
                <li><strong>Pump Leakage:</strong> ${data.system.pump_leakage}</li>
                <li><strong>Accumulator Pressure:</strong> ${data.system.accumulator} bar</li>
                <li><strong>Stable:</strong> ${data.system.stable ? 'Sí' : 'No'}</li>
            </ul>`;
        })
        .catch(error => console.error('Error cargando datos en tiempo real:', error));
}

function loadHistoryData() {
    fetch('/api/history_data')
        .then(response => response.json())
        .then(data => {
            const historyTable = document.getElementById('historyData');
            historyTable.innerHTML = '';
            data.forEach(entry => {
                historyTable.innerHTML += `<tr>
                    <td>${entry.cycle}</td>
                    <td>${entry.cooler}</td>
                    <td>${entry.valve}</td>
                    <td>${entry.pump_leakage}</td>
                    <td>${entry.accumulator}</td>
                    <td>${entry.stable ? 'Sí' : 'No'}</td>
                </tr>`;
            });
            generateCharts(data);
        })
        .catch(error => console.error('Error cargando historial de datos:', error));
}

function generateCharts(data) {
    const variables = ["cooler", "valve", "pump_leakage", "accumulator", "stable"];
    variables.forEach(variable => {
        const ctx = document.getElementById(`chart_${variable}`).getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(entry => entry.cycle),
                datasets: [{
                    label: variable.replace('_', ' ').toUpperCase(),
                    data: data.map(entry => entry[variable]),
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: true
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: { title: { display: true, text: 'Ciclo' } },
                    y: { title: { display: true, text: variable.replace('_', ' ') } }
                }
            }
        });
    });
}

async function cargarDatosSensores() {
    try {
        const response = await fetch("/api/sensor_data");  // 🔹 Llama a la API de Flask
        const data = await response.json();

        if (data.error) {
            console.error("Error al obtener datos:", data.error);
            return;
        }

        // 🔹 Actualizar cada sensor en el Dashboard
        document.getElementById("PS1").innerText = data.PS1 + " bar";
        document.getElementById("PS2").innerText = data.PS2 + " bar";
        document.getElementById("PS3").innerText = data.PS3 + " bar";
        document.getElementById("PS4").innerText = data.PS4 + " bar";
        document.getElementById("PS5").innerText = data.PS5 + " bar";
        document.getElementById("PS6").innerText = data.PS6 + " bar";
        document.getElementById("EPS1").innerText = data.EPS1 + " W";
        document.getElementById("FS1").innerText = data.FS1 + " L/min";
        document.getElementById("FS2").innerText = data.FS2 + " L/min";
        document.getElementById("TS1").innerText = data.TS1 + " °C";
        document.getElementById("TS2").innerText = data.TS2 + " °C";
        document.getElementById("TS3").innerText = data.TS3 + " °C";
        document.getElementById("TS4").innerText = data.TS4 + " °C";
        document.getElementById("VS1").innerText = data.VS1 + " mm/s";
        document.getElementById("CE").innerText = data.CE + " %";
        document.getElementById("CP").innerText = data.CP + " kW";
        document.getElementById("SE").innerText = data.SE + " %";

    } catch (error) {
        console.error("Error cargando datos en tiempo real:", error);
    }
}

async function cargarEstadoSistema() {
    try {
        const response = await fetch("/api/system_status");  // 🔹 Llama a la API de Flask
        const data = await response.json();

        if (data.error) {
            console.error("Error al obtener datos:", data.error);
            return;
        }

        // 🔹 Actualizar Estado del Sistema
        document.getElementById("cooler").innerText = data.cooler_condition + " %";
        document.getElementById("valve").innerText = data.valve_condition + " %";
        document.getElementById("pump_leakage").innerText = data.pump_leakage === 0 ? "No leakage" : (data.pump_leakage === 1 ? "Weak leakage" : "Severe leakage");
        document.getElementById("accumulator").innerText = data.accumulator_pressure + " bar";
        document.getElementById("stability").innerText = data.stable ? "Stable" : "Unstable";

    } catch (error) {
        console.error("Error cargando estado del sistema:", error);
    }
}

// 🔹 Ejecutar cada 5 segundos para actualizar los datos
setInterval(cargarDatosSensores, 5000);


// Ejecutar la función al cargar el dashboard
window.onload = cargarDatos;
