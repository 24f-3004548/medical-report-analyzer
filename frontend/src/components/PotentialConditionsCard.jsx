export default function PotentialConditionsCard({ conditions = [] }) {
  if (!conditions.length) return null;

  return (
    <section className="mt-6 rounded-card border border-warning/30 bg-warning-bg p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <svg className="mt-0.5 h-5 w-5 shrink-0 text-warning" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
          <path d="M12 3 2.8 19h18.4L12 3Z" />
          <path d="M12 9v4M12 16h.01" strokeLinecap="round" />
        </svg>
        <div>
          <p className="text-label font-semibold uppercase tracking-[0.16em] text-warning">For clinician discussion</p>
          <h2 className="mt-1 font-display text-h2 text-ink">Potential conditions to consider</h2>
          <p className="mt-2 text-body-sm text-ink/70">These are possible explanations for the reported findings, not diagnoses. A qualified clinician must interpret them with your full medical context.</p>
        </div>
      </div>
      <div className="mt-5 space-y-3">
        {conditions.map((condition, index) => (
          <div key={`${condition.name}-${index}`} className="rounded-btn border border-warning/20 bg-white/70 p-4">
            <h3 className="font-body text-body-lg font-semibold text-ink">{condition.name}</h3>
            {condition.supportingFindings?.length > 0 && (
              <div className="mt-3">
                <p className="text-label font-semibold uppercase tracking-wide text-muted">Supporting findings</p>
                <ul className="mt-1 space-y-1 text-body-sm text-ink">
                  {condition.supportingFindings.map((finding, findingIndex) => <li key={`${finding}-${findingIndex}`}>{finding}</li>)}
                </ul>
              </div>
            )}
            {condition.caveat && <p className="mt-3 text-body-sm text-muted">{condition.caveat}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
