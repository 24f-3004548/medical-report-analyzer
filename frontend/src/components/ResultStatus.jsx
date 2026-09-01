// Maps a backend-provided status string to a subtle badge. Colors are used
// sparingly per the brand rule: only warning/critical tones for genuinely
// out-of-range or flagged findings, and only when the backend says so —
// never inferred here.

const STATUS_MAP = {
  "within range": { label: "Within range", tone: "neutral" },
  "above range": { label: "Above range", tone: "caution" },
  "below range": { label: "Below range", tone: "caution" },
  positive: { label: "Positive", tone: "caution" },
  negative: { label: "Negative", tone: "neutral" },
  detected: { label: "Detected", tone: "caution" },
  "not detected": { label: "Not detected", tone: "neutral" },
  inconclusive: { label: "Inconclusive", tone: "unknown" },
  "cannot determine": { label: "Cannot determine", tone: "unknown" },
};

const TONE_CLASSES = {
  neutral: "bg-forest-light text-forest",
  caution: "bg-warning-bg text-warning",
  unknown: "bg-[#F1F0EE] text-muted",
};

export default function ResultStatus({ status, className = "" }) {
  if (!status) return null;
  const key = status.trim().toLowerCase();
  const entry = STATUS_MAP[key] || { label: status, tone: "unknown" };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-tag px-2 py-1 text-body-sm font-medium ${TONE_CLASSES[entry.tone]} ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {entry.label}
    </span>
  );
}
