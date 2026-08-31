from fastapi import FastAPI, Depends

from app.services.supabase import supabase
from app.services.auth import get_current_user
from app.routes.users import router as users_router
from app.routes.reports import router as reports_router

app = FastAPI(title="Veris API")

app.include_router(users_router)
app.include_router(reports_router)


@app.get("/")
def root():
    return {
        "message": "Veris backend is running"
    }


@app.get("/test-supabase")
def test_supabase():
    response = supabase.table("users").select("*").execute()

    return {
        "connected": True,
        "users": response.data
    }


@app.get("/test-auth")
def test_auth(user=Depends(get_current_user)):
    return {
        "authenticated": True,
        "user_id": user.id,
        "email": user.email
    }