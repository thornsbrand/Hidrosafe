from flask import Blueprint, render_template, request, jsonify
from models import add_system_data, get_all_system_data
from firebase_admin import firestore, auth
from auth import auth_bp
from flask_login import login_required, current_user

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')

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

@admin_bp.route('/')
@login_required
def admin_panel():
    if current_user.rol != "admin":
        abort(403)
    return render_template('admin_panel.html')

@admin_bp.route('/manage_users')
@login_required
def manage_users():
    if current_user.rol != "admin":
        abort(403)
    users = db.collection("usuarios").get()
    return render_template('admin_manage_users.html', users=users)

@admin_bp.route('/settings')
@login_required
def settings():
    if current_user.rol != "admin":
        abort(403)
    return render_template('admin_settings.html')

@admin_bp.route('/maintenances')
@login_required
def maintenances():
    if current_user.rol != "admin":
        abort(403)
    return render_template('admin_maintenances.html')

@admin_bp.route('/reports')
@login_required
def reports():
    if current_user.rol != "admin":
        abort(403)
    return render_template('admin_reports.html')

@admin_bp.route('/alerts')
@login_required
def alerts():
    if current_user.rol != "admin":
        abort(403)
    return render_template('admin_alerts.html')

@admin_bp.route('/permissions')
@login_required
def permissions():
    if current_user.rol != "admin":
        abort(403)
    return render_template('admin_permissions.html')