from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, get_db
import models
from models import User, Scan
from scan import router as scan_router
from auth.utils import get_password_hash, verify_password, create_access_token, Token
from auth.dependencies import get_current_user

# Create tables automatically
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="ResumeCheck - AI Resume Screener")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "Backend is running"}

# --- AUTH ---
@app.post("/auth/register")
def register(user_data: dict, db: Session = Depends(get_db)):
    email, password = user_data.get("email"), user_data.get("password")
    if not email or not password:
        raise HTTPException(status_code=400, detail="Missing fields")
    
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=400, detail="Email exists")

    new_user = User(email=email, hashed_password=get_password_hash(password))
    db.add(new_user)
    db.commit()
    return {"message": "Registered"}

@app.post("/auth/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {"access_token": create_access_token(data={"sub": user.email}), "token_type": "bearer"}

# --- HISTORY ---
@app.get("/auth/history")
def get_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Scan).filter(Scan.user_id == current_user.id).all()

app.include_router(scan_router)