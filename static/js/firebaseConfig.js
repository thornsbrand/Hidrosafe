fetch('/get-firebase-config')
    .then(response => response.json())
    .then(config => {
        firebase.initializeApp(config);
    })
    .catch(error => console.error("Error al cargar configuración de Firebase:", error));
