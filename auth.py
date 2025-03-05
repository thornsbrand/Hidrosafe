from flask import Blueprint, render_template, redirect, url_for, flash, request, jsonify
from flask_login import login_user, logout_user, login_required, UserMixin
from urllib.parse import urlparse
from app import db  # ✅ Importamos la instancia de Firebase Firestore desde app.py
import firebase_admin  # 🔹 Importar firebase_admin
from firebase_admin import credentials, auth  # 🔹 Importar auth para autenticación
import os
import json

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

# ✅ Obtener Firestore directamente desde firebase_admin
db = firestore.client()

# 🔹 Modelo de Usuario con rol
class User(UserMixin):
    def __init__(self, uid, email, rol):
        self.id = uid
        self.email = email
        self.rol = rol

# 🔹 Ruta para mostrar el formulario de login (no necesita cambios)
@auth_bp.route('/login', methods=['GET'])
def login():
    return render_template('auth/login.html')

@auth_bp.route('/login', methods=['POST'])
def login_post():
    try:
        data = request.json
        id_token = data.get("idToken")

        if not id_token:
            return jsonify({"success": False, "error": "Token no proporcionado"}), 400

        # 🔹 Verificar token en Firebase
        try:
            decoded_token = auth.verify_id_token(id_token)
        except Exception as e:
            print(f"❌ Error al verificar el token de Firebase: {e}")
            return jsonify({"success": False, "error": "Token inválido o expirado"}), 401

        user_uid = decoded_token["uid"]
        user_email = decoded_token.get("email", "usuario_desconocido")

        # 🔹 Obtener el rol desde Firestore
        user_doc = db.collection("usuarios").document(user_uid).get()
        if user_doc.exists:
            user_data = user_doc.to_dict()
            user_rol = user_data.get("rol", "usuario")
        else:
            user_rol = "usuario"

        # 🔹 Crear usuario y autenticar en Flask-Login
        user = User(user_uid, user_email, user_rol)
        login_user(user)

        print(f"✅ Usuario autenticado: {user.email} (Rol: {user.rol})")

        return jsonify({"success": True, "uid": user_uid, "rol": user.rol}), 200

    except Exception as e:
        print(f"❌ Error en la autenticación: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 401




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