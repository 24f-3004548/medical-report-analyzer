import os
from dotenv import load_dotenv
from google import genai
from app.models.report import MedicalInterpretation
from app.prompts.interpretation import INTERPRETATION_PROMPT
load_dotenv()

PROJECT_ID = os.getenv("GOOGLE_CLOUD_PROJECT_ID")
LOCATION = os.getenv("GOOGLE_CLOUD_LOCATION")
if not PROJECT_ID:
    raise ValueError("GOOGLE_CLOUD_PROJECT_ID is missing from .env")
if not LOCATION:
    raise ValueError("GOOGLE_CLOUD_LOCATION is missing from .env")
client = genai.Client(
    vertexai=True,
    project=PROJECT_ID,
    location=LOCATION,
)

def interpret_medical_results(
    extracted_report,
    medical_knowledge,
) -> MedicalInterpretation:
    prompt = f"""
    {INTERPRETATION_PROMPT}

    ========== EXTRACTED LABORATORY RESULTS ==========

    {extracted_report}

    ========== MEDICAL KNOWLEDGE ==========

    {medical_knowledge}

    ========== END INPUT ==========
    """
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config={
            "response_mime_type": "application/json",
            "response_schema": MedicalInterpretation,
        },
    )
    return MedicalInterpretation.model_validate_json(response.text)