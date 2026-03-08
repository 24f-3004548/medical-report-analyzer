"""
main.py — Veris FastAPI backend.

Run:
    uvicorn main:app --reload

Docs:
    http://localhost:8000/docs
"""

import os
from fastapi import FastAPI, UploadFile, File, Header, HTTPException, Depends, Body
from fastapi.middleware.cors import CORSMiddleware

from database import get_db, init_db
from models import RegisterBody, LoginBody, TokenOut, UserOut, AnalysisOut, HistoryItem
from auth import hash_password, verify_password, generate_session_token

# ── App setup ─────────────────────────────────────────────────────────────
app = FastAPI(title="Veris API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create all tables on startup
@app.on_event("startup")
def startup():
    init_db()

# Upload folder for file storage (replace with S3 in production)
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# ── Auth dependency ───────────────────────────────────────────────────────
def get_current_user(authorization: str = Header(...)):
    """
    Reads the session token from the Authorization header,
    looks it up in the sessions table, and returns the user row.

    If the token doesn't exist in the DB the request is rejected with 401.
    Logout just deletes the row — no token expiry complexity needed.
    """
    token = authorization.removeprefix("Bearer ").strip()

    db  = get_db()
    row = db.execute(
        """
        SELECT users.id, users.name, users.email, users.phone, users.location, users.created_at
        FROM sessions
        JOIN users ON users.id = sessions.user_id
        WHERE sessions.id = ?
        """,
        (token,)
    ).fetchone()
    db.close()

    if not row:
        raise HTTPException(status_code=401, detail="Invalid or expired session. Please log in again.")

    return dict(row)


# ════════════════════════════════════════════════════════════════════════════
# AUTH ROUTES
# ════════════════════════════════════════════════════════════════════════════

@app.post("/api/auth/register", response_model=TokenOut)
def register(body: RegisterBody):
    """
    Create a new account.
    Frontend sends: { name, email, phone, location, password }
    Returns:        { token, user }
    """
    if not body.email and not body.phone:
        raise HTTPException(400, "Provide at least an email or phone number.")

    db = get_db()

    # Check for duplicate
    existing = db.execute(
        "SELECT id FROM users WHERE email = ? OR phone = ?",
        (body.email, body.phone)
    ).fetchone()
    if existing:
        db.close()
        raise HTTPException(409, "An account with that email or phone already exists.")

    cursor = db.execute(
        """
        INSERT INTO users (name, email, phone, password_hash, location)
        VALUES (?, ?, ?, ?, ?)
        """,
        (body.name, body.email, body.phone,
         hash_password(body.password), body.location)
    )
    user_id = cursor.lastrowid

    # Create a session row — this IS the token
    token = generate_session_token()
    db.execute(
        "INSERT INTO sessions (id, user_id) VALUES (?, ?)",
        (token, user_id)
    )
    created_at = db.execute(
        "SELECT created_at FROM users WHERE id = ?", (user_id,)
    ).fetchone()["created_at"]

    db.commit()
    db.close()

    return {
        "token": token,
        "user": {
            "id": user_id,
            "name": body.name,
            "email": body.email,
            "phone": body.phone,
            "location": body.location,
            "created_at": created_at,
        },
    }


@app.post("/api/auth/login", response_model=TokenOut)
def login(body: dict = Body(...)):
    """
    Log in with email or phone + password.
    Frontend sends: { identifier: "email or phone", password }
    Also allows: { email, password } or { phone, password }
    Returns:        { token, user }
    """
    if body.get("email") or body.get("phone"):
        identifier = body.get("email") or body.get("phone")
        password   = body.get("password")

    if not identifier or not password:
        raise HTTPException(400, "Missing login credentials.")

    db = get_db()
    user = db.execute(
        "SELECT * FROM users WHERE email = ? OR phone = ?",
        (identifier, identifier)
    ).fetchone()
    db.close()

    if not user or not verify_password(password, user["password_hash"]):
        raise HTTPException(401, "Incorrect credentials.")

    # Create a new session row for this login
    token = generate_session_token()
    db2   = get_db()
    db2.execute(
        "INSERT INTO sessions (id, user_id) VALUES (?, ?)",
        (token, user["id"])
    )
    db2.commit()
    db2.close()

    return {
        "token": token,
        "user":  {
            "id":       user["id"],
            "name":     user["name"],
            "email":    user["email"],
            "phone":    user["phone"],
            "location": user["location"],
            "created_at": user["created_at"]
        },
    }


@app.delete("/api/auth/logout")
def logout(authorization: str = Header(...)):
    """
    Logout — delete the session row from the DB.
    The token is immediately invalid for all future requests.
    """
    token = authorization.removeprefix("Bearer ").strip()
    db    = get_db()
    db.execute("DELETE FROM sessions WHERE id = ?", (token,))
    db.commit()
    db.close()
    return {"ok": True}


@app.get("/api/auth/me", response_model=UserOut)
def me(current_user: dict = Depends(get_current_user)):
    """
    Returns the currently logged-in user.
    Useful to restore session on page refresh.
    """
    return current_user


# ════════════════════════════════════════════════════════════════════════════
# ANALYSIS ROUTE
# ════════════════════════════════════════════════════════════════════════════

@app.post("/api/analyze", response_model=AnalysisOut)
def analyze(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    """
    Upload a medical report file and run analysis.
    Frontend sends: FormData { file } + Authorization header
    Returns:        AnalysisOut (summary, entities, anomalies)

    ── PIPELINE ─────────────────────────────────────────────────
    Replace the mock_pipeline() call below with your real NLP code.
    Recommended libraries:
      - pdfplumber / PyMuPDF  → extract text from PDF
      - scispaCy / medspaCy   → NER (entities)
      - Your reference-range DB → anomaly scoring
      - Claude API / BioGPT   → plain-language summary
    ─────────────────────────────────────────────────────────────
    """
    content   = file.file.read()
    file_size = len(content)

    # Save file to disk (replace with S3 upload in production)
    save_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(save_path, "wb") as f:
        f.write(content)

    db = get_db()

    # 1. Create report record
    report_id = db.execute(
        "INSERT INTO reports (user_id, title) VALUES (?, ?) RETURNING id",
        (current_user["id"], file.filename)
    ).fetchone()["id"]

    # 2. Save file metadata
    db.execute(
        """
        INSERT INTO files (report_id, storage_url, file_type, file_size)
        VALUES (?, ?, ?, ?)
        """,
        (report_id, save_path, file.content_type or "unknown", file_size)
    )

    # 3. Create analysis run
    run_id = db.execute(
        "INSERT INTO analysis_runs (report_id, status) VALUES (?, 'running') RETURNING id",
        (report_id,)
    ).fetchone()["id"]
    db.commit()

    # ── NLP PIPELINE ─────────────────────────────────────────────
    # Replace this function with your real pipeline.
    # It should accept the raw file bytes + content_type
    # and return the dict below.
    result = mock_pipeline(content, file.content_type)
    # ─────────────────────────────────────────────────────────────

    # 4. Save analysis results
    db.execute(
        """
        INSERT INTO analysis_results (run_id, impression, key_findings, recommendations)
        VALUES (?, ?, ?, ?)
        """,
        (
            run_id,
            result["summary"]["impression"],
            result["summary"]["keyFindings"],
            result["summary"]["recommendations"],
        )
    )

    # 5. Save entities
    for e in result["entities"]:
        db.execute(
            "INSERT INTO entities (run_id, text, type) VALUES (?, ?, ?)",
            (run_id, e["text"], e["type"])
        )

    # 6. Save anomalies
    for a in result["anomalies"]:
        db.execute(
            """
            INSERT INTO anomalies (run_id, name, value, unit, reference, severity)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (run_id, a["name"], a["value"], a["unit"], a["reference"], a["severity"])
        )

    # 7. Mark run complete
    db.execute(
        "UPDATE analysis_runs SET status='completed', completed_at=datetime('now') WHERE id=?",
        (run_id,)
    )
    db.commit()
    db.close()

    # 8. Return in the shape the React frontend expects
    return {
        "reportId":   report_id,
        "filename":   file.filename,
        "analyzedAt": "Just now",
        "summary":    result["summary"],
        "entities":   result["entities"],
        "anomalies": [
            {
                "name":     a["name"],
                "value":    f"{a['value']} {a['unit']}",
                "ref":      f"Normal: {a['reference']}",
                "severity": a["severity"],
            }
            for a in result["anomalies"]
        ],
    }


# ════════════════════════════════════════════════════════════════════════════
# HISTORY ROUTES
# ════════════════════════════════════════════════════════════════════════════

@app.get("/api/reports")
def get_reports(current_user: dict = Depends(get_current_user)):
    """
    Returns all reports for the logged-in user, with anomaly counts.
    Used to populate the history panel on the Profile screen.
    """
    db   = get_db()
    rows = db.execute(
        """
        SELECT
            r.id,
            r.title                                                        AS filename,
            strftime('%d %b %Y', r.created_at)                            AS date,
            COUNT(CASE WHEN a.severity = 'critical' THEN 1 END)           AS critical,
            COUNT(CASE WHEN a.severity = 'warning'  THEN 1 END)           AS warnings
        FROM reports r
        LEFT JOIN analysis_runs ar ON ar.report_id = r.id
        LEFT JOIN anomalies      a  ON a.run_id     = ar.id
        WHERE r.user_id = ?
        GROUP BY r.id
        ORDER BY r.created_at DESC
        """,
        (current_user["id"],)
    ).fetchall()
    db.close()
    return [dict(r) for r in rows]


@app.get("/api/reports/{report_id}", response_model=AnalysisOut)
def get_report(report_id: int, current_user: dict = Depends(get_current_user)):
    """
    Returns the full analysis for a single report.
    Used when the user clicks a history item on the Profile screen.
    """
    db = get_db()

    # Verify ownership
    report = db.execute(
        "SELECT * FROM reports WHERE id = ? AND user_id = ?",
        (report_id, current_user["id"])
    ).fetchone()
    if not report:
        db.close()
        raise HTTPException(404, "Report not found")

    # Get the most recent completed run for this report
    run = db.execute(
        "SELECT * FROM analysis_runs WHERE report_id = ? AND status = 'completed' ORDER BY id DESC LIMIT 1",
        (report_id,)
    ).fetchone()
    if not run:
        db.close()
        raise HTTPException(404, "No completed analysis found for this report")

    run_id = run["id"]

    result_row = db.execute(
        "SELECT * FROM analysis_results WHERE run_id = ?", (run_id,)
    ).fetchone()

    entities = db.execute(
        "SELECT text, type FROM entities WHERE run_id = ?", (run_id,)
    ).fetchall()

    anomalies = db.execute(
        "SELECT name, value, unit, reference, severity FROM anomalies WHERE run_id = ?",
        (run_id,)
    ).fetchall()

    db.close()

    return {
        "reportId":   report_id,
        "filename":   report["title"],
        "analyzedAt": run["completed_at"] or run["started_at"],
        "summary": {
            "impression":      result_row["impression"]      if result_row else "",
            "keyFindings":     result_row["key_findings"]    if result_row else "",
            "recommendations": result_row["recommendations"] if result_row else "",
        },
        "entities": [{"text": e["text"], "type": e["type"]} for e in entities],
        "anomalies": [
            {
                "name":     a["name"],
                "value":    f"{a['value']} {a['unit'] or ''}".strip(),
                "ref":      f"Normal: {a['reference']}" if a["reference"] else "",
                "severity": a["severity"],
            }
            for a in anomalies
        ],
    }


# ════════════════════════════════════════════════════════════════════════════
# MOCK NLP PIPELINE
# Replace this entire function with your real NLP pipeline.
# ════════════════════════════════════════════════════════════════════════════

def mock_pipeline(content: bytes, content_type: str) -> dict:
    """
    Placeholder that returns hardcoded data.
    Replace with:
        text     = extract_text(content, content_type)   # pdfplumber / OCR
        entities = run_ner(text)                         # scispaCy
        anomalies = check_reference_ranges(entities)     # LOINC DB
        summary  = generate_summary(text, anomalies)     # Claude API / BioGPT
    """
    return {
        "summary": {
            "impression":      "54-year-old male presenting with fatigue and shortness of breath on exertion.",
            "keyFindings":     "CBC shows Hb 10.2 g/dL (anemia). Creatinine 1.48 mg/dL (CKD Stage 2). LDL 182 mg/dL elevated.",
            "recommendations": "Gastroenterology referral for anemia workup. Nephrology follow-up. Initiate statin therapy. Repeat CBC in 6 weeks.",
        },
        "entities": [
            {"text": "Normocytic Anemia",  "type": "diagnosis"},
            {"text": "CKD Stage 2",        "type": "diagnosis"},
            {"text": "Hyperlipidemia",     "type": "diagnosis"},
            {"text": "Shortness of Breath","type": "symptom"},
            {"text": "Fatigue",            "type": "symptom"},
            {"text": "Chest Discomfort",   "type": "symptom"},
            {"text": "Hemoglobin",         "type": "lab"},
            {"text": "LDL Cholesterol",    "type": "lab"},
            {"text": "Creatinine",         "type": "lab"},
            {"text": "eGFR",               "type": "lab"},
            {"text": "Statin Therapy",     "type": "medication"},
        ],
        "anomalies": [
            {"name": "Hemoglobin",           "value": 10.2, "unit": "g/dL",  "reference": "13.5–17.5 g/dL", "severity": "critical"},
            {"name": "LDL Cholesterol",      "value": 182,  "unit": "mg/dL", "reference": "< 100 mg/dL",    "severity": "critical"},
            {"name": "Creatinine",           "value": 1.48, "unit": "mg/dL", "reference": "0.74–1.35",      "severity": "warning"},
            {"name": "eGFR",                 "value": 62,   "unit": "mL/min","reference": "≥ 60 mL/min",    "severity": "warning"},
            {"name": "Blood Glucose (Fast)", "value": 94,   "unit": "mg/dL", "reference": "70–99 mg/dL",    "severity": "normal"},
            {"name": "Chest X-Ray",          "value": 0,    "unit": "",      "reference": "No acute findings","severity": "normal"},
        ],
    }
    