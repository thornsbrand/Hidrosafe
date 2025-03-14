import os
import firebase_admin
from firebase_admin import credentials, firestore
from flask import Flask, session

def create_app():
    app = Flask(__name__)
    app.secret_key = os.environ.get("FLASK_SECRET_KEY") or "hydrosafe_secret_key"

    # 🔹 Inicializar Firebase solo si aún no está inicializado
    if not firebase_admin._apps:
        cred = credentials.Certificate("/etc/secrets/firebase_credentials.json")
        firebase_admin.initialize_app(cred)

    # 🔹 Guardar Firestore en `app.config`
    app.config["FIRESTORE_DB"] = firestore.client()

    # 🔹 Importar blueprints dentro de la función para evitar errores de importación circular
    from routes import main
    from auth import auth_bp
    from admin import admin_bp 

    app.register_blueprint(main)
    app.register_blueprint(auth_bp, url_prefix="/auth")  # Prefijo para autenticación
    app.register_blueprint(admin_bp, url_prefix="/admin")

    # 🔹 Inyectar `current_user` en todas las plantillas para manejar autenticación
    @app.context_processor
    def inject_user():
        return dict(current_user=session.get("user", None))

    return app

# 🔹 Crear la aplicación correctamente
app = create_app()

@app.route('/test_firebase')
def test_firebase():
    return {"message": "Firebase está funcionando correctamente"}

if __name__ == '__main__':
    app.run(debug=True)