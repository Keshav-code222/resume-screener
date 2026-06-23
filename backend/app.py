from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import psycopg2
from psycopg2.extras import RealDictCursor
import bcrypt
import os
from datetime import timedelta

app = Flask(__name__)
CORS(app)

# Config
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=30)
jwt = JWTManager(app)

# Database connection
def get_db():
    return psycopg2.connect(os.getenv('DATABASE_URL'))

# ============= AUTH ROUTES =============

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    full_name = data.get('full_name')
    
    if not email or not password:
        return {'error': 'Email and password required'}, 400
    
    # Hash password
    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
    
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO users (email, password_hash, full_name) VALUES (%s, %s, %s) RETURNING id",
            (email, hashed, full_name)
        )
        user_id = cur.fetchone()[0]
        
        # Create free subscription
        cur.execute(
            "INSERT INTO subscriptions (user_id, plan_type) VALUES (%s, %s)",
            (user_id, 'free')
        )
        conn.commit()
        
        # Create JWT token
        access_token = create_access_token(identity=str(user_id))
        return {'access_token': access_token, 'user_id': str(user_id)}, 201
    except psycopg2.IntegrityError:
        return {'error': 'Email already exists'}, 409
    finally:
        cur.close()
        conn.close()

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return {'error': 'Email and password required'}, 400
    
    try:
        conn = get_db()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT id, password_hash FROM users WHERE email = %s", (email,))
        user = cur.fetchone()
        
        if not user or not bcrypt.checkpw(password.encode(), user['password_hash']):
            return {'error': 'Invalid credentials'}, 401
        
        access_token = create_access_token(identity=str(user['id']))
        return {'access_token': access_token, 'user_id': str(user['id'])}, 200
    finally:
        cur.close()
        conn.close()

@app.route('/api/users/me', methods=['GET'])
@jwt_required()
def get_user():
    user_id = get_jwt_identity()
    try:
        conn = get_db()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT id, email, full_name FROM users WHERE id = %s", (user_id,))
        user = cur.fetchone()
        return user, 200
    finally:
        cur.close()
        conn.close()

if __name__ == '__main__':
    app.run(debug=True, port=5000)

from werkzeug.utils import secure_filename
import os
from resume_parser import parse_resume

UPLOAD_FOLDER = 'uploads/'
ALLOWED_EXTENSIONS = {'pdf', 'docx'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/resumes/upload', methods=['POST'])
@jwt_required()
def upload_resume():
    user_id = get_jwt_identity()
    
    if 'file' not in request.files:
        return {'error': 'No file provided'}, 400
    
    file = request.files['file']
    if not allowed_file(file.filename):
        return {'error': 'Only PDF and DOCX files allowed'}, 400
    
    # Save file
    filename = secure_filename(file.filename)
    file_path = os.path.join(UPLOAD_FOLDER, f"{user_id}_{filename}")
    file.save(file_path)
    
    try:
        # Parse resume
        parsed = parse_resume(file_path)
        
        # Store in DB
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            """INSERT INTO resumes (user_id, file_name, file_path, raw_text) 
               VALUES (%s, %s, %s, %s) RETURNING id""",
            (user_id, filename, file_path, parsed['raw_text'])
        )
        resume_id = cur.fetchone()[0]
        conn.commit()
        
        return {
            'resume_id': str(resume_id),
            'skills': parsed['skills'],
            'word_count': parsed['word_count']
        }, 201
    except Exception as e:
        return {'error': str(e)}, 500
    finally:
        cur.close()
        conn.close()

@app.route('/api/resumes', methods=['GET'])
@jwt_required()
def get_resumes():
    user_id = get_jwt_identity()
    try:
        conn = get_db()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(
            "SELECT id, file_name, created_at FROM resumes WHERE user_id = %s ORDER BY created_at DESC",
            (user_id,)
        )
        resumes = cur.fetchall()
        return [dict(r) for r in resumes], 200
    finally:
        cur.close()
        conn.close()