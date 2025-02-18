document.addEventListener("DOMContentLoaded", function () {
    function fetchSensorData() {
        fetch("/api/sensors")
            .then(response => response.json())
            .then(data => {
                Object.keys(data).forEach(sensor => {
                    const element = document.getElementById(sensor);
                    if (element) {
                        element.textContent = `${data[sensor]} ${getUnit(sensor)}`;
                    }
                });
            })
            .catch(error => console.error("Error al obtener datos de sensores:", error));
    }

    function fetchSystemStatus() {
        fetch("/api/system_status")
            .then(response => response.json())
            .then(data => {
                Object.keys(data).forEach(status => {
                    const element = document.getElementById(status.replace(" ", "_").toLowerCase());
                    if (element) {
                        element.textContent = formatStatusValue(status, data[status]);
                    }
                });
            })
            .catch(error => console.error("Error al obtener estado del sistema:", error));
    }

    function getUnit(sensor) {
        const units = {
            "PS1": "bar", "PS2": "bar", "PS3": "bar", "PS4": "bar", "PS5": "bar", "PS6": "bar",
            "EPS1": "W", "FS1": "l/min", "FS2": "l/min", "TS1": "°C", "TS2": "°C", "TS3": "°C", "TS4": "°C",
            "VS1": "mm/s", "CE": "%", "CP": "kW", "SE": "%"
        };
        return units[sensor] || "";
    }

    function formatStatusValue(status, value) {
        const mappings = {
            "Cooler": { 3: "Cerca de falla total", 20: "Eficiencia reducida", 100: "Eficiencia total" },
            "Valve": { 100: "Óptimo", 90: "Retraso pequeño", 80: "Retraso severo", 73: "Cerca de falla total" },
            "Pump Leakage": { 0: "Sin fugas", 1: "Fuga leve", 2: "Fuga severa" },
            "Accumulator Pressure": { 130: "Óptimo", 115: "Leve reducción", 100: "Reducción severa", 90: "Cerca de falla" },
            "Stability": { 0: "Estable", 1: "Condiciones inestables" }
        };
        return mappings[status] ? mappings[status][value] || "Desconocido" : value;
    }

    setInterval(fetchSensorData, 5000); // Actualiza sensores cada 5s
    setInterval(fetchSystemStatus, 10000); // Actualiza estado cada 10s
    fetchSensorData();
    fetchSystemStatus();
});
