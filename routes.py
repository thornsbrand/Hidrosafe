from flask import Blueprint, render_template
from models import SystemData

# Blueprint principal
main = Blueprint('main', __name__)

# Rutas principales
@main.route('/')
def index():
    return render_template('home.html')

@main.route('/dashboard')
def dashboard():
    # Simula algunos datos del sistema
    recent_data = SystemData.query.order_by(SystemData.timestamp.desc()).limit(24).all()
    return render_template('dashboard.html', data=recent_data)

@main.route('/documentation')
def documentation():
    return render_template('documentation.html')


# Blueprint para autenticación
auth = Blueprint('auth', __name__, url_prefix='/auth')

# Rutas de autenticación
@auth.route('/login')
def login():
    return render_template('auth/login.html')

@auth.route('/register')
def register():
    return render_template('auth/register.html')
