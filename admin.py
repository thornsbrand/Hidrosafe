from flask import Blueprint, render_template, abort
from flask_login import login_required, current_user
from firebase_admin import firestore

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')
db = firestore.client()

@admin_bp.route('/')
@login_required
def admin_panel():
    if current_user.rol != "admin":
        abort(403)  # 🔹 Acceso prohibido para usuarios normales
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
        abort(403)  # 🔹 Acceso prohibido para usuarios normales
    return render_template('admin_maintenances.html')
