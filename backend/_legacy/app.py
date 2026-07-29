import json
import os
from ai import analyze_resume
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import psycopg2
from psycopg2.extras import RealDictCursor
import bcrypt
from datetime import timedelta
from werkzeug.utils import secure_filename
from resume_parser import parse_resume

app = Flask(__name__)
CORS(app)

# Config
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET', 'your-super-secret-key-change-this')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=30)
jwt = JWTManager(app)

UPLOAD_FOLDER = 'uploads/'
ALLOWED_EXTENSIONS = {'pdf', 'docx'}
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Database connection
def get_db():
    return psycopg2.connect(os.getenv('DATABASE_URL'))

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# ============= AUTH ROUTES =============

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    full_name = data.get('full_name')
    
    if not email or not password:
        return {'error': 'Email and password required'}, 400
    
    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
    
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO users (email, password_hash, full_name) VALUES (%s, %s, %s) RETURNING id",
            (email, hashed.decode('utf-8'), full_name)
        )
        user_id = cur.fetchone()[0]
        
        cur.execute(
            "INSERT INTO subscriptions (user_id, plan_type) VALUES (%s, %s)",
            (user_id, 'free')
        )
        conn.commit()
        
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
        
        if not user or not bcrypt.checkpw(password.encode(), user['password_hash'].encode() if isinstance(user['password_hash'], str) else user['password_hash']):
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

# ============= RESUME ROUTES =============

@app.route('/api/resumes/upload', methods=['POST'])
@jwt_required()
def upload_resume():
    user_id = get_jwt_identity()
    
    if 'file' not in request.files:
        return {'error': 'No file provided'}, 400
    
    file = request.files['file']
    if not allowed_file(file.filename):
        return {'error': 'Only PDF and DOCX files allowed'}, 400
    
    filename = secure_filename(file.filename)
    file_path = os.path.join(UPLOAD_FOLDER, f"{user_id}_{filename}")
    file.save(file_path)
    
    try:
        parsed = parse_resume(file_path)
        
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
        if 'conn' in locals() and conn:
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

@app.route('/api/analyses', methods=['POST'])
@jwt_required()
def create_analysis():
    user_id = get_jwt_identity()
    data = request.json
    resume_id = data.get('resume_id')
    job_description = data.get('job_description')
    job_title = data.get('job_title')

    try:
        conn = get_db()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute("SELECT raw_text FROM resumes WHERE id = %s AND user_id = %s", (resume_id, user_id))
        resume = cur.fetchone()
        if not resume:
            return {'error': 'Resume not found'}, 404
            
        from ai import analyze_resume
        import json
        
        result = analyze_resume(resume['raw_text'], job_description)
        match_score = result.get('overall_score', 0)
        missing_skills = result.get('missing_keywords', [])
        
        recommendations = [
            {'type': 'content', 'priority': 'high', 'text': sug, 'action': 'Update resume'}
            for sug in result.get('top_suggestions', [])
        ]
        
        cur.execute(
            """INSERT INTO resume_analyses 
               (resume_id, job_title, job_description, match_score, missing_skills, recommendations)
               VALUES (%s, %s, %s, %s, %s, %s) RETURNING id""",
            (resume_id, job_title, job_description, match_score, json.dumps(missing_skills), json.dumps(recommendations))
        )
        analysis_id = cur.fetchone()['id']
        conn.commit()
        
        return {
            'analysis_id': str(analysis_id),
            'match_score': match_score,
            'missing_skills': missing_skills,
            'recommendations': recommendations,
        }, 201
    except Exception as e:
        print(f"❌ ANALYSIS ERROR: {str(e)}")  # ← ADD THIS
        import traceback
        traceback.print_exc()  # ← ADD THIS
        return {'error': str(e)}, 500
    finally:
        cur.close()
        conn.close()

@app.route('/api/analyses/<analysis_id>', methods=['GET'])
@jwt_required()
def get_analysis(analysis_id):
    user_id = get_jwt_identity()
    try:
        conn = get_db()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(
            """SELECT a.* FROM resume_analyses a 
               JOIN resumes r ON a.resume_id = r.id 
               WHERE a.id = %s AND r.user_id = %s""",
            (analysis_id, user_id)
        )
        analysis = cur.fetchone()
        if not analysis:
            return {'error': 'Analysis not found'}, 404
        
        import json
        return {
            **analysis,
            'missing_skills': json.loads(analysis['missing_skills']) if analysis['missing_skills'] else [],
            'recommendations': json.loads(analysis['recommendations']) if analysis['recommendations'] else []
        }, 200
    finally:
        cur.close()
        conn.close()

if __name__ == '__main__':
    app.run(debug=True, port=5000)