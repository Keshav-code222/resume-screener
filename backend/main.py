from fastapi import FastAPI
from database import engine
import models

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Resume Screener API is running!"}

@app.get("/hello")
def hello():
    return {"message": "Hello from your backend!"}