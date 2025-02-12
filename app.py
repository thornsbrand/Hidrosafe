import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase

# Base class for SQLAlchemy models
class Base(DeclarativeBase):
    pass

# Initialize extensions
db = SQLAlchemy(model_class=Base)

def create_app():
    app = Flask(__name__)

    # Configure app
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///hydrosafe.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.secret_key = os.environ.get("FLASK_SECRET_KEY") or "hydrosafe_secret_key"

    # Initialize extensions with app
    db.init_app(app)

    with app.app_context():
        # Import routes después de crear app para evitar problemas de importación
        from routes import main, auth  # <-- Importamos auth

        # Registrar los blueprints
        app.register_blueprint(main)
        app.register_blueprint(auth)  # <-- Registramos auth aquí

        # Importar modelos y crear tablas
        import models
        db.create_all()

        return app

# Crear la instancia de la aplicación
app = create_app()
