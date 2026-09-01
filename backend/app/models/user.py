from pydantic import BaseModel

class UserProfile(BaseModel):
    name: str
    date_of_birth: str
    location: str
    gender: str