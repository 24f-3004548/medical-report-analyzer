import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useParams } from "react-router-dom";
import SummaryCard from "../components/SummaryCard";
import ResultCard from "../components/ResultCard";
import SourceCard from "../components/SourceCard";
import PotentialConditionsCard from "../components/PotentialConditionsCard";
import { api, ApiError } from "../services/api";
import ChatAssistant from "../components/ChatAssistant";
import { useAuth } from "../context/AuthContext";

const REPORT_TABS = ["overview", "results", "sources"];

function getReportTab() {
  const tab = window.location.hash.slice(1);
  return REPORT_TABS.includes(tab) ? tab : "overview";
}

function formatDate(dateString) {
  if (!dateString) return "";
  try {
    return new Date(dateString).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return dateString;
  }
}

function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return "";
  const birthDate = new Date(dateOfBirth);
  if (Number.isNaN(birthDate.getTime())) return "";
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  if (today.getMonth() < birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) age -= 1;
  return age >= 0 ? age : "";
}

function formatPatientName(name) {
  if (!name) return "";
  return name
    .trim()
    .toLowerCase()
    .replace(/\b(mr|mrs|ms|dr)\.(?=\S)/i, "$1. ")
    .replace(/(^|[\s-])([a-z])/g, (_, prefix, letter) => `${prefix}${letter.toUpperCase()}`);
}

function formatAge(age) {
  const years = String(age ?? "").match(/\d+/)?.[0];
  return years ? `${years} years` : "";
}

function formatGender(gender) {
  const normalized = String(gender ?? "").trim().toLowerCase();
  if (normalized === "m" || normalized === "male") return "Male";
  if (normalized === "f" || normalized === "female") return "Female";
  return gender || "";
}

