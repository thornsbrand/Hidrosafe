import os
import firebase_admin
from firebase_admin import credentials, auth, firestore
from flask import Flask

def create_app():
    app = Flask(__name__)
    app.secret_key = os.environ.get("FLASK_SECRET_KEY") or "hydrosafe_secret_key"

    # 🔹 Inicializar Firebase solo si aún no está inicializado
    if not firebase_admin._apps:
        cred = credentials.Certificate("/etc/secrets/firebase_credentials.json")
        firebase_admin.initialize_app(cred)

    # 🔹 Guardar Firestore en `app.config` para evitar la importación circular
    app.config["FIRESTORE_DB"] = firestore.client()

    # 🔹 Importar blueprints dentro de la función para evitar errores de importación circular
    from routes import main
    from auth import auth_bp
    from admin import admin_bp 

    app.register_blueprint(main)
    app.register_blueprint(auth_bp, url_prefix="/auth")  # 🔹 Asegurar el prefijo correcto
    app.register_blueprint(admin_bp, url_prefix="/admin")

    return app

# 🔹 Crear la aplicación después de definir `create_app`
app = create_app()

@app.route('/test_firebase')
def test_firebase():
    return {"message": "Firebase está funcionando correctamente"}

if __name__ == '__main__':
    app.run(debug=True)
