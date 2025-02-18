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
        })
        .catch(error => console.error('Error cargando historial de datos:', error));
}
