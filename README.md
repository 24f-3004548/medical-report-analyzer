# Veris

Veris is a medical report analysis application that extracts laboratory results from uploaded reports, retrieves relevant medical knowledge, and generates patient-friendly explanations.

## Current Status

### Backend done

* FastAPI backend set up
* Supabase connected for:
    * Authentication
    * User data
    * Report storage
    * Processed report storage
* PDF upload implemented
* Google Cloud Document AI integrated for text extraction
* Gemini 2.5 Flash via Vertex AI integrated for structured extraction
* Medical test topic identification implemented
* Medical knowledge retrieval implemented using actual extracted tests
* Gemini-based result interpretation implemented
* Interpretation includes:
    * Result status
    * Meaning
    * Patient-friendly explanation
    * Caution/context
    * Overall summary
    * When to discuss with a doctor
* Complete processed report is saved to Supabase

## Current Pipeline

PDF
 ↓
Document AI
 ↓
Raw Report Text
 ↓
Gemini Extraction
 ↓
Structured Test Results
 ↓
Medical Knowledge Retrieval
 ↓
Gemini Interpretation
 ↓
Save to Supabase

The upload pipeline has been tested successfully using SWAGGER and reports are being saved to the database.

## Frontend 

Frontend development is the next stage.

Planned pages:

Home
Login
Register
Profile / Settings
All Reports
Specific Report
Upload Report
