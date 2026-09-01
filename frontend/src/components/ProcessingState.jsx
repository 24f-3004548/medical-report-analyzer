const STEPS = [
  "Uploading report",
  "Extracting laboratory results",
  "Retrieving medical information",
  "Generating explanations",
  "Saving report",
];

// stepIndex: index of the step currently in progress (0-based). Steps before
// it are complete. status: "in-progress" | "completed" | "failed".
export default function ProcessingState({ stepIndex = 0, status = "in-progress" }) {
  return (
    <div className="rounded-card border border-border bg-white p-6 sm:p-8">
      <ul className="space-y-4">
        {STEPS.map((label, i) => {
          const isFailed = status === "failed" && i === stepIndex;
          const isDone = status === "completed" || i < stepIndex;
          const isActive = status === "in-progress" && i === stepIndex;

          return (
            <li key={label} className="flex items-center gap-3">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-body-sm ${
                  isFailed
                    ? "bg-critical-bg text-critical"
                    : isDone
                    ? "bg-forest text-white"
                    : isActive
                    ? "bg-forest-light text-forest"
                    : "bg-[#F1F0EE] text-faint"
                }`}
              >
                {isFailed ? (
                  "!"
                ) : isDone ? (
                  <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M16.704 5.29a1 1 0 010 1.415l-7.5 7.5a1 1 0 01-1.415 0l-3.5-3.5a1 1 0 111.415-1.414L8.5 12.086l6.79-6.795a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : isActive ? (
                  <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                )}
              </span>
              <span
                className={`text-body-lg ${
                  isFailed ? "text-critical" : isDone || isActive ? "text-ink" : "text-faint"
                }`}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ul>

      {status === "completed" && (
        <p className="mt-6 text-body-lg font-medium text-forest">Completed</p>
      )}
    </div>
  );
}
