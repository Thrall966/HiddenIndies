import bcrypt
from database import get_db_connection



class UserAccount:
    # Constructor to create a new user account object
    def __init__(self, username, email, password_hash, user_id=None, role=None):
        self.username = username
        self.email = email
        self.password_hash = password_hash
        self.user_id = user_id
        self.role = role



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
        cursor.execute("SELECT username, email, password_hash, user_id, role FROM users WHERE email = %s AND is_deleted = FALSE", (email,)) #updated query to exclude deleted accounts
        row = cursor.fetchone()
        cursor.close()
        connection.close()
        if row is None:
            return None
        # Build a UserAccount object from the database row
        return UserAccount(username=row[0], email=row[1], password_hash=row[2], user_id=row[3], role=row[4])


    
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


    @staticmethod
    def delete_account(user_id):
        #  soft delete anonymise the user information, and blank review text
        #  keep reviews attached to their original ID so that our one review per user constraint stays intact
        connection = get_db_connection()
        cursor = connection.cursor()
        try:
            # blank the text of this user's reviews, keeping ratings and ownership
            cursor.execute("UPDATE reviews SET review_text = %s WHERE user_id = %s", ("", user_id), 
            )

            # anonymise the user's own record, removing personal data and blocking login
            cursor.execute(
                "UPDATE users SET username = %s, email = %s, password_hash = %s, is_deleted = TRUE, deleted_at = CURRENT_TIMESTAMP WHERE user_id = %s",
                ("deleted_user_" + str(user_id), None, None, user_id),
            )

            connection.commit()

        finally:
            cursor.close()
            connection.close()
    


    @staticmethod
    def get_all():
        # fetch all users for the admin to view
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT user_id, username, email, role, is_deleted FROM users ORDER BY user_id")
        rows = cursor.fetchall()
        cursor.close()
        connection.close()

        users = []
        for row in rows:
            users.append({
                "user_id": row[0],
                "username": row[1],
                "email": row[2],
                "role": row[3],
                "is_deleted": row[4],
            })
        return users