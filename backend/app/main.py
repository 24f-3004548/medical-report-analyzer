from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.users import auth_router, profile_router
from app.routes.reports import router as reports_router
from app.routes.chat import router as chat_router

app = FastAPI(title="Veris API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(reports_router)
app.include_router(chat_router)


@app.get("/")
def root():
    return {
        "message": "Veris backend is running"
    }

