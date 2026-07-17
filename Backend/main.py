from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import bcrypt


app = FastAPI()

# React Development Server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"]     
)
#Placeholder for the Model and Database
_placeholder_accounts = {}

def find_by_email(email):
    return _placeholder_accounts.get(email)

def hash_password(password):
    # Convert the password text into bytes using bcrypt then has it with a generated salt
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password_bytes, salt)
    # Store as text
    return hashed_password.decode('utf-8')

def create_user_account(username, email, password_hash):
    # User Account Object that will be stored.
    account = {"username": username, "email": email, "password_hash": password_hash}
    _placeholder_accounts[email] = account
    return account

# Shape of Data the registration form sends
class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str   

    
# Registration controller to confirm data is recieved
@app.post("/register")
def register(payload : RegisterRequest):
    # Account Controller Self Validate Input
    if not payload.username or not payload.email or not payload.password:
        raise HTTPException(status_code=400, detail="All fields are required.")
    
    # Account Controller findbyEmail , no existing account
    if find_by_email(payload.email) is not None:
        raise HTTPException(status_code=409, detail="Email already registered.")
    # Account Controller, hashPassword  
    password_hash = hash_password(payload.password)
    # <<create>> UserAccount, then save , INSERT
    account = create_user_account(payload.username, payload.email, password_hash)
    # Return success up to the view,
    print("Recieved registration:", payload.username, payload.email)
    return {"message" : f"Received registration for {payload.username}"}