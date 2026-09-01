import os
from dotenv import load_dotenv
from google import genai
from google.genai import types
from app.models.report import ExtractedReport
from app.prompts.extraction import EXTRACTION_PROMPT
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
    http_options=types.HttpOptions(timeout=120000),
)

def _extract_with_gemini(prompt: str) -> ExtractedReport:
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config={
            "response_mime_type": "application/json",
            "response_schema": ExtractedReport,
        },
    )

    return ExtractedReport.model_validate_json(response.text)


def _find_suspicious_tests(extracted: ExtractedReport,) -> list:
    suspicious = []
    for test in extracted.tests:
        if not test.test_name:
            suspicious.append(test)
        elif test.result is None:
            suspicious.append(test)
    return suspicious

def _verify_extraction(raw_text: str, extracted: ExtractedReport,) -> ExtractedReport:
    suspicious = _find_suspicious_tests(extracted)
    if not suspicious:
        return extracted
    suspicious_names = [
        test.test_name
        for test in suspicious
    ]
    verification_prompt = f"""
    You previously extracted structured laboratory results from a
    medical report.

    The following tests may have been extracted incorrectly or may
    have missing results:

    {suspicious_names}

    Previous extraction:

    {extracted.model_dump_json(indent=2)}

    Re-check these tests carefully against the ORIGINAL report text
    below.

    --- BEGIN ORIGINAL REPORT ---

    {raw_text}

    --- END ORIGINAL REPORT ---

    IMPORTANT:

    - Find the exact occurrence of each suspicious test in the report.
    - Check whether a result is actually present.
    - If a result is present, extract it exactly as printed.
    - Extract the corresponding unit exactly as printed.
    - Extract the corresponding reference range exactly as printed.
    - Extract the corresponding method if present.
    - Do not copy a result from another test.
    - Do not combine separate test rows.
    - Do not infer missing values.
    - If the result is genuinely absent, keep it null.
    - Preserve the original test name.
    - Preserve numerical values exactly.
    - Preserve qualitative values exactly.

    Return the COMPLETE corrected ExtractedReport.

    Do not remove tests that were correctly extracted previously.
    Do not add tests that are not present in the original report.
    """
    corrected = _extract_with_gemini(verification_prompt)
    return corrected


def extract_medical_results(raw_text: str) -> ExtractedReport:
    prompt = f"""
    {EXTRACTION_PROMPT}

    Here is the medical report:

    --- BEGIN REPORT ---

    {raw_text}

    --- END REPORT ---
    """
    extracted = _extract_with_gemini(prompt)
    suspicious = _find_suspicious_tests(extracted)
    if suspicious:
        extracted = _verify_extraction(
            raw_text,
            extracted,
        )
    return extracted