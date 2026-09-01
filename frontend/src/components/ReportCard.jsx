import { Link } from "react-router-dom";

const PROCESSING_TONE = {
  Processing: "bg-yellow-50 text-yellow-700 border-yellow-200",
  Completed: "bg-green-50 text-green-700 border-green-200",
  Failed: "bg-red-50 text-red-700 border-red-200",
};

function formatDate(dateString) {
  if (!dateString) return "";
  try {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
  if (
    today.getMonth() < birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())
  ) age -= 1;
  return age >= 0 ? age : "";
}

export default function ReportCard({ report, patientName }) {
  const { id, status, extractedData } = report;
  const { fileName, reportType, createdAt } = report;
  const date = report.date ?? extractedData?.dateOfTest ?? createdAt;
  const patientDateOfBirth = extractedData?.patientDateOfBirth;
  const patientGender = extractedData?.patientGender;
  const patientAge = calculateAge(patientDateOfBirth);
  const statusClass = PROCESSING_TONE[status] || "bg-[#F1F0EE] text-muted";

  return (
    <div className="flex items-center justify-between gap-4 rounded-card border border-border bg-white p-4 sm:p-5 hover:border-forest/30 transition-colors">
      <div className="min-w-0 flex-1">
        <p className="font-body font-medium text-body-lg text-ink truncate">{fileName || reportType}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-body-sm text-muted">
          {reportType && <span>{reportType}</span>}
          {date && <span>{formatDate(date)}</span>}
          {patientName && <span>{patientName}</span>}
          {patientAge !== "" && <span>Age {patientAge}</span>}
          {patientGender && <span>{patientGender}</span>}
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className={`rounded-tag border px-2.5 py-1 text-body-sm font-medium ${statusClass}`}>{status}</span>
        <Link
          to={`/reports/${id}`}
          className="rounded-btn border border-forest px-3 py-1.5 text-body-sm font-medium text-forest hover:bg-forest-light transition-colors duration-150"
        >
          View report
        </Link>
      </div>
    </div>
  );
}
