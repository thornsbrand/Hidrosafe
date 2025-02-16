from flask import Blueprint, render_template, request, jsonify
from models import add_system_data, get_all_system_data
from firebase_admin import firestore, auth
from auth import auth_bp
from flask_login import login_required, current_user

# Inicializar Firestore
db = firestore.client()

# Blueprint principal
main = Blueprint('main', __name__)

# Rutas principales
@main.route('/')
def index():
    return render_template('home.html')

@main.route('/dashboard')
@login_required
def dashboard():
    return render_template('dashboard.html')

@main.route('/documentation')
def documentation():
    return render_template('documentation.html')

@main.route('/profile')
@login_required
def profile():
    return render_template('profile.html', user=current_user)

@main.route('/notifications')
@login_required
def notifications():
    return render_template('notifications.html', user=current_user)