from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from models.user import UserAccount


app = FastAPI()

# React Development Server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"]     
)


# Shape of Data the registration form sends
class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str   

    
# Registration controller to confirm data is recieved
@app.post("/register")
def register(payload : RegisterRequest):
    # Validating Input
    if not payload.username or not payload.email or not payload.password:
        raise HTTPException(status_code=400, detail="All fields are required.")
    
    # Check no existing account with this email
    if UserAccount.find_by_email(payload.email) is not None:
        raise HTTPException(status_code=409, detail="Email already registered.")
    
    # Hash the password
    password_hash = UserAccount.hash_password(payload.password)
    
    # Create the UserAccount object and save it to the database
    user = UserAccount(payload.username, payload.email, password_hash)
    user.save()
    
    # Return success up to the view
    return {"message": f"User created successfully for {payload.username}"}