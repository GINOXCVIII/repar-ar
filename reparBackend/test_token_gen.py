import firebase_admin
from firebase_admin import credentials, auth
import requests
import json
import re
import sys
from pathlib import Path

def es_email_valido(email):
    # Expresión regular para la validación de email.
    # Esta es una regex común que cubre la mayoría de los casos estándar:
    # 1. Empieza con uno o más caracteres alfanuméricos, puntos, guiones o guiones bajos (nombre de usuario).
    # 2. Seguido por un '@'.
    # 3. Seguido por uno o más caracteres alfanuméricos o guiones (dominio).
    # 4. Seguido por un punto.
    # 5. Termina con 2 a 4 caracteres alfabéticos (TLD - Top-Level Domain).
    regex = r'^[a-zA-Z0-9._-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,4}$'

    # La función re.fullmatch() intenta aplicar el patrón al string *completo*.
    # Si encuentra una coincidencia, devuelve un objeto match; de lo contrario, devuelve None.
    if re.fullmatch(regex, email):
        return True
    else:
        return False

email_correcto = False
while not email_correcto:
    email_cargado = input("Ingresar email de prueba: ")
    resultado = es_email_valido(email_cargado)
    if resultado == True:
        email_correcto = True
    else:
        print("Ingreso no valido. Reintentar. Ctrl+C para salir")

# === CONFIGURACIÓN ===
BASE_DIR = Path(__file__).resolve().parent.parent
CRED_PATH = BASE_DIR / "reparBackend/repar-ar-firebase-adminsdk-fbsvc-7d6ecb6fe2.json"

API_KEY = "AIzaSyC8osUuIoSbzj3BkwsdwnCVEAT5c1XCTnM"
EMAIL = email_cargado
DISPLAY_NAME = "Usuario de Prueba"

# ======================

def init_firebase():
    if not firebase_admin._apps:
        cred = credentials.Certificate(str(CRED_PATH))
        firebase_admin.initialize_app(cred)
        print("Firebase Admin inicializado correctamente.")
    else:
        print("Firebase Admin ya estaba inicializado.")


def get_or_create_user(email, display_name):
    """Busca un usuario en Firebase o lo crea si no existe."""
    try:
        user = auth.get_user_by_email(email)
        print(f"Usuario existente encontrado: {user.uid}")
        nuevo = False
    except firebase_admin._auth_utils.UserNotFoundError:
        user = auth.create_user(email=email, display_name=display_name)
        print(f"Usuario creado: {user.uid}")
        nuevo = True
    return user, nuevo


def exchange_custom_token_for_id_token(custom_token):
    """Intercambia un Custom Token por un ID Token real mediante REST API de Firebase."""
    url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key={API_KEY}"
    payload = {
        "token": custom_token.decode("utf-8"),
        "returnSecureToken": True
    }
    r = requests.post(url, json=payload)
    if r.status_code == 200:
        data = r.json()
        return data
    else:
        print("Error al intercambiar el token:")
        print(r.text)
        sys.exit(1)


def main():
    print("=== Generador de Firebase ID Token ===")
    init_firebase()

    user, nuevo = get_or_create_user(EMAIL, DISPLAY_NAME)

    # Crear Custom Token
    custom_token = auth.create_custom_token(user.uid)
    print("\nCustom Token generado correctamente.")

    # Intercambiar por ID Token
    token_data = exchange_custom_token_for_id_token(custom_token)

    id_token = token_data["idToken"]
    refresh_token = token_data["refreshToken"]
    is_new_user = token_data.get("isNewUser", False)

    print("\n=== RESULTADO FINAL ===")
    print(f"UID: {user.uid}")
    print(f"Email: {EMAIL}")
    print(f"¿Usuario nuevo?: {'Sí' if nuevo or is_new_user else 'No'}")
    print(f"\nID Token (válido por 1h):\n{id_token}")
    print(f"\nRefresh Token: {refresh_token[:30]}... (truncado)")
    print("========================")

if __name__ == "__main__":
    main()

