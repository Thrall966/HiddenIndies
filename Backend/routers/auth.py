from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from models.user import UserAccount
from auth_utils import create_access_token, get_current_user, get_current_admin


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

    if UserAccount.find_by_username(payload.username) is not None:
        raise HTTPException(status_code=409, detail="Username already taken.")

    # Hash the password
    password_hash = UserAccount.hash_password(payload.password)

    # Create a new UserAccount and save it to the database
    user = UserAccount(payload.username, payload.email, password_hash)
    user.save()

    
    return {"message": f"Received registration for {payload.username}"}


# Shape of data the login form sends
class LoginRequest(BaseModel):
    email: str
    password: str

# Login controller to confirm data is received
@router.post("/login")
def login(payload: LoginRequest):
    # Validating Input
    if not payload.email or not payload.password:
        raise HTTPException(status_code=400, detail="Email and password are required.")

    # Find the user by email
    user = UserAccount.find_by_email(payload.email)
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    # Verify the password
    if not user.verify_password(payload.password):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    # Create a JWT token for the authenticated user
    token = create_access_token(user.email)

    return {
        "access_token": token,
        "token_type": "bearer",
        "username": user.username,
        "role": user.role,
    }


@router.delete("/account")
def delete_account(user_email: str = Depends(get_current_user)):
    # Identifdy the logged in user
    user = UserAccount.find_by_email(user_email)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found.")

    # Anonymise their reviews and delete the account
    UserAccount.delete_account(user.user_id)

    return {"message": "Account deleted."}


# Admin: list all users
@router.get("/admin/users")
def admin_list_users(admin=Depends(get_current_admin)):
    return UserAccount.get_all()



#Admin: Delete a user by anonymising their account
@router.delete("/admin/users/{user_id}")
def admin_delete_user(user_id: int, admin=Depends(get_current_admin)):
    UserAccount.delete_account(user_id)
    return {"message": "User deleted."}




