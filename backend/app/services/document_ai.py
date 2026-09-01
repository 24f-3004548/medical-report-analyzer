import os
from dotenv import load_dotenv
from google.api_core.client_options import ClientOptions
from google.cloud import documentai
load_dotenv()

PROJECT_ID = os.getenv("GOOGLE_CLOUD_PROJECT_ID")
LOCATION = os.getenv("GOOGLE_CLOUD_LOCATION")
PROCESSOR_ID = os.getenv("GOOGLE_DOCUMENT_AI_PROCESSOR_ID")

def get_document_ai_client():
    opts = ClientOptions(
        api_endpoint=f"{LOCATION}-documentai.googleapis.com"
    )
    return documentai.DocumentProcessorServiceClient(
        client_options=opts
    )

def extract_text(file_bytes: bytes, mime_type: str) -> str:
    client = get_document_ai_client()
    processor_name = client.processor_path(
        PROJECT_ID,
        LOCATION,
        PROCESSOR_ID
    )
    raw_document = documentai.RawDocument(
        content=file_bytes,
        mime_type=mime_type
    )
    request = documentai.ProcessRequest(
        name=processor_name,
        raw_document=raw_document
    )
    result = client.process_document(
        request=request,
        timeout=60,
    )
    return result.document.text