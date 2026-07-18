import bcrypt
from database import get_db_connection



class UserAccount:
    # Constructor to create a new user account object
    def __init__(self, username, email, password_hash):
        self.username = username
        self.email = email
        self.password_hash = password_hash
    @staticmethod
    def hash_password(password):
        # Convert the password text into bytes using bcrypt then has it with a generated salt
        password_bytes = password.encode('utf-8')
        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(password_bytes, salt)
        # Store as text
        return hashed_password.decode('utf-8')    
    @staticmethod
    def find_by_email(email):
        # Open a connection and ask the database if this email exists
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT username, email, password_hash FROM users WHERE email = %s", (email,))
        row = cursor.fetchone()
        cursor.close()
        connection.close()
        if row is None:
            return None
        # Build a UserAccount object from the database row
        return UserAccount(username=row[0], email=row[1], password_hash=row[2])
    def verify_password(self, plain_password):
        # Check a submitted password against this user's stored hash
        return bcrypt.checkpw(plain_password.encode('utf-8'), self.password_hash.encode('utf-8'))
    def save(self):
        # Open a connection and insert the new user into the database
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("INSERT INTO users (username, email, password_hash) VALUES (%s, %s, %s) RETURNING user_id", (self.username, self.email, self.password_hash))
        new_id = cursor.fetchone()[0]
        connection.commit()
        cursor.close()
        connection.close()
        # Store new id on the object
        self.user_id = new_id
        return self

    