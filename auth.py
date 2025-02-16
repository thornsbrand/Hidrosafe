from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_user, logout_user, login_required
from urllib.parse import urlparse
from app import db
from firebase_admin import auth

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        user = User.query.filter_by(email=email).first()

        if user is None or not user.check_password(password):
            flash('Invalid email or password')
            return redirect(url_for('auth.login'))

        login_user(user)
        next_page = request.args.get('next')
        if not next_page or urlparse(next_page).netloc != '':
            next_page = url_for('main.dashboard')
        return redirect(next_page)

    return render_template('auth/login.html')

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