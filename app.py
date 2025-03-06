import os
import json
import firebase_admin
from firebase_admin import credentials, auth, firestore
from flask import Flask, g
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

    # 🔹 Guardar Firestore en `app.config` para evitar la importación circular
    app.config["FIRESTORE_DB"] = firestore.client()

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
        db = app.config["FIRESTORE_DB"]  # 🔹 Acceder a Firestore desde app.config
        user_doc = db.collection("usuarios").document(user_id).get()
        if user_doc.exists:
            user_data = user_doc.to_dict()
            return User(user_id, user_data["email"], user_data.get("rol", "usuario"))
        return None

    # 🔹 Inyectar `current_user` en todas las plantillas
    @app.context_processor
    def inject_user():
        return dict(current_user=current_user)

    return app

# 🔹 Crear la aplicación después de definir `create_app`
app = create_app()

@app.route('/test_firebase')
def test_firebase():
    return {"message": "Firebase está funcionando correctamente"}

if __name__ == '__main__':
    app.run(debug=True)
