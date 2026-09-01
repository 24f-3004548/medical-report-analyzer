import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Button from "../components/Button";
import ReportCard from "../components/ReportCard";
import EmptyState from "../components/EmptyState";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";

const STATUS_FILTERS = ["All", "Processing", "Completed", "Failed"];

const ITEMS_PER_PAGE = 10;

function normalizeReport(report) {
  const extractedData = report.extracted_data || report.extractedData || {};
  return {
    ...report,
    id: report.id,
    name: report.name ?? report.file_name,
    reportType: report.reportType ?? report.report_type,
    date: report.date ?? extractedData.date_of_test ?? extractedData.dateOfTest ?? report.created_at,
    status: report.status ? report.status.charAt(0).toUpperCase() + report.status.slice(1).toLowerCase() : report.status,
    extracted_data: extractedData,
  };
}

export default function Reports() {
  const { user } = useAuth();
  const location = useLocation();
  const [reports, setReports] = useState([]);
  const [state, setState] = useState("loading");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [uploadingFile, setUploadingFile] = useState(location.state?.uploadingFile || null);

  useEffect(() => {
    let cancelled = false;
    api
      .getReports()
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

  const filtered = useMemo(() => {
    return reports.filter((r) => {
      const matchesStatus = statusFilter === "All" || r.status?.toLowerCase() === statusFilter?.toLowerCase();
      const matchesSearch =
        !search.trim() ||
        r.name?.toLowerCase().includes(search.toLowerCase()) ||
        r.reportType?.toLowerCase().includes(search.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [reports, search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedReports = filtered.slice(startIndex, endIndex);

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  return (
    <div>
      {uploadingFile && (
        <div className="mb-6 rounded-card border border-forest/30 bg-forest-light px-4 py-3">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-forest animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <div>
              <p className="text-body-sm font-medium text-forest">Processing report</p>
              <p className="text-body-sm text-forest/80">{uploadingFile} is being analyzed. You'll be notified when it's ready.</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-h1 text-ink">My reports</h1>
        <Link to="/reports/upload">
          <Button>Upload report</Button>
        </Link>
      </div>

      {state === "success" && reports.length > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <input
            type="search"
            placeholder="Search reports"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:max-w-xs rounded-btn border border-border bg-white px-3 py-2.5 text-body text-ink focus:border-forest focus:outline-none"
          />
          <div className="flex gap-2 flex-wrap">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-pill px-3 py-1.5 text-body-sm font-medium transition-colors duration-150 ${
                  statusFilter === s ? "bg-forest text-white" : "bg-white border border-border text-ink hover:bg-forest-light"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        {state === "loading" && (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
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

        {state === "success" && reports.length > 0 && filtered.length === 0 && (
          <EmptyState title="No matching reports" description="Try a different search term or filter." />
        )}

        {state === "success" && filtered.length > 0 && (
          <>
            <div className="space-y-3">
              {paginatedReports.map((report) => (
                <ReportCard key={report.id} report={report} patientName={user?.fullName} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <p className="text-body-sm text-muted">
                  Showing {startIndex + 1} to {Math.min(endIndex, filtered.length)} of {filtered.length} reports
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handlePrevious}
                    disabled={currentPage === 1}
                    className="rounded-btn border border-border px-3 py-2 text-body-sm font-medium text-ink hover:bg-page disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Previous
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`rounded-btn px-2.5 py-1.5 text-body-sm font-medium transition-colors ${
                          currentPage === i + 1
                            ? "bg-forest text-white"
                            : "border border-border text-ink hover:bg-page"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className="rounded-btn border border-border px-3 py-2 text-body-sm font-medium text-ink hover:bg-page disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
