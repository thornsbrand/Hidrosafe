from flask import Blueprint, render_template, redirect, url_for, abort, current_app, session, flash, request
import firebase_admin
from firebase_admin import firestore

# 🔹 Verificar si Firebase ya está inicializado
if not firebase_admin._apps:
    firebase_admin.initialize_app()

db = firestore.client()  # 🔹 Inicializar Firestore sin JSON

requests_bp = Blueprint("requests", __name__)
admin_bp = Blueprint('admin', __name__, url_prefix='/admin')
main = Blueprint('main', __name__)

# 🔹 Decorador para verificar autenticación basada en sesión
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "user" not in session:
            flash("Debes iniciar sesión para acceder a esta página.", "warning")
            return redirect(url_for("auth.login"))
        return f(*args, **kwargs)
    return decorated_function

# 🔹 Rutas principales
@main.route('/')
def index():
    return render_template('home.html')

@main.route('/dashboard')
@login_required
def dashboard():
    return render_template('dashboard.html', user=session.get("user"))

@main.route('/documentation')
def documentation():
    return render_template('documentation.html')

@main.route('/profile')
@login_required
def profile():
    return render_template('profile.html', user=session.get("user"))

@main.route('/notifications')
@login_required
def notifications():
    return render_template('notifications.html', user=session.get("user"))

# 🔹 Rutas de administración protegidas
@admin_bp.route('/')
@login_required
def admin_panel():
    user = session.get("user")
    if not user or user.get("rol") != "admin":
        abort(403)
    return render_template('admin_panel.html')

@admin_bp.route('/manage_users')
@login_required
def manage_users():
    user = session.get("user")
    if not user or user.get("rol") != "admin":
        abort(403)
    users = db.collection("usuarios").stream()
    users_list = [{**user.to_dict(), "id": user.id} for user in users]
    return render_template('admin_manage_users.html', users=users_list)

@admin_bp.route('/settings')
@login_required
def settings():
    user = session.get("user")
    if not user or user.get("rol") != "admin":
        abort(403)
    return render_template('admin_settings.html')

@admin_bp.route('/maintenances')
@login_required
def maintenances():
    user = session.get("user")
    if not user or user.get("rol") != "admin":
        abort(403)
    return render_template('admin_maintenances.html')

@admin_bp.route('/reports')
@login_required
def reports():
    user = session.get("user")
    if not user or user.get("rol") != "admin":
        abort(403)
    return render_template('admin_reports.html')

@admin_bp.route('/alerts')
@login_required
def alerts():
    user = session.get("user")
    if not user or user.get("rol") != "admin":
        abort(403)
    return render_template('admin_alerts.html')

@admin_bp.route('/permissions')
@login_required
def permissions():
    user = session.get("user")
    if not user or user.get("rol") != "admin":
        abort(403)
    return render_template('admin_permissions.html')

# 🔹 Enviar solicitudes de usuario
@requests_bp.route("/requests", methods=["GET", "POST"])
@login_required
def user_requests():
    user = session.get("user")
    if not user:
        flash("Debes iniciar sesión para enviar una solicitud.", "danger")
        return redirect(url_for("auth.login"))

    if request.method == "POST":
        descripcion = request.form.get("descripcion")
        if not descripcion:
            flash("La descripción no puede estar vacía.", "danger")
            return redirect(url_for("requests.user_requests"))

        solicitud = {
            "usuario": user["email"],
            "descripcion": descripcion,
            "estado": "pendiente",
            "respuesta": "",
            "fecha": datetime.datetime.utcnow()
        }
        db.collection("solicitudes").add(solicitud)
        flash("Solicitud enviada con éxito.", "success")
        return redirect(url_for("requests.user_requests"))

    # Obtener solicitudes enviadas por el usuario actual
    user_requests = db.collection("solicitudes").where("usuario", "==", user["email"]).stream()
    solicitudes = [{**req.to_dict(), "id": req.id} for req in user_requests]

    return render_template("user_requests.html", solicitudes=solicitudes)
