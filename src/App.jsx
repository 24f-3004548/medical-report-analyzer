/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║                       VERIS — Medical Report Analyzer                    ║
 * ║                        Frontend — React Single File                      ║
 * ╠══════════════════════════════════════════════════════════════════════════╣
 * ║  SCREENS:  Home · Upload · Results · About · Login · Register · Profile  ║
 * ║  FONTS:    Lora (headings) + DM Sans (body) via Google Fonts             ║
 * ║  PALETTE:  Brand-accurate per Veris Brand Book v1.0                      ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * ── BACKEND INTEGRATION OVERVIEW ───────────────────────────────────────────
 *
 *  This file is self-contained with mock data. To wire a real backend,
 *  look for the comments marked:
 *
 *    // ⚙ BACKEND — <what to replace>
 *
 *  The expected API shape is documented alongside each call site.
 *
 *  Recommended stack: FastAPI / Node (Express) + Python NLP pipeline
 *  Auth: Bearer token in Authorization header (add to every fetch below)
 *
 * ───────────────────────────────────────────────────────────────────────────
 */

import { useState, useRef, useCallback } from "react";
import "./App.css";

/* ── Google Fonts injection ─────────────────────────────────────────────── */
const FONT_LINK = document.createElement("link");
FONT_LINK.rel  = "stylesheet";
FONT_LINK.href = "https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,500;0,600;1,400;1,500&family=DM+Sans:wght@400;500;600&display=swap";
document.head.appendChild(FONT_LINK);

/* ══════════════════════════════════════════════════════════════════════════
   MOCK DATA
   ══════════════════════════════════════════════════════════════════════════ */
const MOCK_RESULT = {
  filename: "Patient_Report_2024.pdf",
  analyzedAt: "Just now",

  /* ── Summary section ── */
  summary: {
    impression:       "54-year-old male presenting with fatigue, shortness of breath on exertion, and mild chest discomfort.",
    keyFindings:      "CBC shows hemoglobin 10.2 g/dL consistent with normocytic anemia. Creatinine elevated at 1.48 mg/dL indicating CKD Stage 2. LDL cholesterol of 182 mg/dL exceeds optimal threshold.",
    recommendations:  "Gastroenterology referral for anemia workup. Nephrology follow-up for CKD monitoring. Initiation of statin therapy. Repeat CBC in 6 weeks.",
  },

  /* ── Extracted entities ── */
  entities: [
    { text: "Normocytic Anemia", type: "diagnosis"  },
    { text: "CKD Stage 2",       type: "diagnosis"  },
    { text: "Hyperlipidemia",    type: "diagnosis"  },
    { text: "Shortness of Breath",type: "symptom"   },
    { text: "Fatigue",           type: "symptom"    },
    { text: "Chest Discomfort",  type: "symptom"    },
    { text: "Hemoglobin",        type: "lab"        },
    { text: "LDL Cholesterol",   type: "lab"        },
    { text: "Creatinine",        type: "lab"        },
    { text: "eGFR",              type: "lab"        },
    { text: "Statin Therapy",    type: "medication" },
  ],

  /* ── Anomaly rows ── */
  anomalies: [
    { name: "Hemoglobin",           value: "10.2 g/dL",        ref: "Normal: 13.5–17.5 g/dL", severity: "critical" },
    { name: "LDL Cholesterol",      value: "182 mg/dL",         ref: "Optimal: < 100 mg/dL",  severity: "critical" },
    { name: "Creatinine",           value: "1.48 mg/dL",        ref: "Normal: 0.74–1.35",     severity: "warning"  },
    { name: "eGFR",                 value: "62 mL/min",         ref: "Normal: ≥ 60 mL/min",   severity: "warning"  },
    { name: "Blood Glucose (Fast)", value: "94 mg/dL",          ref: "Normal: 70–99 mg/dL",   severity: "normal"   },
    { name: "Chest X-Ray",          value: "No acute findings", ref: "—",                     severity: "normal"   },
  ],
};

/* ══════════════════════════════════════════════════════════════════════════
   CONSTANTS & HELPERS
   ══════════════════════════════════════════════════════════════════════════ */
const ENTITY_STYLES = {
  diagnosis:  { color: "#7C3AED", bg: "#F5F0FF", border: "#DDD6FE" },
  symptom:    { color: "#C0392B", bg: "#FDECEA", border: "#F5B7B1" },
  lab:        { color: "#B7691A", bg: "#FDF3E3", border: "#F5CBA7" },
  medication: { color: "#1A6E3C", bg: "#EAF4EE", border: "#A9DFBF" },
};

const SEVERITY_STYLES = {
  critical: { bg: "#FDECEA", border: "#F5B7B1", stripe: "#C0392B", valueColor: "#C0392B" },
  warning:  { bg: "#FDF3E3", border: "#F5CBA7", stripe: "#B7691A", valueColor: "#B7691A" },
  normal:   { bg: "#EAF4EE", border: "#A9DFBF", stripe: "#2D6A4F", valueColor: "#2D6A4F" },
};

/* ══════════════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ══════════════════════════════════════════════════════════════════════════ */

/* Logo mark SVG */
function LogoMark({ size = 32 }) {
  const arm = size * 0.28;
  const mid = size / 2;
  return (
    <div className="logo-mark" style={{ width: size, height: size, borderRadius: size * 0.28 }}>
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 20 20">
        <line x1="10" y1={10 - arm * 1.6} x2="10" y2={10 + arm * 1.6}
              stroke="white" strokeWidth="2.4" strokeLinecap="round" />
        <line x1={10 - arm * 1.6} y1="10" x2={10 + arm * 1.6} y2="10"
              stroke="white" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    </div>
  );
}

