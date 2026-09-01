export default function SourceCard({ source }) {
  const { name, topic, title, url } = source;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-card border border-border bg-white p-4 hover:border-forest transition-colors duration-150"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {topic && <p className="text-body-sm text-muted">{topic}</p>}
          <p className="text-body-lg font-medium text-ink mt-0.5">{title}</p>
          {name && <p className="text-body-sm text-muted mt-0.5">{name}</p>}
        </div>
        <svg className="h-4 w-4 shrink-0 text-forest mt-1" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
          <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
        </svg>
      </div>
    </a>
  );
}
