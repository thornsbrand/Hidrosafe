// Initialize Chart.js
const ctx = document.getElementById('metricsChart').getContext('2d');
const chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Pressure (PSI)',
            data: [],
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
        }, {
            label: 'Flow Rate (GPM)',
            data: [],
            borderColor: 'rgb(255, 99, 132)',
            tension: 0.1
        }, {
            label: 'Temperature (°C)',
            data: [],
            borderColor: 'rgb(153, 102, 255)',
            tension: 0.1
        }]
    },
    options: {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

// Simulate real-time data updates
function updateData() {
    const pressure = Math.random() * 100 + 50;
    const flowRate = Math.random() * 20 + 10;
    const temperature = Math.random() * 30 + 20;
    
    document.getElementById('current-pressure').textContent = pressure.toFixed(1);
    document.getElementById('current-flow').textContent = flowRate.toFixed(1);
    document.getElementById('current-temp').textContent = temperature.toFixed(1);
    
    const now = new Date().toLocaleTimeString();
    
    chart.data.labels.push(now);
    chart.data.datasets[0].data.push(pressure);
    chart.data.datasets[1].data.push(flowRate);
    chart.data.datasets[2].data.push(temperature);
    
    if (chart.data.labels.length > 20) {
        chart.data.labels.shift();
        chart.data.datasets.forEach(dataset => dataset.data.shift());
    }
    
    chart.update();
}

// Update every 2 seconds
setInterval(updateData, 2000);
updateData(); // Initial update
