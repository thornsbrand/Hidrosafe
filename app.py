import os
import json
import firebase_admin
from firebase_admin import credentials, auth, firestore
from flask import Flask, request, jsonify
from flask_login import LoginManager, UserMixin, login_user, logout_user, current_user
from dotenv import load_dotenv

load_dotenv()  # Cargar variables de entorno desde .env

def create_app():
    app = Flask(__name__)
    app.secret_key = os.environ.get("FLASK_SECRET_KEY") or "hydrosafe_secret_key"
    
    # 🔹 Inicializar Firebase solo si aún no está inicializado
    if not firebase_admin._apps:
        cred = credentials.Certificate("/etc/secrets/firebase_credentials.json")
        firebase_admin.initialize_app(cred)
    
    # 🔹 Inicializar Firestore después de Firebase
    db = firestore.client()

    # 🔹 Modelo de Usuario con rol
    class User(UserMixin):
        def __init__(self, uid, email, rol):
            self.id = uid
            self.email = email
            self.rol = rol

    # 🔹 Configurar Flask-Login
    login_manager = LoginManager()
    login_manager.init_app(app)
    login_manager.login_view = "auth.login"
    login_manager.session_protection = "strong"

    # 🔹 Importar blueprints dentro de la función para evitar errores de importación circular
    from routes import main
    from auth import auth_bp
    from admin import admin_bp 

    app.register_blueprint(main)
    app.register_blueprint(auth_bp)
    app.register_blueprint(admin_bp)

    # 🔹 Cargar usuario desde Firestore en cada solicitud
    @login_manager.user_loader
    def load_user(user_id):
        user_doc = db.collection("usuarios").document(user_id).get()
        if user_doc.exists:
            user_data = user_doc.to_dict()
            return User(user_id, user_data["email"], user_data.get("rol", "usuario"))
        return None  # Si el usuario no existe, devolver None

    # 🔹 Inyectar `current_user` en todas las plantillas
    @app.context_processor
    def inject_user():
        return dict(current_user=current_user)

    return app

# 🔹 Crear la aplicación después de definir `create_app`
app = create_app()

# Ruta de prueba para verificar que Firebase está conectado
@app.route('/test_firebase')
def test_firebase():
    return jsonify({"message": "Firebase está funcionando correctamente"}), 200

@app.route('/get-firebase-config')
def get_firebase_config():
    return jsonify({
        "apiKey": os.getenv("FIREBASE_API_KEY"),
        "authDomain": os.getenv("FIREBASE_AUTH_DOMAIN"),
        "projectId": os.getenv("FIREBASE_PROJECT_ID"),
        "storageBucket": os.getenv("FIREBASE_STORAGE_BUCKET"),
        "messagingSenderId": os.getenv("FIREBASE_MESSAGING_SENDER_ID"),
        "appId": os.getenv("FIREBASE_APP_ID"),
        "measurementId": os.getenv("FIREBASE_MEASUREMENT_ID")
    })

if __name__ == '__main__':
    app.run(debug=True)
