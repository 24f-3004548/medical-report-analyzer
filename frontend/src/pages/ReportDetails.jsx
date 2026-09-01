import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PatientCard from "../components/PatientCard";
import SummaryCard from "../components/SummaryCard";
import ResultCard from "../components/ResultCard";
import SourceCard from "../components/SourceCard";
import { api, ApiError } from "../services/api";
import { useAuth } from "../context/AuthContext";

function formatDate(dateString) {
  if (!dateString) return "";
  try {
    return new Date(dateString).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return dateString;
  }
}

function normalizeInterpretation(report) {
  const extractedData = report.extracted_data || report.extractedData || {};
  const interpretation = report.interpretation || {};
  const interpretations = interpretation.interpretations || [];
  const dateOfTest = extractedData.date_of_test ?? extractedData.dateOfTest;
  const resultsByTopic = interpretations.reduce((groups, item) => {
    const topic = item.medical_topic ?? item.medicalTopic ?? "Other results";
    const result = {
      testName: item.test_name ?? item.testName,
      value: item.result,
      unit: item.unit,
      referenceRange: item.reference_range ?? item.referenceRange,
      status: item.result_status ?? item.resultStatus,
      meaning: item.meaning,
      explanation: item.explanation,
      caution: item.caution,
    };
    const topicResults = (groups[topic] ||= []);
    const existing = topicResults.find(
      (entry) => entry.testName?.trim().toLowerCase() === result.testName?.trim().toLowerCase()
    );
    if (existing) {
      existing.readings.push(result);
    } else {
      topicResults.push({ ...result, readings: [result] });
    }
    return groups;
  }, {});

  return {
    ...report,
    reportType: report.report_type ?? report.reportType,
    date: report.created_at ?? report.date,
    dateOfTest,
    status: report.status
      ? report.status.charAt(0).toUpperCase() + report.status.slice(1).toLowerCase()
      : report.status,
    patientDateOfBirth: extractedData.patient_date_of_birth ?? extractedData.patientDateOfBirth,
    patientGender: extractedData.patient_gender ?? extractedData.patientGender,
    summary: interpretation.overall_summary ?? interpretation.overallSummary,
    resultsByTopic,
    whenToDiscussWithDoctor:
      interpretation.when_to_discuss_with_doctor ?? interpretation.whenToDiscussWithDoctor,
    sources: report.sources || [],
  };
}

