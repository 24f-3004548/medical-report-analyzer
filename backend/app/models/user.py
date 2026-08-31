from pydantic import BaseModel

class UserProfile(BaseModel):
    name: str
    age: int
    location: str
    gender: str