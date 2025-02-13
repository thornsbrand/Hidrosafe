from firebase_admin import firestore

db = firestore.client()

# Funciones para interactuar con Firestore
def add_system_data(data):
    """Guarda un nuevo documento en la colección 'system_data'."""
    doc_ref = db.collection("system_data").add(data)
    return doc_ref[1].id

def get_all_system_data():
    """Obtiene todos los documentos de la colección 'system_data'."""
    docs = db.collection("system_data").stream()
    return [{doc.id: doc.to_dict()} for doc in docs]
