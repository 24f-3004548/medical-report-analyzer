import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import UploadZone from "../components/UploadZone";
import ProcessingState from "../components/ProcessingState";
import { api, ApiError } from "../services/api";

// Maps a backend-reported stage name to a step index for ProcessingState.
// Adjust these keys to match whatever stage identifiers the API sends.
const STAGE_INDEX = {
  uploading: 0,
  extracting: 1,
  retrieving_medical_info: 2,
  generating_explanations: 3,
  saving: 4,
};

export default function UploadReport() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [phase, setPhase] = useState("idle"); // idle | processing | failed
  const [stepIndex, setStepIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileSelect = (selected, error) => {
    setFile(selected);
    setFileError(error || "");
  };

  const runUpload = async () => {
    if (!file) {
      setFileError("Please select a PDF report to upload.");
      return;
    }

    setPhase("processing");
    setStepIndex(0);
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Fire off the upload in the background (don't await)
      // User can navigate away while it processes
      api.uploadReport(formData)
        .then((result) => {
          // Upload succeeded - navigate to the new report
          navigate(`/reports/${result.id}`, { state: { uploaded: true } });
        })
        .catch((err) => {
          // Show error state
          setPhase("failed");
          setErrorMessage(err instanceof ApiError ? err.message : "Something went wrong while processing your report.");
        });

      // Immediately navigate to reports page with success message
      navigate("/reports", { state: { uploadingFile: file.name } });
    } catch (err) {
      setPhase("failed");
      setErrorMessage(err instanceof ApiError ? err.message : "Something went wrong while processing your report.");
    }
  };

  const handleRetry = () => {
    setPhase("idle");
    setErrorMessage("");
  };

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="font-display text-h1 text-ink">Upload a report</h1>
      <p className="mt-1.5 text-body text-muted">
        Upload a PDF of your lab report and Veris will explain each result in plain language.
      </p>

      <div className="mt-8">
        {phase === "idle" && (
          <>
            <UploadZone file={file} onFileSelect={handleFileSelect} error={fileError} />
            <Button size="lg" className="w-full mt-6" onClick={runUpload} disabled={!file || !!fileError}>
              Upload report
            </Button>
          </>
        )}

        {phase === "processing" && <ProcessingState stepIndex={stepIndex} status="in-progress" />}

        {phase === "failed" && (
          <>
            <ProcessingState stepIndex={stepIndex} status="failed" />
            <div className="mt-4 rounded-tag bg-critical-bg px-3 py-2.5 text-body-sm text-critical" role="alert">
              {errorMessage}
            </div>
            <Button size="lg" className="w-full mt-4" onClick={handleRetry}>
              Try again
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
