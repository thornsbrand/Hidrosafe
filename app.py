import os
import json
import firebase_admin
from firebase_admin import credentials, auth, firestore
from flask import Flask, request, jsonify

# Cargar credenciales de Firebase desde la variable de entorno en Render
firebase_config = json.loads(os.getenv("FIREBASE_CREDENTIALS"))
cred = credentials.Certificate(firebase_config)
firebase_admin.initialize_app(cred)

# Instancia de Firestore
db = firestore.client()

def create_app():
    app = Flask(__name__)
    app.secret_key = os.environ.get("FLASK_SECRET_KEY") or "hydrosafe_secret_key"

    with app.app_context():
        # Importar y registrar blueprints
        from routes import main, auth
        app.register_blueprint(main)
        app.register_blueprint(auth)

        return app

app = create_app()

# Ruta de prueba para verificar que Firebase está conectado
@app.route('/test_firebase')
def test_firebase():
    return jsonify({"message": "Firebase está funcionando correctamente"}), 200

if __name__ == '__main__':
    app.run(debug=True)
