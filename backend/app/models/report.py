from pydantic import BaseModel
from typing import Literal

class TestResult(BaseModel):
    test_name: str
    result: str | None = None
    unit: str | None = None
    reference_range: str | None = None
    method: str | None = None
    medical_topic: str | None = None
    interpretation_notes: list[str] = []

class ExtractedReport(BaseModel):
    report_type: str | None = None
    patient_age: int | None = None
    patient_gender: str | None = None
    tests: list[TestResult]

class TestInterpretation(BaseModel):
    test_name: str
    result: str
    unit: str | None = None
    reference_range: str | None = None
    medical_topic: str
    result_status: Literal[
        "within_range",
        "below_range",
        "above_range",
        "positive",
        "negative",
        "detected",
        "not_detected",
        "inconclusive",
        "cannot_determine",
    ]
    meaning: str
    explanation: str
    caution: str | None = None

class MedicalInterpretation(BaseModel):
    interpretations: list[TestInterpretation]
    overall_summary: str
    when_to_discuss_with_doctor: str