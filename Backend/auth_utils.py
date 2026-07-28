import os
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from dotenv import load_dotenv
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from models.user import UserAccount

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

# tells FASTAPI to look for a token in the Authorization header
security = HTTPBearer()

# verifies the token and returns the users email or rejects the request
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        # decode and verify the token using secret key
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token.")
        return email
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token.")


# verifies the request is from an admin, rejects otherwise
def get_current_admin(user_email: str = Depends(get_current_user)):
    user = UserAccount.find_by_email(user_email)
    if user is None:
        raise HTTPException(status_code=401, detail="User not found.")
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required.")
    return user