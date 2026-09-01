import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/Button";
import ReportCard from "../components/ReportCard";
import EmptyState from "../components/EmptyState";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import ChatAssistant from "../components/ChatAssistant";

function normalizeReport(report) {
  return {
    ...report,
    date: report.date ?? report.extractedData?.dateOfTest ?? report.createdAt,
  };
}

export default function Dashboard() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [state, setState] = useState("loading"); // loading | success | error

  useEffect(() => {
    let cancelled = false;
    api
      .getReports({ limit: 5 })
      .then((data) => {
        if (!cancelled) {
          setReports((data?.reports || data || []).map(normalizeReport));
          setState("success");
        }
      })
      .catch(() => !cancelled && setState("error"));
    return () => {
      cancelled = true;
    };
  }, []);

  const completed = reports.filter((report) => report.status?.toLowerCase() === "completed").length;
  const abnormal = reports.filter((report) => report.status?.toLowerCase() === "failed").length;
  const latest = reports[0];

  return (
    <div className="animate-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div><p className="text-label font-semibold uppercase tracking-[0.18em] text-forest">Health overview</p><h1 className="mt-2 font-display text-h1 text-ink">Welcome back{user?.fullName ? `, ${user.fullName.split(" ")[0]}` : ""}</h1><p className="mt-1 text-body text-muted">A clear view of your recent laboratory reports.</p></div>
        <Link to="/reports/upload"><Button>Upload a report <span aria-hidden="true">→</span></Button></Link>
      </div>

      <section className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["Total reports", reports.length, "All time", "forest"],
          ["Latest report", latest?.reportType || "None yet", latest?.createdAt ? new Date(latest.createdAt).toLocaleDateString() : "Start by uploading", "amber"],
          ["Completed", completed, "Ready to review", "blue"],
          ["Needs attention", abnormal, "Requires follow-up", "red"],
        ].map(([label, value, note, tone]) => <div key={label} className="rounded-card border border-border bg-white p-4 sm:p-5"><div className="flex items-start justify-between gap-2"><p className="text-body-sm text-muted">{label}</p><span className={`h-2 w-2 rounded-full ${tone === "red" ? "bg-critical" : tone === "amber" ? "bg-warning" : tone === "blue" ? "bg-forest" : "bg-forest"}`} /></div><p className="mt-4 truncate font-display text-h2 text-ink">{value}</p><p className="mt-1 text-label uppercase tracking-wide text-muted">{note}</p></div>)}
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-card border border-border bg-white p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3"><div><p className="text-label font-semibold uppercase tracking-[0.16em] text-forest">Latest report summary</p><h2 className="mt-2 font-display text-h2 text-ink">Your records, made legible</h2></div><Link to="/reports" className="text-body-sm font-medium text-forest hover:underline">View all →</Link></div>
          <div className="mt-6 border-t border-border pt-5"><p className="text-body-sm text-muted">{latest ? "Most recently added" : "Ready when you are"}</p><h3 className="mt-1 font-body text-h3 font-semibold text-ink">{latest?.fileName || latest?.reportType || "No report uploaded"}</h3><p className="mt-1 text-body-sm text-muted">{latest?.createdAt ? new Date(latest.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "Upload a PDF to begin your health record"}</p><div className="mt-6 flex items-center justify-between border-t border-border pt-5"><span className="text-body-sm text-muted">Report status</span>{latest ? <span className="rounded-tag bg-forest-light px-2.5 py-1 text-label font-semibold uppercase tracking-wide text-forest">{latest.status || "Processing"}</span> : <span className="rounded-tag bg-page px-2.5 py-1 text-label font-semibold uppercase tracking-wide text-muted">Waiting</span>}</div></div>
        </div>
        <div className="rounded-card border border-forest/20 bg-forest p-5 text-white sm:p-6"><p className="text-label font-semibold uppercase tracking-[0.16em] text-white/70">Veris note</p><h2 className="mt-8 font-display text-h2">Insight should feel calm.</h2><p className="mt-3 text-body text-white/75">Your reports are kept private and organized so you can focus on the conversation with your doctor.</p><Link to="/reports" className="mt-8 inline-flex text-body-sm font-medium text-white hover:underline">Open your records <span className="ml-2" aria-hidden="true">→</span></Link></div>
      </section>

      <section className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <div><p className="text-label font-semibold uppercase tracking-[0.16em] text-muted">Your archive</p><h2 className="mt-1 font-display text-h2 text-ink">Recent reports</h2></div>
          {reports.length > 0 && (
            <Link to="/reports" className="text-body-sm font-medium text-forest hover:underline">
              View all reports
            </Link>
          )}
        </div>

        {state === "loading" && (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-20 rounded-card border border-border bg-white animate-pulse" />
            ))}
          </div>
        )}

        {state === "error" && (
          <div className="rounded-card border border-critical/30 bg-critical-bg px-4 py-3 text-body text-critical">
            We couldn't load your reports. Please refresh the page.
          </div>
        )}

        {state === "success" && reports.length === 0 && (
          <EmptyState
            title="No reports yet"
            description="Upload your first medical report to get a plain-language explanation of your results."
            action={
              <Link to="/reports/upload">
                <Button>Upload your first medical report</Button>
              </Link>
            }
          />
        )}

        {state === "success" && reports.length > 0 && (
          <div className="space-y-3">
            {reports.map((report) => (
              <ReportCard key={report.id} report={report} patientName={user?.fullName} />
            ))}
          </div>
        )}
      </section>

      <ChatAssistant />
    </div>
  );
}
