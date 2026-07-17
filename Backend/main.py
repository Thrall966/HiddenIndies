from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import bcrypt
import os
import psycopg2
from dotenv import load_dotenv


# Load environment variables from .env file
load_dotenv()

# Database connection parameters from environment variables
def get_db_connection():
    return psycopg2.connect(
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT"),
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD")
    )


app = FastAPI()

# React Development Server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"]     
)


def find_by_email(email):
    # Open a connection and ask the database if this email exists
    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    account = cursor.fetchone()
    cursor.close()
    connection.close()
    return account

def hash_password(password):
    # Convert the password text into bytes using bcrypt then has it with a generated salt
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password_bytes, salt)
    # Store as text
    return hashed_password.decode('utf-8')

def create_user_account(username, email, password_hash):
    # Open a connection and insert the new user into the database
    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute("INSERT INTO users (username, email, password_hash) VALUES (%s, %s, %s) RETURNING user_id, username, email", (username, email, password_hash))
    new_user = cursor.fetchone()
    connection.commit()
    cursor.close()
    connection.close()
    # Return the newly created user account
    return {"user_id": new_user[0], "username" : new_user[1], "email": new_user[2]}

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