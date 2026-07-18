import os
from datetime import datetime, timedelta, timezone
from jose import jwt
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = os.getenv("JWT_ALGORITHM")
EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES"))


def create_access_token(email: str):
    # Building the payload for the JWT token, including the subject (email) and expiration time
    expire_time = datetime.now(timezone.utc) + timedelta(minutes=EXPIRE_MINUTES)
    payload = {
        "sub": email,
        "exp": expire_time
    }
    # Sign the payload with the secret key to produce the token
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return token