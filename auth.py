from flask import Blueprint, render_template, redirect, url_for, flash, request, jsonify
from flask_login import login_user, logout_user, login_required, UserMixin
from urllib.parse import urlparse
import firebase_admin  # 🔹 Importar firebase_admin
from firebase_admin import credentials, auth, firestore  # 🔹 Importar auth para autenticación
from werkzeug.security import check_password_hash
from models import db, User

auth_bp = Blueprint("auth", __name__)

# ✅ Obtener Firestore directamente desde firebase_admin
db = firestore.client()

@auth_bp.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = request.form.get("email")
        password = request.form.get("password")

        user = User.query.filter_by(email=email).first()

        if user and check_password_hash(user.password, password):
            session["user_id"] = user.id  # Guardar sesión
            flash("Inicio de sesión exitoso", "success")
            return redirect(url_for("dashboard"))

        flash("Correo o contraseña incorrectos", "danger")

    return render_template("auth/login.html")

# Ruta para mostrar el formulario de registro
@auth_bp.route('/register', methods=['GET'])
def register():
    return render_template('auth/register.html')

# Ruta para procesar el registro de usuario
@auth_bp.route('/register', methods=['POST'])
def register_post():
    email = request.form.get("email")
    password = request.form.get("password")

    if not email or not password:
        flash("Todos los campos son obligatorios.", "error")
        return redirect(url_for('auth.register'))

    try:
        user = auth.create_user(email=email, password=password)
        user_uid = user.uid

        # 🔹 Guardar usuario en Firestore con rol por defecto "usuario"
        db.collection("usuarios").document(user_uid).set({
            "email": email,
            "rol": "usuario"  # Por defecto, todos son usuarios normales
        })

        flash("Registro exitoso. Ahora puedes iniciar sesión.", "success")
        return redirect(url_for('auth.login'))

    except Exception as e:
        flash(f"Error en el registro: {str(e)}", "error")
        return redirect(url_for('auth.register'))

@auth_bp.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('main.index'))