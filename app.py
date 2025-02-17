import os
import json
import firebase_admin
from firebase_admin import credentials, auth, firestore
from flask import Flask, request, jsonify
from flask_login import LoginManager, UserMixin, login_user, logout_user, current_user

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

def create_app():
    app = Flask(__name__)
    app.secret_key = os.environ.get("FLASK_SECRET_KEY") or "hydrosafe_secret_key"

    # 🔹 Configurar Flask-Login
    login_manager = LoginManager()
    login_manager.init_app(app)
    login_manager.login_view = "auth.login"  # Redirigir a login si no está autenticado

    # 🔹 Importar blueprints dentro de la función para evitar errores
    from routes import main
    from auth import auth_bp
    from admin import admin_bp 

    app.register_blueprint(main)
    app.register_blueprint(auth_bp)
    app.register_blueprint(admin_bp)  # 🔹 Registrar blueprint del admin

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

    return app  # 🔹 Retornar la app correctamente

# 🔹 Crear la aplicación después de definir `create_app`
app = create_app()

# Ruta de prueba para verificar que Firebase está conectado
@app.route('/test_firebase')
def test_firebase():
    return jsonify({"message": "Firebase está funcionando correctamente"}), 200

if __name__ == '__main__':
    app.run(debug=True)
