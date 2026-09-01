from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.services.auth import get_current_user
from app.services.chatbot import answer_question
from app.services.supabase import supabase


router = APIRouter(prefix="/chat", tags=["Chat"])


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    report_id: str | None = None


@router.post("")
def chat(data: ChatRequest, user=Depends(get_current_user)):
    query = supabase.table("reports").select(
        "id, file_name, report_type, status, created_at, extracted_data, interpretation"
    ).eq("user_id", user.id)
    if data.report_id:
        query = query.eq("id", data.report_id)

    try:
        response = query.execute()
        reports = response.data or []
        if data.report_id and not reports:
            raise HTTPException(status_code=404, detail="Report not found.")
        return {"message": answer_question(data.message, reports, data.report_id)}
    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(status_code=502, detail=f"Chat service unavailable: {error}")