/* Navigation bar */
function Nav({ page, setPage, user }) {
  const links = [
    { key: "home",   label: "Home"     },
    { key: "upload", label: "Analyze"  },
    { key: "about",  label: "About Us" },
  ];
  const activeKey = page === "results" ? "upload"
                  : page === "profile" || page === "login" || page === "register" ? "account"
                  : page;

  const initials = user
    ? user.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
    : null;

  return (
    <nav className="nav">
      <div className="nav-inner">
        <div className="logo" onClick={() => setPage("home")}>
          <LogoMark size={32} />
          <span className="logo-name">Veris</span>
        </div>
        <div className="nav-links">
          {links.map(({ key, label }) => (
            <button
              key={key}
              className={`nav-link ${activeKey === key ? "active" : ""}`}
              onClick={() => setPage(key)}
            >
              {label}
            </button>
          ))}

          {/* Account tab — always visible as a nav link */}
          <button
            className={`nav-link account-tab ${activeKey === "account" ? "active" : ""}`}
            onClick={() => setPage(user ? "profile" : "login")}
          >
            {initials ? (
              <>
                Hi {user.name.split(" ")[0]}
              </>
            ) : (
              <>Account</>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}

/* Trust pill row */
function TrustRow() {
  const items = ["No data stored", "Local session only", "Free-to-use"];
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", justifyContent: "center" }}>
      {items.map((t) => (
        <div key={t} className="trust-pill">
          <div className="trust-check">✓</div>
          {t}
        </div>
      ))}
    </div>
  );
}

/* Entity tag */
function EntityTag({ entity }) {
  const s = ENTITY_STYLES[entity.type] || ENTITY_STYLES.lab;
  return (
    <span
      className="entity-tag"
      style={{ color: s.color, borderColor: s.border, background: s.bg }}
    >
      {entity.text}
    </span>
  );
}

/* Anomaly row */
function AnomalyRow({ anomaly, delay = 0 }) {
  const s = SEVERITY_STYLES[anomaly.severity] || SEVERITY_STYLES.normal;
  return (
    <div
      className="anomaly-row anim-fade-up"
      style={{
        background: s.bg,
        borderColor: s.border,
        animationDelay: `${delay}s`,
      }}
    >
      <div className="anomaly-stripe" style={{ background: s.stripe }} />
      <div>
        <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)", marginBottom: 3 }}>
          {anomaly.name}
        </div>
        <div style={{ fontSize: 12, color: "var(--faint)" }}>{anomaly.ref}</div>
      </div>
      <div style={{ fontWeight: 700, fontSize: 14, color: s.valueColor, flexShrink: 0 }}>
        {anomaly.value}
      </div>
    </div>
  );
}

/* Severity counts used in badge row */
function severityCounts(anomalies) {
  return anomalies.reduce(
    (acc, a) => { acc[a.severity] = (acc[a.severity] || 0) + 1; return acc; },
    {}
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   SCREEN: HOME
   ══════════════════════════════════════════════════════════════════════════ */
function HomeScreen({ setPage }) {
  return (
    <div className="page">

      {/* ── Hero ── */}
      <section style={{ background: "var(--surface)", paddingTop: 80, paddingBottom: 80, width: "100%" }}>
        <div className="container" style={{ textAlign: "center" }}>

          {/* AI pill */}
          <div className="anim-fade-up" style={{ marginBottom: 28 }}>
            <span className="badge badge-normal" style={{ fontSize: 12, padding: "5px 14px" }}>
              <span>✦</span> AI-powered · HIPAA-aware
            </span>
          </div>

          {/* Headline */}
          <h1 className="hero-h1 anim-fade-up anim-delay-1" style={{ marginBottom: 20, maxWidth: 700, margin: "0 auto 20px" }}>
            Understand your medical reports <em>at a glance.</em>
          </h1>

          {/* Sub */}
          <p className="anim-fade-up anim-delay-2" style={{
            color: "var(--muted)", fontSize: 17, maxWidth: 520,
            margin: "0 auto 36px", lineHeight: 1.65,
          }}>
            Upload any lab report and get a plain-language summary,
            flagged values and extracted insights instantly.
          </p>

          {/* CTAs */}
          <div className="anim-fade-up anim-delay-3" style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 40 }}>
            <button className="btn btn-primary btn-lg" onClick={() => setPage("upload")}>
              Upload a report →
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => setPage("about")}>
              Learn more
            </button>
          </div>

          {/* Trust row */}
          <div className="anim-fade-up anim-delay-4">
            <TrustRow />
          </div>
        </div>
      </section>

      {/* ── Feature cards ── */}
      <section style={{ padding: "72px 0", background: "var(--bg)", width: "100%" }}>
        <div className="container">
          <p className="section-label" style={{ textAlign: "center" }}>Core Capabilities</p>
          <h2 style={{
            fontFamily: "'Lora', serif", fontSize: 28, fontWeight: 600,
            textAlign: "center", marginBottom: 48, color: "var(--text)",
          }}>
            Everything you need from a single upload
          </h2>
          <div className="features-grid" style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 20,
          }}>
            {[
              { icon: "🔍", title: "Entity Extraction",
                desc: "Automatically identifies diagnoses, medications, lab values and symptoms from unstructured clinical text." },
              { icon: "⚠️", title: "Anomaly Detection",
                desc: "Flags values outside reference ranges into critical, borderline or normal with colour-coded severity." },
              { icon: "📋", title: "Plain-Language Summary",
                desc: "Turns dense clinical language into a clear, structured summary any patient or clinician can act on." },
            ].map((f, i) => (
              <div key={f.title} className={`feature-card anim-fade-up anim-delay-${i + 1}`}>
                <div className="feature-icon">{f.icon}</div>
                <h3 style={{ fontWeight: 600, fontSize: 16, marginBottom: 10 }}>{f.title}</h3>
                <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.65, textAlign: "justify" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer bar ── */}
      <footer className="footer">
        <span>© 2026 Veris v1.0</span>
        <span>Made with ♥ for better health literacy</span>
      </footer>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   SCREEN: UPLOAD
   ══════════════════════════════════════════════════════════════════════════ */
function UploadScreen({ setPage, setResult, user, setUser, token }) {
  const API = "http://localhost:8000";
  const [file,       setFile]       = useState(null);
  const [dragOver,   setDragOver]   = useState(false);
  const [uploading,  setUploading]  = useState(false);
  const [progress,   setProgress]   = useState(0);
  const [stepIndex,  setStepIndex]  = useState(0);
  const [error,      setError]      = useState(null);
  const inputRef = useRef();

  const STEPS = ["Uploading", "Parsing", "Analysing", "Done"];

  /* ── Auth gate — show login prompt if not logged in ── */
  if (!user) {
    return (
      <div className="page">
        <section style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "56px 0", width: "100%" }}>
          <div className="container" style={{ maxWidth: 480 }}>
            <div className="anim-fade-up" style={{ textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
              <h2 style={{ fontFamily: "'Lora', serif", fontSize: 26, fontWeight: 600, marginBottom: 12 }}>
                Sign in to continue
              </h2>
              <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.65, marginBottom: 32, maxWidth: 380, margin: "0 auto 32px" }}>
                You need a Veris account to upload and analyze reports. Your results are saved securely to your profile.
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                <button className="btn btn-primary btn-lg" onClick={() => setPage("login")}>Log in</button>
                <button className="btn btn-secondary btn-lg" onClick={() => setPage("register")}>Create account</button>
              </div>
            </div>
          </div>
        </section>
        {/* ── Footer bar ── */}
      <footer className="footer">
        <span>© 2026 Veris v1.0</span>
        <span>Made with ♥ for better health literacy</span>
      </footer>
      </div>
    );
  }

  /* ── File selection ── */
  const handleFile = useCallback((f) => {
    if (!f) return;
    const allowed = ["application/pdf", "image/jpeg", "image/png", "text/plain"];
    if (!allowed.includes(f.type)) {
      setError("Unsupported file type. Please upload PDF, JPG, PNG or TXT.");
      return;
    }
    if (f.size > 20 * 1024 * 1024) {
      setError("File too large. Maximum size is 20 MB.");
      return;
    }
    setError(null);
    setFile(f);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  /* ══════════════════════════════════════════════════════════════════════
     ⚙ BACKEND — MAIN UPLOAD + ANALYSIS FUNCTION
     ════════════════════════════════════════════════════════════════════

     Replace the simulated progress below with a real fetch call.

     1. Create a FormData object and append the file.
     2. POST to your analysis endpoint.
     3. Parse the JSON response and pass it to setResult().
     4. Call setPage("results").

     Example:
     ─────────
       const formData = new FormData();
       formData.append("file", file);

       const res = await fetch("https://your-api.com/api/analyze", {
         method:  "POST",
         headers: { Authorization: `Bearer ${YOUR_TOKEN}` },
         body:    formData,
       });

       if (!res.ok) throw new Error(await res.text());
       const data = await res.json();
       // data should match the shape of MOCK_RESULT above

       setResult(data);
       setPage("results");

     For upload progress with XHR (instead of fetch):
     ─────────────────────────────────────────────────
       const xhr = new XMLHttpRequest();
       xhr.upload.onprogress = (e) => {
         if (e.lengthComputable) setProgress(Math.round(e.loaded / e.total * 100));
       };
       xhr.open("POST", "https://your-api.com/api/analyze");
       xhr.send(formData);

     ══════════════════════════════════════════════════════════════════════ */
  const handleAnalyze = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    setProgress(0);
    setStepIndex(0);

    try {
      // ── POST /api/analyze ─────────────────────────────────────
      // Use XHR so we can track upload progress in the progress bar.
      const analysisResult = await new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append("file", file);

        const xhr = new XMLHttpRequest();

        // Upload progress → steps 0–1 (0–50%)
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 50);
            setProgress(pct);
            setStepIndex(pct < 25 ? 0 : 1);
          }
        };

        // Processing progress → steps 2–3 (50–100%) simulated
        xhr.onload = async () => {
          // Simulate "Analysing" step while server processes
          setProgress(75); setStepIndex(2);
          await new Promise(r => setTimeout(r, 400));
          setProgress(100); setStepIndex(3);

          if (xhr.status >= 200 && xhr.status < 300) {
            try { resolve(JSON.parse(xhr.responseText)); }
            catch { reject(new Error("Invalid response from server.")); }
          } else {
            try { reject(new Error(JSON.parse(xhr.responseText).detail || "Analysis failed.")); }
            catch { reject(new Error(`Server error ${xhr.status}`)); }
          }
        };

        xhr.onerror = () => reject(new Error("Network error — is the backend running?"));

        xhr.open("POST", `${API}/api/analyze`);
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        xhr.send(formData);
      });

      // analysisResult matches AnalysisOut from the backend
      setResult(analysisResult);

      // Update profile history immediately without a second fetch
      if (user && setUser) {
        const newEntry = {
          id:       analysisResult.reportId,
          filename: file.name,
          date:     new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
          critical: analysisResult.anomalies.filter(a => a.severity === "critical").length,
          warnings: analysisResult.anomalies.filter(a => a.severity === "warning").length,
        };
        setUser(prev => ({ ...prev, history: [newEntry, ...(prev.history || [])] }));
      }

      setPage("results");

    } catch (err) {
      setError(err.message || "Analysis failed. Please try again.");
      setUploading(false);
      setProgress(0);
      setStepIndex(0);
    }
  };

  return (
    <div className="page">
      <section style={{ flex: 1, padding: "56px 0", background: "var(--bg)", width: "100%" }}>
        <div className="container" style={{ maxWidth: 580 }}>

          {/* Header */}
          <div className="anim-fade-up" style={{ marginBottom: 32, textAlign: "center" }}>
            <h1 style={{
              fontFamily: "'Lora', serif", fontSize: 28, fontWeight: 600,
              color: "var(--text)", marginBottom: 8,
            }}>
              Upload a report
            </h1>
            <p style={{ color: "var(--muted)", fontSize: 14 }}>
              Supports PDF, JPG, PNG, and plain text up to 20 MB.
            </p>
          </div>

          {/* Steps */}
          <div className="anim-fade-up anim-delay-1" style={{ marginBottom: 28 }}>
            <div className="steps">
              {STEPS.map((s, i) => (
                <>
                  <div key={s} className={`step ${i < stepIndex ? "done" : i === stepIndex && uploading ? "active" : ""}`}>
                    <div className="step-dot">
                      {i < stepIndex ? "✓" : i + 1}
                    </div>
                    <span>{s}</span>
                  </div>
                  {i < STEPS.length - 1 && <div key={`line-${i}`} className="step-line" />}
                </>
              ))}
            </div>
          </div>

          {/* Card */}
          <div className="card card-padded anim-fade-up anim-delay-2">

            {/* Dropzone */}
            <div
              className={`dropzone ${dragOver ? "drag-over" : ""}`}
              style={{ marginBottom: 16 }}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => !uploading && inputRef.current?.click()}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.txt"
                style={{ display: "none" }}
                onChange={(e) => handleFile(e.target.files[0])}
                disabled={uploading}
              />
              <span className="dropzone-icon">📁</span>
              <p style={{ fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>
                Drop your file here
              </p>
              <p style={{ color: "var(--faint)", fontSize: 13, marginBottom: 14 }}>
                or click to browse
              </p>
              <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
                {[".pdf", ".jpg", ".png", ".txt"].map(ext => (
                  <span key={ext} style={{
                    fontSize: 11, fontWeight: 500,
                    background: "var(--border)", color: "var(--faint)",
                    padding: "2px 8px", borderRadius: 4,
                  }}>{ext}</span>
                ))}
              </div>
            </div>

            {/* File chip */}
            {file && (
              <div className="file-chip" style={{ marginBottom: 16 }}>
                <span>✓ &nbsp;{file.name}</span>
                <button
                  className="file-chip-remove"
                  onClick={() => { setFile(null); setProgress(0); setStepIndex(0); }}
                  disabled={uploading}
                >
                  ✕
                </button>
              </div>
            )}

            {/* Progress */}
            {uploading && (
              <div style={{ marginBottom: 16 }}>
                <div className="progress-track" style={{ marginBottom: 8 }}>
                  <div className="progress-fill" style={{ width: `${progress}%` }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted)" }}>
                  <span>{STEPS[stepIndex]}…</span>
                  <span>{progress}%</span>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={{
                background: "var(--red-lt)", border: "1px solid var(--red-bd)",
                borderRadius: 8, padding: "10px 14px",
                fontSize: 13, color: "var(--red)", marginBottom: 16,
              }}>
                ⚠ {error}
              </div>
            )}

            {/* Analyze button */}
            <button
              className="btn btn-primary btn-full"
              style={{ padding: "14px", fontSize: 15 }}
              onClick={handleAnalyze}
              disabled={!file || uploading}
            >
              {uploading
                ? <><div className="spinner" style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "#fff" }} /> Analysing…</>
                : "Run analysis"
              }
            </button>
          </div>

          {/* Privacy note */}
          <p className="anim-fade-up anim-delay-3" style={{
            textAlign: "center", fontSize: 12, color: "var(--faint)", marginTop: 16,
          }}>
            🔒 &nbsp;Your file is never stored. Processed in-session only.
          </p>
        </div>
      </section>
      <footer className="footer">
        <span>© 2025 Veris v1.0</span>
        <span>Made with ♥ for better health literacy</span>
      </footer>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   SCREEN: RESULTS
   ══════════════════════════════════════════════════════════════════════════ */
