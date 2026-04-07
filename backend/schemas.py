from pydantic import BaseModel, EmailStr

# For Registration/Login input
class UserCreate(BaseModel):
    email: EmailStr
    password: str

# For the Login response
class Token(BaseModel):
    access_token: str
    token_type: str