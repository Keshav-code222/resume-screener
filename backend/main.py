from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from scan import router as scan_router

app = FastAPI(title="ResumeCheck - AI Resume Screener")

# Allows your Vercel frontend to talk to this Render backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "Backend is running and public"}

# Only include the scanning logic
app.include_router(scan_router)

if __name__ == "__main__":
    import uvicorn
    # When you click "Run" in VS Code, this will start the server on port 8000
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)