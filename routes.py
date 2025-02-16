from flask import Blueprint, render_template, request, jsonify
from models import add_system_data, get_all_system_data
from firebase_admin import firestore, auth

# Inicializar Firestore
db = firestore.client()

# Blueprint principal
main = Blueprint('main', __name__)

# Rutas principales
@main.route('/')
def index():
    return render_template('home.html')

@main.route('/dashboard')
def dashboard():
    recent_data = get_all_system_data()
    return render_template('dashboard.html', data=recent_data)

@main.route('/documentation')
def documentation():
    return render_template('documentation.html')

@auth_bp.route('/login', methods=['GET'])
def login():
    return render_template('auth/login.html')

@auth_bp.route('/login', methods=['POST'])
def login_post():
    email = request.form.get("email")
    password = request.form.get("password")

    if not email or not password:
        flash("Todos los campos son obligatorios.", "error")
        return redirect(url_for('auth.login'))

    try:
        # Aquí Firebase normalmente maneja login desde el frontend,
        # pero en Flask podemos solo verificar si el usuario existe.
        user = auth.get_user_by_email(email)
        flash("Inicio de sesión exitoso.", "success")
        return redirect(url_for('main.dashboard'))  # Redirigir al Dashboard después del login
    except Exception as e:
        flash("Credenciales incorrectas.", "error")
        return redirect(url_for('auth.login'))

# Mostrar el formulario de registro
@auth_bp.route('/register', methods=['GET'])
def register():
    return render_template('auth/register.html')

@main.route('/test_firestore')
def test_firestore():
    try:
        # Agregar un documento de prueba a Firestore
        test_data = {"mensaje": "Firestore conectado correctamente en Render"}
        doc_ref = db.collection("test").add(test_data)

        # Recuperar los documentos de la colección "test"
        docs = db.collection("test").stream()
        data = [{doc.id: doc.to_dict()} for doc in docs]

        return jsonify({"status": "success", "data": data}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
