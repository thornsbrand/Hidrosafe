from flask import Blueprint, render_template, request, redirect, url_for, flash, abort
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

@admin_bp.route('/alerts', methods=['GET', 'POST'])
@login_required
def alerts():
    if current_user.rol != "admin":
        abort(403)

    # Obtener alertas
    alerts_ref = db.collection("notificaciones").stream()
    alerts = [{**alert.to_dict(), "id": alert.id} for alert in alerts_ref]

    # Obtener usuarios para enviar alertas
    users_ref = db.collection("usuarios").stream()
    users = [{**user.to_dict(), "uid": user.id} for user in users_ref]

    return render_template('admin_alerts.html', alerts=alerts, users=users)


@admin_bp.route('/alerts/create', methods=['POST'])
@login_required
def create_alert():
    if current_user.rol != "admin":
        abort(403)

    message = request.form.get("message")
    alert_type = request.form.get("alert_type")
    user_ids = request.form.getlist("users")

    if not message or not alert_type or not user_ids:
        flash("Todos los campos son obligatorios.", "error")
        return redirect(url_for('admin.alerts'))

    for user_id in user_ids:
        db.collection("notificaciones").add({
            "usuario_id": user_id,
            "mensaje": message,
            "tipo": alert_type,
            "fecha": firestore.SERVER_TIMESTAMP
        })

    flash("Alerta creada con éxito.", "success")
    return redirect(url_for('admin.alerts'))


@admin_bp.route('/alerts/edit/<alert_id>', methods=['POST'])
@login_required
def edit_alert(alert_id):
    if current_user.rol != "admin":
        abort(403)

    message = request.form.get("message")
    alert_type = request.form.get("alert_type")

    try:
        db.collection("notificaciones").document(alert_id).update({
            "mensaje": message,
            "tipo": alert_type
        })
        flash("Alerta actualizada con éxito.", "success")
    except Exception as e:
        flash(f"Error al actualizar la alerta: {str(e)}", "error")

    return redirect(url_for('admin.alerts'))


@admin_bp.route('/alerts/delete/<alert_id>', methods=['POST'])
@login_required
def delete_alert(alert_id):
    if current_user.rol != "admin":
        abort(403)

    try:
        db.collection("notificaciones").document(alert_id).delete()
        flash("Alerta eliminada con éxito.", "success")
    except Exception as e:
        flash(f"Error al eliminar la alerta: {str(e)}", "error")

    return redirect(url_for('admin.alerts'))
