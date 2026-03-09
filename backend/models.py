"""
models.py — Pydantic request/response models.
These define exactly what the React frontend sends and receives.
"""

from pydantic import BaseModel
from typing import Optional, List


# ── Auth ──────────────────────────────────────────────────────────────────

class RegisterBody(BaseModel):
    name:     str
    email:    Optional[str] = None
    phone:    Optional[str] = None
    location: Optional[str] = None
    password: str

class LoginBody(BaseModel):
    identifier: str          # email or phone number
    password:   str

class UserOut(BaseModel):
    id:       int
    name:     str
    email:    Optional[str] = None
    phone:    Optional[str] = None
    location: Optional[str] = None
    created_at: str

class TokenOut(BaseModel):
    token: str
    user:  UserOut


# ── Analysis ──────────────────────────────────────────────────────────────

class SummaryOut(BaseModel):
    impression:      str
    keyFindings:     str
    recommendations: str

class EntityOut(BaseModel):
    text: str
    type: str          # diagnosis | symptom | lab | medication

class AnomalyOut(BaseModel):
    name:     str
    value:    str      # formatted string e.g. "10.2 g/dL"
    ref:      str      # e.g. "Normal: 13.5–17.5 g/dL"
    severity: str      # critical | warning | normal

class AnalysisOut(BaseModel):
    reportId:   int
    filename:   str
    analyzedAt: str
    summary:    SummaryOut
    entities:   List[EntityOut]
    anomalies:  List[AnomalyOut]


# ── History ───────────────────────────────────────────────────────────────

class HistoryItem(BaseModel):
    id:       int
    filename: str
    date:     str
    critical: int
    warnings: int
