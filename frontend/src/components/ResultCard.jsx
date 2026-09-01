import ResultStatus from "./ResultStatus";

export default function ResultCard({ result }) {
  const { testName, value, unit, referenceRange, status, meaning, explanation, caution } = result;
  const readings = result.readings || [result];
  const hasMultipleReadings = readings.length > 1;

  return (
    <div className="rounded-card border border-border bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 className="font-body font-semibold text-body-lg text-ink">{testName}</h4>
          {hasMultipleReadings ? (
            <div className="mt-3 space-y-2">
              {readings.map((reading, index) => (
                <div key={`${reading.value}-${reading.unit}-${index}`} className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="text-body-sm text-muted">{reading.unit === "%" ? "Percentage" : "Absolute value"}</span>
                  <span className="text-h2 font-display text-ink">{reading.value}</span>
                  {reading.unit && <span className="text-body text-muted">{reading.unit}</span>}
                  {reading.status && <ResultStatus status={reading.status} />}
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-1 text-h2 font-display text-ink">
              {value}
              {unit && <span className="ml-1 text-body text-muted font-body">{unit}</span>}
            </p>
          )}
        </div>
        {!hasMultipleReadings && status && <ResultStatus status={status} />}
      </div>

      {!hasMultipleReadings && referenceRange && (
        <p className="mt-3 text-body-sm text-muted">
          Reference range <span className="text-ink">{referenceRange}</span>
          {unit ? ` ${unit}` : ""}
        </p>
      )}

      {!hasMultipleReadings && (meaning || explanation) && (
        <div className="mt-4 border-t border-border pt-4 space-y-2.5">
          {meaning && (
            <div>
              <p className="text-body-sm font-medium text-muted">What this means</p>
              <p className="text-body text-ink mt-0.5">{meaning}</p>
            </div>
          )}
          {explanation && (
            <div>
              <p className="text-body-sm font-medium text-muted">Explanation</p>
              <p className="text-body text-ink mt-0.5">{explanation}</p>
            </div>
          )}
        </div>
      )}

      {!hasMultipleReadings && caution && (
        <div className="mt-4 flex gap-2 rounded-tag bg-warning-bg px-3 py-2.5">
          <svg className="h-4 w-4 shrink-0 text-warning mt-0.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.72-1.36 3.485 0l6.28 11.18c.75 1.334-.213 2.987-1.742 2.987H3.72c-1.53 0-2.492-1.653-1.743-2.987l6.28-11.18zM11 14a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V7a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-body-sm text-ink">{caution}</p>
        </div>
      )}
    </div>
  );
}
