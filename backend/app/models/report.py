from pydantic import BaseModel, ConfigDict, Field
from typing import Literal

class TestResult(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    
    test_name: str = Field(alias="testName")
    result: str | None = None
    unit: str | None = None
    reference_range: str | None = Field(None, alias="referenceRange")
    method: str | None = None
    medical_topic: str | None = Field(None, alias="medicalTopic")
    interpretation_notes: list[str] = Field(default_factory=list, alias="interpretationNotes")

class ExtractedReport(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    
    report_type: str | None = Field(None, alias="reportType")
    date_of_test: str | None = Field(None, alias="dateOfTest")
    patient_date_of_birth: str | None = Field(None, alias="patientDateOfBirth")
    patient_gender: str | None = Field(None, alias="patientGender")
    tests: list[TestResult]

class TestInterpretation(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    
    test_name: str = Field(alias="testName")
    result: str
    unit: str | None = None
    reference_range: str | None = Field(None, alias="referenceRange")
    medical_topic: str = Field(alias="medicalTopic")
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
    ] = Field(alias="resultStatus")
    meaning: str
    explanation: str
    caution: str | None = None

class MedicalInterpretation(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    
    interpretations: list[TestInterpretation]
    overall_summary: str = Field(alias="overallSummary")
    when_to_discuss_with_doctor: str = Field(alias="whenToDiscussWithDoctor")