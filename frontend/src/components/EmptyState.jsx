export default function EmptyState({ title, description, action, icon }) {
  return (
    <div className="flex flex-col items-center justify-center text-center rounded-card border border-dashed border-border bg-white px-6 py-16">
      {icon && <div className="mb-4 text-forest">{icon}</div>}
      <h3 className="font-display text-h3 text-ink mb-1.5">{title}</h3>
      {description && <p className="text-body text-muted max-w-sm mb-6">{description}</p>}
      {action}
    </div>
  );
}
