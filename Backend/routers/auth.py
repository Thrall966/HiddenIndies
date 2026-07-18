from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from models.user import UserAccount


# Router groups related endpoints, main.py will include this router
router = APIRouter()


# Shape of the data the registration form sends
class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str


# Registration controller to confirm data is received
@router.post("/register")
def register(payload: RegisterRequest):
    # Validating Input
    if not payload.username or not payload.email or not payload.password:
        raise HTTPException(status_code=400, detail="All fields are required.")

    # Check no existing account with this email
    if UserAccount.find_by_email(payload.email) is not None:
        raise HTTPException(status_code=409, detail="Email already registered.")

    # Hash the password
    password_hash = UserAccount.hash_password(payload.password)

    # Create a new UserAccount and save it to the database
    user = UserAccount(payload.username, payload.email, password_hash)
    user.save()

    
    return {"message": f"Received registration for {payload.username}"}