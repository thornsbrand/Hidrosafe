from flask import Blueprint, render_template
from models import add_system_data, get_all_system_data

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


# Blueprint para autenticación
auth = Blueprint('auth', __name__, url_prefix='/auth')

# Rutas de autenticación
@auth.route('/login')
def login():
    return render_template('auth/login.html')

@auth.route('/register')
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
