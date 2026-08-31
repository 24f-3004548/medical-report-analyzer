from fastapi import APIRouter, File, HTTPException, UploadFile, Depends
from app.models.report import ExtractedReport
from app.services.document_ai import extract_text
from app.services.extractor import extract_medical_results
from app.services.supabase import supabase
from app.services.auth import get_current_user
from app.services.knowledge import get_medical_knowledge
from app.services.interpreter import interpret_medical_results

router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)

@router.post("/upload", response_model=ExtractedReport)
async def upload_report(file: UploadFile = File(...),user=Depends(get_current_user)):
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported."
        )
    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is empty."
        )
    file_path = f"{user.id}/{file.filename}"
    try:
        supabase.storage.from_("reports").upload(
            file_path,
            file_bytes,
            {
                "content-type": "application/pdf",
                "upsert": "true"
            }
        )
        raw_text = extract_text(
            file_bytes,
            "application/pdf"
        )
        extracted_report = extract_medical_results(raw_text)
        knowledge = get_medical_knowledge(extracted_report.model_dump())
        interpretation = interpret_medical_results(
            extracted_report.model_dump(),
            knowledge
        )
        report_data = {
            "user_id": user.id,
            "file_name": file.filename,
            "file_path": file_path,
            "report_type": extracted_report.report_type,
            "raw_text": raw_text,
            "extracted_data": extracted_report.model_dump(),
            "interpretation": interpretation.model_dump(),
            "sources": [
                {
                    "topic": item["topic"],
                    "source": item["source"],
                    "title": item["title"],
                    "url": item["url"]
                }
                for item in knowledge
                if item.get("source") and item.get("url")
            ],
            "status": "completed"
        }
        response = (
            supabase
            .table("reports")
            .insert(report_data)
            .execute()
        )
        if not response.data:
            raise Exception("Report was not saved to database.")
        return extracted_report
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Report processing failed: {str(e)}"
        )

@router.get("")
async def get_reports(user=Depends(get_current_user)):
    try:
        response = (
            supabase
            .table("reports")
            .select(
                "id, file_name, report_type, status, created_at"
            )
            .eq("user_id", user.id)
            .order("created_at", desc=True)
            .execute()
        )
        return response.data
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch reports: {str(e)}"
        )

@router.get("/{report_id}")
async def get_report(report_id: str,user=Depends(get_current_user)):
    try:
        response = (
            supabase
            .table("reports")
            .select("*")
            .eq("id", report_id)
            .eq("user_id", user.id)
            .single()
            .execute()
        )
        if not response.data:
            raise HTTPException(
                status_code=404,
                detail="Report not found."
            )
        return response.data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch report: {str(e)}"
        )