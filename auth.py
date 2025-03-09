from flask import Blueprint, render_template, redirect, url_for, flash, request, session
import firebase_admin
from firebase_admin import auth, firestore

auth_bp = Blueprint("auth", __name__)

# ✅ Obtener Firestore directamente desde Firebase
db = firestore.client()

@auth_bp.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = request.form.get("email")
        password = request.form.get("password")

        try:
            user = auth.get_user_by_email(email)  # Obtiene el usuario en Firebase

            # 🔹 Recuperar información del usuario en Firestore
            user_doc = db.collection("usuarios").document(user.uid).get()
            user_data = user_doc.to_dict() if user_doc.exists else {}

            session["user"] = {
                "uid": user.uid,
                "email": user.email,
                "rol": user_data.get("rol", "usuario")  # Rol por defecto "usuario"
            }

            flash("Inicio de sesión exitoso", "success")
            return redirect(url_for("main.index"))  # Redirigir a la página principal

        except Exception as e:
            flash(f"Error en el inicio de sesión: {str(e)}", "danger")

    return render_template("auth/login.html")



@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == "POST":
        email = request.form.get("email")
        password = request.form.get("password")

        if not email or not password:
            flash("Todos los campos son obligatorios.", "error")
            return redirect(url_for('auth.register'))

        try:
            user = auth.create_user(email=email, password=password)
            user_uid = user.uid

            # Guardar en Firestore
            db.collection("usuarios").document(user_uid).set({
                "email": email,
                "rol": "usuario"
            })

            flash("Registro exitoso. Ahora puedes iniciar sesión.", "success")
            return redirect(url_for('auth.login'))

        except Exception as e:
            flash(f"Error en el registro: {str(e)}", "error")

    return render_template('auth/register.html')

@auth_bp.route("/forgot_password", methods=["GET", "POST"])
def forgot_password():
    if request.method == "POST":
        email = request.form.get("email")

        if not email:
            flash("Por favor, ingresa tu correo electrónico.", "error")
            return redirect(url_for("auth.forgot_password"))

        try:
            auth.generate_password_reset_link(email)  # Envía el enlace de recuperación de Firebase
            flash("Se ha enviado un enlace de recuperación a tu correo.", "success")
            return redirect(url_for("auth.login"))

        except Exception as e:
            flash(f"Error al enviar el correo: {str(e)}", "danger")

    return render_template("auth/forgot_password.html")


@auth_bp.route("/logout")
def logout():
    session.pop("user", None)  # 🔹 Eliminar usuario de la sesión
    return redirect(url_for("main.index"))
