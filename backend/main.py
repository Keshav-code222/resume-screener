from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Resume Screener API is running!"}

@app.get("/hello")
def hello():
    return {"message": "Hello from your backend!"}