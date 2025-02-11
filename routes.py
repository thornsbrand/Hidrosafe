from flask import Blueprint, render_template
from models import SystemData

main = Blueprint('main', __name__)

@main.route('/')
def index():
    return render_template('home.html')

@main.route('/dashboard')
def dashboard():
    # Simulate some system data
    recent_data = SystemData.query.order_by(SystemData.timestamp.desc()).limit(24).all()
    return render_template('dashboard.html', data=recent_data)

@main.route('/documentation')
def documentation():
    return render_template('documentation.html')