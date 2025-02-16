from flask import Blueprint, render_template, request, jsonify
from models import add_system_data, get_all_system_data
from firebase_admin import firestore, auth
from auth import auth_bp  # Asegura que esta línea está presente

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