import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/Button";
import ReportCard from "../components/ReportCard";
import EmptyState from "../components/EmptyState";
import { useAuth } from "../context/AuthContext";
import { api, ApiError } from "../services/api";

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
          setReports(data?.reports || data || []);
          setState("success");
        }
      })
      .catch(() => !cancelled && setState("error"));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-h1 text-ink">Welcome back{user?.fullName ? `, ${user.fullName}` : ""}</h1>
          <p className="mt-1 text-body text-muted">Here's what's new with your reports.</p>
        </div>
        <Link to="/reports/upload">
          <Button>Upload report</Button>
        </Link>
      </div>

      <section className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-body font-semibold text-h3 text-ink">Recent reports</h2>
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
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
