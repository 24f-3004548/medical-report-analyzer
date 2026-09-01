import traceback
from fastapi import APIRouter, Depends, File, HTTPException, Response, UploadFile
from pydantic import BaseModel, Field
from app.models.report import ExtractedReport
from app.services.document_ai import extract_text
from app.services.extractor import extract_medical_results
from app.services.supabase import supabase
from app.services.auth import get_current_user
from app.services.knowledge import get_medical_knowledge
from app.services.interpreter import interpret_medical_results
from app.services.serialization import serialize_api

router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)


class RenameReportRequest(BaseModel):
    file_name: str = Field(min_length=1, max_length=255, validation_alias="fileName")


def _get_report(report_id: str, user_id: str):
    response = (
        supabase.table("reports")
        .select("*")
        .eq("id", report_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    if not response.data:
        raise HTTPException(status_code=404, detail="Report not found.")
    return response.data


def _pdf_name(file_name: str) -> str:
    name = file_name.strip()
    if not name.lower().endswith(".pdf"):
        name += ".pdf"
    if "/" in name or "\\" in name or name in {".", ".."}:
        raise HTTPException(status_code=400, detail="Enter a valid PDF filename.")
    return name

@router.post("/upload")
def upload_report(file: UploadFile = File(...),user=Depends(get_current_user)):
    if file.content_type not in {None, "", "application/pdf"}:
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported."
        )
    file_bytes = file.file.read()
    if not file_bytes:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is empty."
        )
    file_path = f"{user.id}/{file.filename}"
    report_id = None
    try:
        stage = "uploading original PDF"
        supabase.storage.from_("reports").upload(
            file_path,
            file_bytes,
            {
                "content-type": "application/pdf",
                "upsert": "true"
            }
        )
        stage = "creating processing record"
        pending = supabase.table("reports").insert({
            "user_id": user.id,
            "file_name": file.filename,
            "file_path": file_path,
            "status": "Processing",
        }).execute()
        if not pending.data:
            raise Exception("Report could not be queued for processing.")
        report_id = pending.data[0]["id"]
        raw_text = extract_text(
            file_bytes,
            "application/pdf"
        )
        stage = "extracting text with Document AI"
        extracted_report = extract_medical_results(raw_text)
        stage = "retrieving medical information"
        knowledge = get_medical_knowledge(extracted_report.model_dump())
        stage = "generating explanations"
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
            "status": "Completed"
        }
        response = (
            supabase
            .table("reports")
            .update(report_data)
            .eq("id", report_id)
            .eq("user_id", user.id)
            .execute()
        )
        if not response.data:
            raise Exception("Report was not saved to database.")
        return serialize_api({"id": report_id, **extracted_report.model_dump()})
    except Exception as e:
        print(f"Report {report_id or file.filename} failed during {stage}: {e}")
        traceback.print_exc()
        if report_id:
            try:
                supabase.table("reports").update({"status": "Failed"}).eq("id", report_id).eq("user_id", user.id).execute()
            except Exception as status_error:
                print(f"Could not mark report {report_id} as Failed: {status_error}")
        raise HTTPException(
            status_code=500,
            detail=f"Report processing failed during {stage}."
        )

@router.get("")
async def get_reports(user=Depends(get_current_user)):
    try:
        response = (
            supabase
            .table("reports")
            .select(
                "id, file_name, report_type, status, created_at, extracted_data"
            )
            .eq("user_id", user.id)
            .order("created_at", desc=True)
            .execute()
        )
        return serialize_api(response.data)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch reports: {str(e)}"
        )


@router.get("/{report_id}/download")
def download_report(report_id: str, user=Depends(get_current_user)):
    report = _get_report(report_id, user.id)
    try:
        file_bytes = supabase.storage.from_("reports").download(report["file_path"])
        return Response(
            content=file_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{report["file_name"]}"'
            },
        )
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Original PDF could not be downloaded: {str(e)}")


@router.patch("/{report_id}/name")
def rename_report(report_id: str, data: RenameReportRequest, user=Depends(get_current_user)):
    report = _get_report(report_id, user.id)
    new_name = _pdf_name(data.file_name)
    new_path = f"{user.id}/{new_name}"
    try:
        if new_path != report["file_path"]:
            supabase.storage.from_("reports").move(report["file_path"], new_path)
        response = (
            supabase.table("reports")
            .update({"file_name": new_name, "file_path": new_path})
            .eq("id", report_id)
            .eq("user_id", user.id)
            .execute()
        )
        return serialize_api(response.data[0] if response.data else {"file_name": new_name})
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to rename report: {str(e)}")


@router.delete("/{report_id}")
def delete_report(report_id: str, user=Depends(get_current_user)):
    report = _get_report(report_id, user.id)
    try:
        if report.get("file_path"):
            supabase.storage.from_("reports").remove([report["file_path"]])
        supabase.table("reports").delete().eq("id", report_id).eq("user_id", user.id).execute()
        return {"message": "Report deleted successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete report: {str(e)}")

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
        return serialize_api(response.data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch report: {str(e)}"
        )