export default function ReportDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [state, setState] = useState("loading"); // loading | success | not-found | unauthorized | error
  const [actionError, setActionError] = useState("");
  const [renameValue, setRenameValue] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setState("loading");
    api
      .getReport(id)
      .then((data) => {
        if (!cancelled) {
          setReport(normalizeInterpretation(data));
          setState("success");
        }
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 404) setState("not-found");
        else if (err instanceof ApiError && err.status === 401) setState("unauthorized");
        else setState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleDownload = async () => {
    setActionError("");
    setIsDownloading(true);
    try {
      const blob = await api.downloadReport(id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = report.file_name || "medical-report.pdf";
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setActionError(error.message);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleRename = async (event) => {
    event.preventDefault();
    if (!renameValue.trim()) return;
    setActionError("");
    try {
      const updated = await api.renameReport(id, renameValue);
      setReport((current) => ({ ...current, file_name: updated.file_name || `${renameValue.trim()}.pdf` }));
      setRenameValue("");
      setIsRenaming(false);
    } catch (error) {
      setActionError(error.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this report and its original PDF? This cannot be undone.")) return;
    setActionError("");
    try {
      await api.deleteReport(id);
      window.location.assign("/reports");
    } catch (error) {
      setActionError(error.message);
    }
  };

  if (state === "loading") {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 rounded bg-white border border-border animate-pulse" />
        <div className="h-24 rounded-card bg-white border border-border animate-pulse" />
        <div className="h-40 rounded-card bg-white border border-border animate-pulse" />
      </div>
    );
  }

  if (state === "not-found") {
    return (
      <div className="text-center py-16">
        <h1 className="font-display text-h2 text-ink">Report not found</h1>
        <p className="mt-2 text-body text-muted">This report doesn't exist or may have been removed.</p>
        <Link to="/reports" className="mt-6 inline-block text-body font-medium text-forest hover:underline">
          Back to reports
        </Link>
      </div>
    );
  }

  if (state === "unauthorized") {
    return (
      <div className="text-center py-16">
        <h1 className="font-display text-h2 text-ink">Sign in required</h1>
        <p className="mt-2 text-body text-muted">Please sign in again to view this report.</p>
        <Link to="/login" className="mt-6 inline-block text-body font-medium text-forest hover:underline">
          Go to sign in
        </Link>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="text-center py-16">
        <h1 className="font-display text-h2 text-ink">Something went wrong</h1>
        <p className="mt-2 text-body text-muted">We couldn't load this report. Please try again.</p>
      </div>
    );
  }

  const {
    reportType,
    date,
    dateOfTest,
    status,
    file_name: fileName,
    patientDateOfBirth,
    patientGender,
    summary,
    resultsByTopic = {},
    whenToDiscussWithDoctor,
    sources = [],
  } = report;

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/reports" className="inline-flex items-center gap-1.5 text-body-sm font-medium text-forest hover:underline mb-6">
        <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M12.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L8.414 10l4.293 4.293a1 1 0 010 1.414z"
            clipRule="evenodd"
          />
        </svg>
        Back to reports
      </Link>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-card border border-border bg-white p-4">
        <div>
          <h1 className="font-display text-h2 text-ink">{reportType || "Lab report"}</h1>
          <p className="mt-2 text-body text-muted">Test date: {dateOfTest || formatDate(date) || "Not available"}</p>
        </div>
        {status && (
          <span className={`rounded-tag border px-3 py-1.5 text-body-sm font-medium whitespace-nowrap ${
            status === "Completed" ? "bg-green-50 text-green-700 border-green-200" :
            status === "Processing" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
            "bg-red-50 text-red-700 border-red-200"
          }`}>
            {status}
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button type="button" onClick={handleDownload} disabled={isDownloading} className="rounded-btn border border-forest px-3 py-2 text-body-sm font-medium text-forest hover:bg-forest-light disabled:opacity-50">
          {isDownloading ? "Downloading..." : "Download original PDF"}
        </button>
        <button type="button" onClick={() => setIsRenaming((current) => !current)} className="rounded-btn border border-border px-3 py-2 text-body-sm font-medium text-ink hover:bg-page">
          Rename PDF
        </button>
        <button type="button" onClick={handleDelete} className="rounded-btn border border-critical/40 px-3 py-2 text-body-sm font-medium text-critical hover:bg-critical-bg">
          Delete report
        </button>
      </div>

      {isRenaming && (
        <form onSubmit={handleRename} className="mt-3 flex max-w-lg gap-2">
          <input
            value={renameValue}
            onChange={(event) => setRenameValue(event.target.value)}
            placeholder={fileName || "New filename"}
            className="min-w-0 flex-1 rounded-btn border border-border bg-white px-3 py-2 text-body text-ink focus:border-forest focus:outline-none"
            aria-label="New PDF filename"
          />
          <button type="submit" className="rounded-btn bg-forest px-3 py-2 text-body-sm font-medium text-white">Save</button>
        </form>
      )}

      {actionError && <p className="mt-3 text-body-sm text-critical" role="alert">{actionError}</p>}

      {(user?.fullName || patientDateOfBirth || patientGender) && (
        <div className="mt-5">
          <PatientCard name={user?.fullName} dateOfBirth={patientDateOfBirth} gender={patientGender} />
        </div>
      )}

      {summary && (
        <div className="mt-6">
          <SummaryCard summary={summary} />
        </div>
      )}

      {Object.entries(resultsByTopic).map(([topic, results]) => (
        <section key={topic} className="mt-10">
          <h2 className="font-body font-semibold text-h3 text-ink uppercase tracking-wide">{topic}</h2>
          <div className="mt-4 space-y-4">
            {results.map((result) => (
              <ResultCard key={result.testName} result={result} />
            ))}
          </div>
        </section>
      ))}

      {whenToDiscussWithDoctor && (
        <section className="mt-10">
          <div className="rounded-card border border-warning/30 bg-warning-bg p-6">
            <h2 className="font-body font-semibold text-body-lg text-ink">When to discuss with your doctor</h2>
            <p className="mt-2 text-body text-ink">{whenToDiscussWithDoctor}</p>
          </div>
        </section>
      )}

      {sources.length > 0 && (
        <section className="mt-10 mb-4">
          <h2 className="font-body font-semibold text-h3 text-ink">Medical information sources</h2>
          <div className="mt-4 space-y-3">
            {sources.map((source, i) => (
              <SourceCard key={source.url || i} source={source} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
