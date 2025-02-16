from flask import Blueprint, render_template, redirect, url_for, flash, request, jsonify
from flask_login import login_user, logout_user, login_required
from urllib.parse import urlparse
from app import db
import firebase_admin  # 🔹 Importar firebase_admin
from firebase_admin import credentials, auth  # 🔹 Importar auth para autenticación

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

# Inicializa Firebase si aún no está inicializado
if not firebase_admin._apps:
    firebase_config = os.getenv("FIREBASE_CREDENTIALS")  # Obtiene la credencial desde Render

    if firebase_config:
        cred_dict = json.loads(firebase_config)  # Convierte la cadena JSON a diccionario
        cred = credentials.Certificate(cred_dict)  # Crea la credencial de Firebase
        firebase_admin.initialize_app(cred)  # Inicializa Firebase
    else:
        raise ValueError("Error: La variable de entorno FIREBASE_CREDENTIALS no está configurada en Render.")

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

        # 🔹 Decodificar el token para obtener información del usuario
        decoded_token = auth.verify_id_token(id_token)
        user_uid = decoded_token["uid"]
        user_email = decoded_token.get("email", "usuario_desconocido")

        # 🔹 Crear un objeto de usuario y autenticarlo en Flask-Login
        user = User(user_uid, user_email)
        login_user(user)  # 🔹 Marca al usuario como autenticado en Flask-Login

        print(f"✅ Usuario autenticado: {user.email} (UID: {user.id})")

        return jsonify({"success": True, "uid": user_uid}), 200  # Responde con éxito

    except Exception as e:
        print("❌ Error en la autenticación:", str(e))
        return jsonify({"success": False, "error": str(e)}), 401  # Devuelve error si hay un problema

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
        # Verificar si Firebase está inicializado
        if not firebase_admin._apps:
            flash("Error interno: Firebase no está inicializado.", "error")
            return redirect(url_for('auth.register'))

        # Verificar si el usuario ya existe
        try:
            existing_user = auth.get_user_by_email(email)
            flash("Este correo ya está registrado. Intenta iniciar sesión.", "error")
            return redirect(url_for('auth.login'))
        except auth.UserNotFoundError:
            pass  # Si el usuario no existe, continúa con el registro

        # Crear usuario en Firebase Authentication
        user = auth.create_user(email=email, password=password)

        flash("Registro exitoso. Ahora puedes iniciar sesión.", "success")
        return redirect(url_for('auth.login'))

    except auth.EmailAlreadyExistsError:
        flash("Este correo ya está registrado. Intenta iniciar sesión.", "error")
    except ValueError:  # Captura errores de datos inválidos
        flash("La contraseña no cumple con los requisitos de seguridad.", "error")
    except firebase_admin.auth.EmailAlreadyExistsError:  # Captura si el email ya existe
        flash("Este correo ya está registrado. Intenta iniciar sesión.", "error")
    except Exception as e:  # Captura cualquier otro error
        flash(f"Error en el registro: {str(e)}", "error")
    except Exception as e:
        flash(f"Error en el registro: {str(e)}", "error")

    return redirect(url_for('auth.register'))

@auth_bp.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('main.index'))