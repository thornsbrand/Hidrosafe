import os
import json
import firebase_admin
from firebase_admin import credentials, auth, firestore
from flask import Flask, request, jsonify
from flask_login import LoginManager, UserMixin, login_manager, login_user, logout_user, current_user

# Cargar credenciales de Firebase desde la variable de entorno en Render
firebase_config = json.loads(os.getenv("FIREBASE_CREDENTIALS"))
cred = credentials.Certificate(firebase_config)
firebase_admin.initialize_app(cred)

# Instancia de Firestore
db = firestore.client()

# 🔹 Modelo de Usuario con rol
class User(UserMixin):
    def __init__(self, uid, email, rol):
        self.id = uid
        self.email = email
        self.rol = rol

@app.context_processor
def inject_user():
    return dict(current_user=current_user)

def create_app():
    app = Flask(__name__)
    app.secret_key = os.environ.get("FLASK_SECRET_KEY") or "hydrosafe_secret_key"

    # 🔹 Configurar Flask-Login
    login_manager = LoginManager()
    login_manager.init_app(app)
    login_manager.login_view = "auth.login"  # Redirigir a login si no está autenticado

    # 🔹 Función para cargar usuarios desde Firebase Authentication
    @login_manager.user_loader
    def load_user(user_id):
        try:
            user_record = auth.get_user(user_id)
            return User(user_record.uid, user_record.email)
        except Exception:
            return None

    # 🔹 Inyectar `current_user` en todas las plantillas
    @app.context_processor
    def inject_user():
        return dict(current_user=current_user)

    with app.app_context():
        # Importar y registrar blueprints
        from routes import main
        from auth import auth_bp

        app.register_blueprint(main)
        app.register_blueprint(auth_bp)

        return app

app = create_app()

# Ruta de prueba para verificar que Firebase está conectado
@app.route('/test_firebase')
def test_firebase():
    return jsonify({"message": "Firebase está funcionando correctamente"}), 200

if __name__ == '__main__':
    app.run(debug=True)
