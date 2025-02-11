from datetime import datetime
from app import db

class SystemData(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    pressure = db.Column(db.Float)
    flow_rate = db.Column(db.Float)
    temperature = db.Column(db.Float)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)