function formatDateOfBirth(dateOfBirth) {
  const isoDate = String(dateOfBirth ?? "").match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  if (isoDate) return `${isoDate[3]}/${isoDate[2]}/${isoDate[1]}`;

  const parsedDate = new Date(dateOfBirth);
  if (Number.isNaN(parsedDate.getTime())) return "";
  return parsedDate.toLocaleDateString("en-GB");
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
    patientName: extractedData.patient_name ?? extractedData.patientName,
    patientAge: extractedData.patient_age ?? extractedData.patientAge,
    status: report.status
      ? report.status.charAt(0).toUpperCase() + report.status.slice(1).toLowerCase()
      : report.status,
    patientDateOfBirth: extractedData.patient_date_of_birth ?? extractedData.patientDateOfBirth,
    patientGender: extractedData.patient_gender ?? extractedData.patientGender,
    summary: interpretation.overall_summary ?? interpretation.overallSummary,
    resultsByTopic,
    whenToDiscussWithDoctor:
      interpretation.when_to_discuss_with_doctor ?? interpretation.whenToDiscussWithDoctor,
    potentialConditions: (interpretation.potential_conditions ?? interpretation.potentialConditions ?? []).map((condition) => ({
      name: condition.name,
      supportingFindings: condition.supporting_findings ?? condition.supportingFindings ?? [],
      caveat: condition.caveat,
    })),
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
  const [activeTab, setActiveTab] = useState(getReportTab);

  useEffect(() => {
    const syncTabWithHash = () => setActiveTab(getReportTab());
    window.addEventListener("hashchange", syncTabWithHash);
    return () => window.removeEventListener("hashchange", syncTabWithHash);
  }, []);

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

  const openRenameDialog = () => {
    setActionError("");
    setRenameValue(fileName || "");
    setIsRenaming(true);
  };

  const closeRenameDialog = () => {
    setActionError("");
    setRenameValue("");
    setIsRenaming(false);
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
    patientName,
    patientAge,
    patientGender,
    summary,
    resultsByTopic = {},
    potentialConditions = [],
    whenToDiscussWithDoctor,
    sources = [],
  } = report;
  const profileName = user?.fullName || user?.name;
  const profileDateOfBirth = user?.dateOfBirth || user?.date_of_birth || user?.dob;
  const displayPatientName = formatPatientName(patientName || profileName);
  const displayPatientAge = formatAge(patientAge || calculateAge(patientDateOfBirth || profileDateOfBirth));
  const displayPatientGender = formatGender(patientGender || user?.gender);
  const displayPatientDateOfBirth = formatDateOfBirth(patientDateOfBirth || profileDateOfBirth);
  const displayTestDate = dateOfTest || formatDate(date);
  const selectTab = (tab) => {
    setActiveTab(tab);
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#${tab}`);
  };
  const tabClassName = (tab) =>
    `px-1 pb-3 ${activeTab === tab ? "border-b-2 border-forest text-forest" : "hover:text-ink"}`;

  return (
    <div className="mx-auto max-w-[960px] animate-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <Link to="/reports" className="inline-flex items-center gap-1.5 text-body-sm font-medium text-forest hover:underline">
        <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M12.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L8.414 10l4.293 4.293a1 1 0 010 1.414z"
            clipRule="evenodd"
          />
        </svg>
        Back to reports
          </Link>
          <h1 className="mt-5 font-display text-h1 text-ink">{reportType || "Lab report"}</h1>
          <p className="mt-1 text-body-sm text-muted">Test date: {displayTestDate || "Not available"}{report.file_name ? ` · ${report.file_name}` : ""}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={openRenameDialog} className="rounded-btn border border-border bg-white px-3 py-2 text-body-sm font-medium text-ink hover:border-forest">Rename PDF</button>
          <button type="button" onClick={handleDownload} disabled={isDownloading} className="rounded-btn border border-border bg-white px-3 py-2 text-body-sm font-medium text-ink hover:border-forest disabled:opacity-50">{isDownloading ? "Downloading..." : "Download PDF"}</button>
          <button type="button" onClick={handleDelete} className="rounded-btn border border-critical/30 bg-white px-3 py-2 text-body-sm font-medium text-critical hover:bg-critical-bg">Delete</button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-card border border-border bg-white p-4">
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          {displayPatientName && <div><p className="text-label text-muted">Patient</p><p className="mt-1 text-body font-medium text-ink">{displayPatientName}</p></div>}
          {displayPatientAge && <div><p className="text-label text-muted">Age</p><p className="mt-1 text-body font-medium text-ink">{displayPatientAge}</p></div>}
          {displayPatientGender && <div><p className="text-label text-muted">Gender</p><p className="mt-1 text-body font-medium text-ink">{displayPatientGender}</p></div>}
          {displayPatientDateOfBirth && <div><p className="text-label text-muted">Date of birth</p><p className="mt-1 text-body font-medium text-ink">{displayPatientDateOfBirth}</p></div>}
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

      <nav className="mt-7 flex gap-6 border-b border-border text-body-sm font-medium text-muted" aria-label="Report sections">
        <button type="button" onClick={() => selectTab("overview")} className={tabClassName("overview")} aria-current={activeTab === "overview" ? "page" : undefined}>Overview</button>
        <button type="button" onClick={() => selectTab("results")} className={tabClassName("results")} aria-current={activeTab === "results" ? "page" : undefined}>Results</button>
        <button type="button" onClick={() => selectTab("sources")} className={tabClassName("sources")} aria-current={activeTab === "sources" ? "page" : undefined}>Sources</button>
      </nav>

      {actionError && !isRenaming && <p className="mt-3 text-body-sm text-critical" role="alert">{actionError}</p>}

      {activeTab === "overview" && (
        <section className="mt-6">
          {summary && <SummaryCard summary={summary} />}
          <PotentialConditionsCard conditions={potentialConditions} />
          {whenToDiscussWithDoctor && (
            <div className="mt-10 rounded-card border border-warning/30 bg-warning-bg p-6">
              <h2 className="font-body font-semibold text-body-lg text-ink">When to discuss with your doctor</h2>
              <p className="mt-2 text-body text-ink">{whenToDiscussWithDoctor}</p>
            </div>
          )}
          <ChatAssistant reportId={id} />
        </section>
      )}

      {activeTab === "results" && (
        <section className="mt-6">
          {Object.entries(resultsByTopic).map(([topic, results]) => (
            <div key={topic} className="mt-10 first:mt-0">
              <h2 className="font-body font-semibold text-h3 text-ink uppercase tracking-wide">{topic}</h2>
              <div className="mt-4 space-y-4">
                {results.map((result) => <ResultCard key={result.testName} result={result} />)}
              </div>
            </div>
          ))}
          {Object.keys(resultsByTopic).length === 0 && <p className="text-body text-muted">No results are available for this report.</p>}
        </section>
      )}

      {activeTab === "sources" && (
        <section className="mt-6 mb-4">
          <h2 className="font-body font-semibold text-h3 text-ink">Medical information sources</h2>
          {sources.length > 0 ? (
            <div className="mt-4 space-y-3">
              {sources.map((source, i) => <SourceCard key={source.url || i} source={source} />)}
            </div>
          ) : <p className="mt-4 text-body text-muted">No medical information sources are available for this report.</p>}
        </section>
      )}

      {isRenaming && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4" role="presentation" onMouseDown={closeRenameDialog}>
          <form
            onSubmit={handleRename}
            onMouseDown={(event) => event.stopPropagation()}
            className="w-full max-w-md rounded-card border border-border bg-white p-6 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="rename-report-title"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="rename-report-title" className="font-display text-h3 text-ink">Rename PDF</h2>
                <p className="mt-1 text-body-sm text-muted">Choose a clear name for this report file.</p>
              </div>
              <button type="button" onClick={closeRenameDialog} className="text-body-sm font-medium text-muted hover:text-ink" aria-label="Close rename dialog">Close</button>
            </div>
            <label htmlFor="report-file-name" className="mt-5 block text-label font-medium uppercase tracking-wide text-muted">File name</label>
            <input
              id="report-file-name"
              value={renameValue}
              onChange={(event) => setRenameValue(event.target.value)}
              className="mt-2 w-full rounded-btn border border-border bg-white px-3 py-2 text-body text-ink focus:border-forest focus:outline-none"
              aria-describedby={actionError ? "rename-error" : undefined}
              autoFocus
            />
            {actionError && <p id="rename-error" className="mt-2 text-body-sm text-critical" role="alert">{actionError}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={closeRenameDialog} className="rounded-btn border border-border px-4 py-2 text-body-sm font-medium text-ink hover:bg-page">Cancel</button>
              <button type="submit" className="rounded-btn bg-forest px-4 py-2 text-body-sm font-medium text-white hover:bg-forest/90">Save changes</button>
            </div>
          </form>
        </div>,
        document.body
      )}
    </div>
  );
}
