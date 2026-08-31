from fastapi import APIRouter, Depends
from app.models.user import UserProfile
from app.services.auth import get_current_user
from app.services.supabase import supabase

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

@router.post("/profile")
def create_profile(profile: UserProfile,user=Depends(get_current_user)):
    data = {
        "id": user.id,
        "name": profile.name,
        "age": profile.age,
        "email": user.email,
        "location": profile.location,
        "gender": profile.gender
    }
    response = (
        supabase
        .table("users")
        .insert(data)
        .execute()
    )
    return response.data[0]