from flask import Blueprint, render_template, abort
from flask_login import login_required, current_user

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')

@admin_bp.route('/')
@login_required
def admin_panel():
    if current_user.rol != "admin":
        abort(403)  # 🔹 Acceso prohibido para usuarios normales
    return render_template('admin_panel.html')
