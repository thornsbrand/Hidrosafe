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
        abort(403)  # Acceso restringido solo para admins
    
    users_ref = db.collection("usuarios").stream()
    users = [{**user.to_dict(), "uid": user.id} for user in users_ref]

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

@admin_bp.route('/reports')
@login_required
def reports():
    if current_user.rol != "admin":
        abort(403)  # 🔹 Acceso prohibido para usuarios normales
    return render_template('admin_reports.html')

@admin_bp.route('/alerts')
@login_required
def alerts():
    if current_user.rol != "admin":
        abort(403)  # 🔹 Acceso prohibido para usuarios normales
    return render_template('admin_alerts.html')

@admin_bp.route('/permissions')
@login_required
def permissions():
    if current_user.rol != "admin":
        abort(403)  # 🔹 Acceso prohibido para usuarios normales
    return render_template('admin_permissions.html')

@admin_bp.route('/manage_users/edit/<uid>', methods=['POST'])
@login_required
def edit_user(uid):
    if current_user.rol != "admin":
        abort(403)
    
    new_role = request.form.get("role")
    if new_role not in ["admin", "usuario"]:
        flash("Rol inválido.", "error")
        return redirect(url_for('admin.manage_users'))

    try:
        db.collection("usuarios").document(uid).update({"rol": new_role})
        flash("Rol actualizado con éxito.", "success")
    except Exception as e:
        flash(f"Error al actualizar el usuario: {str(e)}", "error")

    return redirect(url_for('admin.manage_users'))


@admin_bp.route('/manage_users/delete/<uid>', methods=['POST'])
@login_required
def delete_user(uid):
    if current_user.rol != "admin":
        abort(403)

    try:
        db.collection("usuarios").document(uid).delete()
        flash("Usuario eliminado con éxito.", "success")
    except Exception as e:
        flash(f"Error al eliminar el usuario: {str(e)}", "error")

    return redirect(url_for('admin.manage_users'))