function ResultsScreen({ result, setPage, setResult }) {
  if (!result) { setPage("upload"); return null; }

  const counts = severityCounts(result.anomalies);

  const handleNewAnalysis = () => {
    /* ⚙ BACKEND — Clear any cached result / session state here if needed */
    setResult(null);
    setPage("upload");
  };

  return (
    <div className="page">
      <section style={{ flex: 1, padding: "40px 0 64px", width: "100%" }}>
        <div className="container">

          {/* ── Results header ── */}
          <div className="anim-fade-up" style={{
            display: "flex", alignItems: "flex-start",
            justifyContent: "space-between", flexWrap: "wrap",
            gap: 16, marginBottom: 32,
          }}>
            <div>
              <h1 style={{ fontFamily: "'Lora', serif", fontSize: 28, fontWeight: 600, marginBottom: 6 }}>
                Analysis results
              </h1>
              <p style={{ color: "var(--faint)", fontSize: 13 }}>
                {result.filename} &nbsp;·&nbsp; {result.analyzedAt}
              </p>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              {counts.critical > 0 && (
                <span className="badge badge-critical">⚠ {counts.critical} Critical</span>
              )}
              {counts.warning > 0 && (
                <span className="badge badge-warning">◆ {counts.warning} Warnings</span>
              )}
              <span className="badge badge-normal">✓ Complete</span>
            </div>
          </div>

          {/* ── Two-column grid ── */}
          <div className="results-grid" style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
            alignItems: "start",
          }}>

            {/* ─── LEFT: Clinical Summary ─────────────────────────────────── */}
            <div className="card anim-fade-up anim-delay-1" style={{ overflow: "hidden" }}>
              <div className="panel-header">
                <span>📋</span> Clinical Summary
              </div>
              <div style={{ padding: "24px 24px 28px" }}>

                {/* Impression */}
                <div style={{ marginBottom: 20 }}>
                  <p className="section-label">Impression</p>
                  {/*
                    ⚙ BACKEND — result.summary.impression
                    Comes from your NLP summarisation model output.
                    Recommended: BART / BioGPT / Claude API for summarisation.
                  */}
                  <p style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.65 }}>
                    {result.summary.impression}
                  </p>
                </div>

                {/* Key Findings */}
                <div style={{ marginBottom: 20 }}>
                  <p className="section-label">Key Findings</p>
                  {/*
                    ⚙ BACKEND — result.summary.keyFindings
                    Aggregate of flagged lab values and diagnoses.
                  */}
                  <p style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.65 }}>
                    {result.summary.keyFindings}
                  </p>
                </div>

                {/* Recommendations */}
                <div style={{ marginBottom: 24 }}>
                  <p className="section-label">Recommendations</p>
                  {/*
                    ⚙ BACKEND — result.summary.recommendations
                    Rule-based or LLM-generated clinical recommendations.
                  */}
                  <p style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.65 }}>
                    {result.summary.recommendations}
                  </p>
                </div>

                <div className="divider" style={{ marginBottom: 24 }} />

                {/* Entities */}
                <div>
                  <p className="section-label" style={{ marginBottom: 10 }}>Extracted Entities</p>

                  {/* Legend */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
                    {Object.entries(ENTITY_STYLES).map(([type, s]) => (
                      <div key={type} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--muted)" }}>
                        <div style={{ width: 9, height: 9, borderRadius: "50%", background: s.color }} />
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </div>
                    ))}
                  </div>

                  {/*
                    ⚙ BACKEND — result.entities
                    Array of { text: string, type: "diagnosis" | "symptom" | "lab" | "medication" }
                    Generated by your NER model (e.g. scispaCy, medspaCy, or fine-tuned BERT).
                  */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                    {result.entities.map((e, i) => (
                      <EntityTag key={i} entity={e} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ─── RIGHT: Anomaly Detection ───────────────────────────────── */}
            <div className="card anim-fade-up anim-delay-2" style={{ overflow: "hidden" }}>
              <div className="panel-header">
                <span>⚠️</span> Anomaly Detection
              </div>
              <div style={{ padding: "20px" }}>
                {/*
                  ⚙ BACKEND — result.anomalies
                  Array of:
                  {
                    name:     string,   — lab test / finding name
                    value:    string,   — patient's measured value
                    ref:      string,   — reference range label
                    severity: "critical" | "warning" | "normal"
                  }

                  Severity logic:
                    - Compare patient value against reference range DB (e.g. LOINC).
                    - "critical" = value outside critical limits
                    - "warning"  = value outside normal but inside critical limits
                    - "normal"   = value within normal range
                */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {result.anomalies.map((a, i) => (
                    <AnomalyRow key={a.name} anomaly={a} delay={i * 0.05} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Back button ── */}
          <div className="anim-fade-up" style={{ textAlign: "center", marginTop: 40 }}>
            <button className="btn btn-secondary" onClick={handleNewAnalysis}>
              ← Analyse another report
            </button>
          </div>

        </div>
      </section>
      <footer className="footer">
        <span>© 2025 Veris v1.0</span>
        <span>Made with ♥ for better health literacy</span>
      </footer>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   SCREEN: ABOUT
   ══════════════════════════════════════════════════════════════════════════ */
function AboutScreen({ setPage }) {
  const sections = [
    {
      num: "01", title: "Our Mission",
      desc: `Medical reports are written for clinicians, not patients. 
      Veris bridges that gap, turning dense lab results into plain language so anyone can understand their own health data, ask better questions, 
      and make informed decisions. We believe that understanding your medical information shouldn't require a medical degree. By leveraging today's technology, 
      we make health literacy accessible to all, empowering you to take control of your health journey with confidence and clarity.`,
    },
    {
      num: "02", title: "The Team",
    },
    {
      num: "03", title: "The Technology",
      desc: `Veris reads your report and picks out the important parts: diagnoses, lab results, symptoms, and medications. It then checks each 
      value against standard medical reference ranges to spot anything outside the normal limits. A language model turns all of that into a short, 
      clear summary written for patients, not doctors. No medical shorthand and no confusing numbers without context.`,
    },
  ];

  return (
    <div className="page">
      <section style={{ flex: 1, padding: "56px 0 72px", width: "100%" }}>
        <div className="container">

          {/* Header */}
          <div className="anim-fade-up" style={{ marginBottom: 48 }}>
            <h1 style={{
              fontFamily: "'Lora', serif", fontSize: 36, fontWeight: 600,
              color: "var(--text)", marginBottom: 14,
            }}>
              About us
            </h1>
          </div>

          <div className="about-grid" style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 20,
            marginBottom: 36,
          }}>
            {sections.map((s, i) => (
              <div key={s.num} className={`about-card anim-fade-up anim-delay-${i + 1}`}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--faint)", marginBottom: 10, textAlign: "justify" }}>{s.num}</p>
                <h3 style={{ fontFamily: "'Lora', serif", fontSize: 20, fontWeight: 600, marginBottom: 12 }}>
                  {s.title}
                </h3>
                {s.num === "02" ? (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, 1fr)",
                      gap: 80,
                      marginTop: 24,
                      maxWidth: 600,
                      marginLeft: "auto",
                      marginRight: "auto",
                      alignItems: "start",
                      justifyItems: "center"
                    }}
                  >
                    <div style={{ textAlign: "center" }}>
                      <img
                        src="/team/member1.jpg"
                        alt="Hriman Saha"
                        style={{
                          width: 170,
                          height: 210,
                          objectFit: "cover",
                          borderRadius: 12,
                          display: "block",
                          margin: "0 auto 14px",
                          boxShadow: "0 10px 24px rgba(0,0,0,0.18)"
                        }}
                      />
                      <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>
                        Hriman Saha
                      </p>
                      <p
                        style={{
                          fontSize: 13,
                          color: "var(--muted)",
                          lineHeight: 1.5,
                          maxWidth: 240,
                          margin: "0 auto",
                          textAlign: "justify"
                        }}
                      >
                        Too curious to leave things unexplored. Currently manifesting a Ferrari
                        WDC and Barca’s 6th UCL like it’s a full-time job.
                      </p>
                    </div>

                    <div style={{ textAlign: "center" }}>
                      <img
                        src="/team/member2.jpg"
                        alt="Boopalan Senthilkumar"
                        style={{
                          width: 170,
                          height: 210,
                          objectFit: "cover",
                          borderRadius: 12,
                          display: "block",
                          margin: "0 auto 14px",
                          boxShadow: "0 10px 24px rgba(0,0,0,0.18)"
                        }}
                      />
                      <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>
                        Boopalan Senthilkumar
                      </p>
                      <p
                        style={{
                          fontSize: 13,
                          color: "var(--muted)",
                          lineHeight: 1.5,
                          maxWidth: 240,
                          margin: "0 auto"
                        }}
                      >
                        Role / short bio
                      </p>
                    </div>
                  </div>
                ) : (
                  <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.65, marginBottom: 20, textAlign: "justify" }}>
                    {s.desc}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* CTA strip */}
          <div className="cta-strip anim-fade-up">
            <div>
              <p style={{ fontWeight: 600, fontSize: 17, color: "var(--green)", marginBottom: 4 }}>
                Ready to try it?
              </p>
              <p style={{ color: "var(--green)", fontSize: 14, opacity: 0.85 }}>
                Upload your first report in seconds.
              </p>
            </div>
            <button className="btn btn-primary" onClick={() => setPage("upload")}>
              Get started →
            </button>
          </div>

        </div>
      </section>

      <footer className="footer">
        <span>© 2025 Veris v1.0</span>
        <span>Made with ♥ for better health literacy</span>
      </footer>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   ROOT APP
   ══════════════════════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════════════════════════
   REUSABLE: FormInput
   ══════════════════════════════════════════════════════════════════════════ */
function FormInput({ label, hint, error, prefix, suffix, onSuffixClick, ...props }) {
  return (
    <div className="input-group">
      {label && <label className="input-label">{label}</label>}
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        {prefix && (
          <span style={{
            position: "absolute", left: 12, fontSize: 15,
            color: "var(--faint)", pointerEvents: "none", zIndex: 1,
          }}>{prefix}</span>
        )}
        <input
          className={`input-field ${error ? "error" : ""}`}
          style={{ paddingLeft: prefix ? 36 : 14, paddingRight: suffix ? 40 : 14 }}
          {...props}
        />
        {suffix && (
          <button
            type="button"
            onClick={onSuffixClick}
            style={{
              position: "absolute", right: 12,
              background: "none", border: "none", cursor: "pointer",
              fontSize: 15, color: "var(--faint)", padding: 0, lineHeight: 1,
            }}
          >
            {suffix}
          </button>
        )}
      </div>
      {error && <span className="input-error">{error}</span>}
      {hint && !error && <span className="input-hint">{hint}</span>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   SCREEN: LOGIN
   ══════════════════════════════════════════════════════════════════════════ */
function LoginScreen({ setPage, setUser, setToken }) {
  const [mode,      setMode]      = useState("email"); // "email" | "phone"
  const [identifier,setIdentifier]= useState("");
  const [password,  setPassword]  = useState("");
  const [showPw,    setShowPw]    = useState(false);
  const [error,     setError]     = useState(null);
  const [loading,   setLoading]   = useState(false);

  const API = "http://localhost:8000";

  const handleLogin = async () => {
    setError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{7,15}$/;

    if (!identifier.trim()) {
      setError(mode === "email"
        ? "Please enter your email address."
        : "Please enter your phone number.");
      return;
    }

    if (mode === "email" && !emailRegex.test(identifier)) {
      setError("Enter a valid email address.");
      return;
    }

    if (mode === "phone" && !phoneRegex.test(identifier.replace(/\D/g, ""))) {
      setError("Enter a valid phone number.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      // ── POST /api/auth/login ──────────────────────────────────
      const payload =
        mode === "email"
          ? { email: identifier, password }
          : { phone: identifier, password };

      const res = await fetch(`${API}/api/auth/login`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
      if (!res.ok) {
        let errMsg = "Login failed.";
        try {
          const err = await res.json();
          errMsg = err.detail || err.message || errMsg;
        } catch {}
        throw new Error(errMsg);
      }
      const data = await res.json();
      // data = { token: "...", user: { id, name, email, phone, location } }

      // ── Fetch report history for this user ───────────────────
      const histRes = await fetch(`${API}/api/reports`, {
        headers: { Authorization: `Bearer ${data.token}` },
      });
      const history = histRes.ok ? await histRes.json() : [];

      setToken(data.token);
      setUser({ ...data.user, history });
      setPage("home");

    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <section style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "56px 0", width: "100%" }}>
        <div className="container" style={{ maxWidth: 420 }}>

          {/* Header */}
          <div className="anim-fade-up" style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
              <LogoMark size={40} />
            </div>
            <h1 style={{ fontFamily: "'Lora', serif", fontSize: 26, fontWeight: 600, marginBottom: 8 }}>
              Welcome back
            </h1>
            <p style={{ color: "var(--muted)", fontSize: 14 }}>
              Log in to access your reports and analysis history.
            </p>
          </div>

          {/* Card */}
          <div className="card card-padded anim-fade-up anim-delay-1">

            {/* Toggle — Email / Phone */}
            <div className="toggle-group" style={{ marginBottom: 20 }}>
              <button className={`toggle-btn ${mode === "email" ? "active" : ""}`} onClick={() => { setMode("email"); setIdentifier(""); }}>
                📧 Email
              </button>
              <button className={`toggle-btn ${mode === "phone" ? "active" : ""}`} onClick={() => { setMode("phone"); setIdentifier(""); }}>
                📱 Phone
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <FormInput
                label={mode === "email" ? "Email address" : "Phone number"}
                type={mode === "email" ? "email" : "tel"}
                placeholder={mode === "email" ? "Registered email address" : "Registered phone number"}
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                prefix={mode === "email" ? "✉" : "📱"}
              />

              <FormInput
                label="Password"
                type={showPw ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                prefix="🔒"
                suffix={showPw ? "🙈" : "👁"}
                onSuffixClick={() => setShowPw(v => !v)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
              />

              {/* Forgot password */}
              <div style={{ textAlign: "right", marginTop: -8 }}>
                <span style={{ fontSize: 13, color: "var(--green)", cursor: "pointer", fontWeight: 500 }}>
                  Forgot password?
                </span>
              </div>

              {error && (
                <div style={{ background: "var(--red-lt)", border: "1px solid var(--red-bd)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "var(--red)" }}>
                  ⚠ {error}
                </div>
              )}

              <button
                className="btn btn-primary btn-full"
                style={{ padding: 14, fontSize: 15, marginTop: 4 }}
                onClick={handleLogin}
                disabled={loading}
              >
                {loading ? <><div className="spinner" style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "#fff" }} /> Signing in…</> : "Log in"}
              </button>
            </div>

            <div className="auth-divider" style={{ margin: "20px 0" }}>or</div>

            <p style={{ textAlign: "center", fontSize: 14, color: "var(--muted)" }}>
              Don't have an account?{" "}
              <span
                style={{ color: "var(--green)", fontWeight: 600, cursor: "pointer" }}
                onClick={() => setPage("register")}
              >
                Create one
              </span>
            </p>
          </div>

        </div>
      </section>
      {/* ── Footer bar ── */}
      <footer className="footer">
        <span>© 2026 Veris v1.0</span>
        <span>Made with ♥ for better health literacy</span>
      </footer>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   SCREEN: REGISTER
   ══════════════════════════════════════════════════════════════════════════ */
function RegisterScreen({ setPage, setUser, setToken }) {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", location: "", password: "", confirm: "",
  });
  const [showPw,   setShowPw]   = useState(false);
  const [showCon,  setShowCon]  = useState(false);
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);

  const API = "http://localhost:8000";
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{7,15}$/;

    if (!form.name.trim()) e.name = "Name is required.";

    if (!emailRegex.test(form.email))
      e.email = "Enter a valid email address.";

    if (!phoneRegex.test(form.phone.replace(/\D/g, "")))
      e.phone = "Enter a valid phone number.";

    if (!form.location.trim())
      e.location = "Location is required.";

    if (form.password.length < 8)
      e.password = "Password must be at least 8 characters.";

    if (form.confirm !== form.password)
      e.confirm = "Passwords do not match.";

    return e;
  };

  const handleRegister = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);

    try {
      // ── POST /api/auth/register ───────────────────────────────
      const res = await fetch(`${API}/api/auth/register`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          name:     form.name,
          email:    form.email,
          phone:    form.phone,
          location: form.location,
          password: form.password,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Registration failed.");
      }
      const data = await res.json();
      // data = { token: "...", user: { id, name, email, phone, location } }

      setToken(data.token);
      setUser({ ...data.user, history: [] });
      setPage("home");

    } catch (err) {
      setErrors({ general: err.message || "Registration failed. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <section style={{ flex: 1, padding: "48px 0 64px", width: "100%" }}>
        <div className="container" style={{ maxWidth: 480 }}>

          {/* Header */}
          <div className="anim-fade-up" style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
              <LogoMark size={40} />
            </div>
            <h1 style={{ fontFamily: "'Lora', serif", fontSize: 26, fontWeight: 600, marginBottom: 8 }}>
              Create your account
            </h1>
            <p style={{ color: "var(--muted)", fontSize: 14 }}>
              Save your reports and track your health data over time.
            </p>
          </div>

          <div className="card card-padded anim-fade-up anim-delay-1">
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              <FormInput
                label="Full name"
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={e => set("name", e.target.value)}
                prefix="👤"
                error={errors.name}
              />

              <FormInput
                label="Email address"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => set("email", e.target.value)}
                prefix="✉"
                error={errors.email}
              />

              <FormInput
                label="Phone number"
                type="tel"
                placeholder="Your phone number"
                value={form.phone}
                onChange={e => set("phone", e.target.value)}
                prefix="📱"
                error={errors.phone}
              />

              <FormInput
                label="Location"
                type="text"
                placeholder="City"
                value={form.location}
                onChange={e => set("location", e.target.value)}
                prefix="📍"
                error={errors.location}
                hint="Used to personalise reference ranges where relevant."
              />

              <div className="divider" />

              <FormInput
                label="Password"
                type={showPw ? "text" : "password"}
                placeholder="At least 8 characters"
                value={form.password}
                onChange={e => set("password", e.target.value)}
                prefix="🔒"
                suffix={showPw ? "🙈" : "👁"}
                onSuffixClick={() => setShowPw(v => !v)}
                error={errors.password}
              />

              <FormInput
                label="Confirm password"
                type={showCon ? "text" : "password"}
                placeholder="Re-enter your password"
                value={form.confirm}
                onChange={e => set("confirm", e.target.value)}
                prefix="🔒"
                suffix={showCon ? "🙈" : "👁"}
                onSuffixClick={() => setShowCon(v => !v)}
                error={errors.confirm}
              />

              {errors.general && (
                <div style={{ background: "var(--red-lt)", border: "1px solid var(--red-bd)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "var(--red)" }}>
                  ⚠ {errors.general}
                </div>
              )}

              <button
                className="btn btn-primary btn-full"
                style={{ padding: 14, fontSize: 15, marginTop: 4 }}
                onClick={handleRegister}
                disabled={loading}
              >
                {loading ? <><div className="spinner" style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "#fff" }} /> Creating account…</> : "Create account"}
              </button>

              <p style={{ textAlign: "center", fontSize: 13, color: "var(--muted)" }}>
                Already have an account?{" "}
                <span
                  style={{ color: "var(--green)", fontWeight: 600, cursor: "pointer" }}
                  onClick={() => setPage("login")}
                >
                  Log in
                </span>
              </p>
            </div>
          </div>

        </div>
      </section>
      {/* ── Footer bar ── */}
      <footer className="footer">
        <span>© 2026 Veris v1.0</span>
        <span>Made with ♥ for better health literacy</span>
      </footer>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   SCREEN: PROFILE
   ══════════════════════════════════════════════════════════════════════════ */
function ProfileScreen({ user, setUser, setToken, setPage, setResult, token }) {
  if (!user) { setPage("login"); return null; }

  const API      = "http://localhost:8000";
  const initials = user.name.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase();

  const handleLogout = () => {
    // Discard token and user — no server call needed for JWT logout
    setUser(null);
    setToken(null);
    setPage("home");
  };

  const viewReport = async (report) => {
    try {
      // ── GET /api/reports/:id ──────────────────────────────────
      const res = await fetch(`${API}/api/reports/${report.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Could not load report.");
      const data = await res.json();
      setResult(data);
      setPage("results");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="page">
      <section style={{ flex: 1, padding: "48px 0 64px", width: "100%" }}>
        <div className="container" style={{ maxWidth: 640 }}>

          {/* ── Profile header ── */}
          <div className="anim-fade-up" style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 36 }}>
            <div className="avatar-lg">{initials}</div>
            <div>
              <h1 style={{ fontFamily: "'Lora', serif", fontSize: 26, fontWeight: 600, marginBottom: 4 }}>
                {user.name}
              </h1>
              <p style={{ color: "var(--muted)", fontSize: 14 }}>Member since {new Date(user.created_at).getFullYear()}</p>
            </div>
            <button
              className="btn btn-secondary"
              style={{ marginLeft: "auto", fontSize: 13 }}
              onClick={handleLogout}
            >
              Log out
            </button>
          </div>

          {/* ── Info card ── */}
          <div className="card anim-fade-up anim-delay-1" style={{ marginBottom: 24, overflow: "hidden" }}>
            <div className="panel-header">👤 &nbsp;Personal Information</div>
            <div style={{ padding: "8px 24px" }}>
              {[
                { icon: "✉",  label: "Email",    value: user.email    },
                { icon: "📱", label: "Phone",    value: user.phone    },
                { icon: "📍", label: "Location", value: user.location },
              ].map(({ icon, label, value }) => (
                <div key={label} className="profile-row">
                  <div className="profile-row-icon">{icon}</div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "var(--faint)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2, textAlign: "right" }}>
                      {label}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text)" }}>{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── History card ── */}
          <div className="card anim-fade-up anim-delay-2" style={{ overflow: "hidden" }}>
            <div className="panel-header">
              📋 &nbsp;Report History
              <span className="badge badge-neutral" style={{ marginLeft: "auto", fontSize: 11 }}>
                {user.history.length} reports
              </span>
            </div>
            <div style={{ padding: "16px" }}>
              {user.history.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--faint)" }}>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>📭</div>
                  <p style={{ fontSize: 14 }}>No reports yet. Upload your first one.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {user.history.map((r) => (
                    <div key={r.id} className="history-item" onClick={() => viewReport(r)}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ fontSize: 22 }}>📄</div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)", marginBottom: 2 }}>
                            {r.filename}
                          </div>
                          <div style={{ fontSize: 12, color: "var(--faint)" }}>{r.date}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                        {r.critical > 0 && (
                          <span className="badge badge-critical" style={{ fontSize: 11 }}>
                            ⚠ {r.critical}
                          </span>
                        )}
                        {r.warnings > 0 && (
                          <span className="badge badge-warning" style={{ fontSize: 11 }}>
                            ◆ {r.warnings}
                          </span>
                        )}
                        <span style={{ color: "var(--faint)", fontSize: 18, marginLeft: 4 }}>›</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Quick action ── */}
          <div className="anim-fade-up anim-delay-3" style={{ marginTop: 24, textAlign: "center" }}>
            <button className="btn btn-primary btn-lg" onClick={() => setPage("upload")}>
              + Analyze a new report
            </button>
          </div>

        </div>
      </section>
      {/* ── Footer bar ── */}
      <footer className="footer">
        <span>© 2026 Veris v1.0</span>
        <span>Made with ♥ for better health literacy</span>
      </footer>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   ROOT APP
   ══════════════════════════════════════════════════════════════════════════ */
export default function App() {
  const [page,   setPage]   = useState("home");
  const [result, setResult] = useState(null);

  /*
    Auth state — both user and token live in memory.
    token is passed as a prop to any screen that calls the API.
    On refresh both are lost — add sessionStorage here if you want
    to persist across page refreshes (not available in Claude artifacts).
  */
  const [user,  setUser]  = useState(null);
  const [token, setToken] = useState(null);

  const screens = {
    home:     <HomeScreen     setPage={setPage} />,
    upload:   <UploadScreen   setPage={setPage} setResult={setResult} user={user} setUser={setUser} token={token} />,
    results:  <ResultsScreen  result={result}   setPage={setPage} setResult={setResult} />,
    about:    <AboutScreen    setPage={setPage} />,
    login:    <LoginScreen    setPage={setPage} setUser={setUser} setToken={setToken} />,
    register: <RegisterScreen setPage={setPage} setUser={setUser} setToken={setToken} />,
    profile:  <ProfileScreen  user={user} setUser={setUser} setToken={setToken} setPage={setPage} setResult={setResult} token={token} />,
  };

  return (
    <>
      <Nav page={page} setPage={setPage} user={user} />
      {screens[page] ?? screens.home}
    </>
  );
}