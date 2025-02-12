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
        # Import routes after app creation to avoid circular imports
        from routes import main, auth  # Asegúrate de importar auth

        # Register blueprints
        app.register_blueprint(main)
        app.register_blueprint(auth, url_prefix="/auth")  # Registrar el blueprint de autenticación

        # Import models and create tables
        import models
        db.create_all()

        return app

# Create the application instance
app = create_app()
