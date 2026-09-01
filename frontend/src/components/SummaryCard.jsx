export default function SummaryCard({ summary }) {
  if (!summary) return null;

  return (
    <div className="rounded-card bg-forest-light p-6">
      <p className="text-body-sm font-medium text-forest uppercase tracking-wide">Overall summary</p>
      <p className="mt-2 text-body-lg text-ink leading-relaxed">{summary}</p>
    </div>
  );
}
