import ResultStatus from "./ResultStatus";

export default function ResultCard({ result }) {
  const { testName, value, unit, referenceRange, status, meaning, explanation, caution } = result;
  const readings = result.readings || [result];

  return (
    <details className="group rounded-card border border-border bg-white">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 sm:p-5 [&::-webkit-details-marker]:hidden">
        <h4 className="font-body font-semibold text-body-lg text-ink">{testName}</h4>
        <svg className="h-4 w-4 shrink-0 text-muted transition-transform group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </summary>

      <div className="border-t border-border px-4 pb-5 pt-4 sm:px-5">
        <div className="space-y-4">
          {readings.map((reading, index) => (
            <div key={`${reading.value}-${reading.unit}-${index}`} className="space-y-3">
              {readings.length > 1 && <p className="text-label font-semibold uppercase tracking-wide text-muted">{reading.unit === "%" ? "Percentage" : "Absolute value"}</p>}
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="text-h2 font-display text-ink">{reading.value ?? value}</span>
                {(reading.unit ?? unit) && <span className="text-body text-muted">{reading.unit ?? unit}</span>}
                {(reading.status ?? status) && <ResultStatus status={reading.status ?? status} />}
              </div>
              {(reading.referenceRange ?? referenceRange) && (
                <p className="text-body-sm text-muted">Reference range <span className="text-ink">{reading.referenceRange ?? referenceRange}</span>{(reading.unit ?? unit) ? ` ${reading.unit ?? unit}` : ""}</p>
              )}
              {(reading.meaning ?? meaning ?? reading.explanation ?? explanation) && (
                <div className="space-y-2.5 border-t border-border pt-3">
                  {(reading.meaning ?? meaning) && <div><p className="text-body-sm font-medium text-muted">What this means</p><p className="mt-0.5 text-body text-ink">{reading.meaning ?? meaning}</p></div>}
                  {(reading.explanation ?? explanation) && <div><p className="text-body-sm font-medium text-muted">Explanation</p><p className="mt-0.5 text-body text-ink">{reading.explanation ?? explanation}</p></div>}
                </div>
              )}
              {(reading.caution ?? caution) && <div className="flex gap-2 rounded-tag bg-warning-bg px-3 py-2.5"><svg className="mt-0.5 h-4 w-4 shrink-0 text-warning" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.72-1.36 3.485 0l6.28 11.18c.75 1.334-.213 2.987-1.742 2.987H3.72c-1.53 0-2.492-1.653-1.743-2.987l6.28-11.18zM11 14a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V7a1 1 0 00-1-1z" clipRule="evenodd" /></svg><p className="text-body-sm text-ink">{reading.caution ?? caution}</p></div>}
            </div>
          ))}
        </div>
      </div>
    </details>
  );
}
