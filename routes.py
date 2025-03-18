from functools import wraps  # 🔹 IMPORTANTE: Añade esta línea
from flask import Blueprint, render_template, redirect, url_for, abort, current_app, session, flash, request, jsonify
import firebase_admin
from firebase_admin import firestore, auth
from datetime import datetime, timedelta

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

@main.route('/profile', methods=['GET'])
@login_required
def profile():
    return render_template('profile.html', user=session.get("user"))


@main.route('/profile/data', methods=['GET'])
@login_required
def get_profile_data():
    user = session.get("user")
    if not user or "uid" not in user:
        return jsonify({"error": "No hay usuario autenticado"}), 401

    user_ref = db.collection("usuarios").document(user["uid"])  # 🔹 Buscar por UID
    user_doc = user_ref.get()

    if user_doc.exists:
        return jsonify(user_doc.to_dict())
    else:
        return jsonify({"error": "No hay datos guardados para este usuario"}), 404


@main.route('/profile/update', methods=['POST'])
@login_required
def update_profile():
    user = session.get("user")
    if not user or "uid" not in user:
        return jsonify({"error": "No hay usuario autenticado"}), 401

    data = request.json
    user_ref = db.collection("usuarios").document(user["uid"])  # 🔹 Guardar por UID
    user_ref.set(data, merge=True)

    return jsonify({"success": True})

# Ruta para renderizar la página de notificaciones
@main.route("/notifications", methods=["GET"])
@login_required
def notifications():
    return render_template("notifications.html")

@main.route("/notifications/data", methods=["GET"])
@login_required
def get_notifications():
    user = session.get("user")
    if not user:
        return jsonify({"error": "Usuario no autenticado"}), 401

    user_id = user.get("uid")
    if not user_id:
        return jsonify({"error": "No se encontró el UID del usuario"}), 400

    notifications_ref = db.collection("notificaciones").where("usuario_id", "==", user_id)
    notifications = notifications_ref.stream()

    data = []
    for doc in notifications:
        notif = doc.to_dict()
        notif["fecha"] = notif["fecha"].isoformat()
        data.append(notif)

    return jsonify(data)


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

@requests_bp.route("/requests", methods=["GET", "POST"])
@login_required
def user_requests():
    user = session.get("user")
    if not user:
        flash("Debes iniciar sesión para enviar una solicitud.", "danger")
        return redirect(url_for("auth.login"))

    # 🔹 Bloquear a los administradores para que no puedan crear solicitudes
    if user.get("rol") == "admin":
        flash("Los administradores no pueden crear solicitudes.", "danger")
        return redirect(url_for("admin.admin_requests"))

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

@main.route('/api/sensor_data', methods=['GET'])
def get_sensor_data():
    """Obtiene el último conjunto de datos de sensores desde Firestore"""
    sensores_ref = db.collection("sensores").order_by("timestamp", direction=firestore.Query.DESCENDING).limit(1)
    sensores_docs = sensores_ref.stream()
    
    # Si Firestore tiene datos, devolver el más reciente
    for doc in sensores_docs:
        return jsonify(doc.to_dict())

    # Si no hay datos en la base
    return jsonify({"error": "No hay datos en sensores"}), 404

@main.route('/api/system_status', methods=['GET'])
def get_system_status():
    """Obtiene el último estado del sistema desde la colección 'condiciones' en Firestore"""
    condiciones_ref = db.collection("condiciones").order_by("timestamp", direction=firestore.Query.DESCENDING).limit(1)
    condiciones_docs = condiciones_ref.stream()

    for doc in condiciones_docs:
        data = doc.to_dict()
        return jsonify(data)  # ✅ Retorna los datos del estado del sistema

    return jsonify({"error": "No hay datos en condiciones"}), 404

# Ruta para obtener el historial de los últimos 15 días
@main.route('/api/history_data', methods=['GET'])
def get_history_data():
    """Devuelve los datos del historial de los últimos 15 días"""
    
    # Calcular la fecha 15 días atrás
    fifteen_days_ago = datetime.utcnow() - timedelta(days=15)
    
    # Convertir la fecha a un formato Timestamp compatible con Firestore
    fifteen_days_ago_timestamp = firestore.Timestamp.from_datetime(fifteen_days_ago)
    
    # Consulta de los datos desde Firestore, filtrando por fecha
    history_ref = db.collection("condiciones").where("timestamp", ">=", fifteen_days_ago_timestamp)
    history = history_ref.stream()

    # Almacenar los datos recibidos
    data = []
    for doc in history:
        doc_data = doc.to_dict()
        doc_data["timestamp"] = doc_data["timestamp"].isoformat()  # Asegurarse de que la fecha sea serializable
        data.append(doc_data)

    # Si no se encuentran datos, retornar un error
    if not data:
        return jsonify({"error": "No se encontraron datos en el historial"}), 404

    # Devolver los datos en formato JSON
    return jsonify(data)