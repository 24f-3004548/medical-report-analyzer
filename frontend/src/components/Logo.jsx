const sizes = {
  sm: { icon: 22, text: "text-h3" },
  md: { icon: 28, text: "text-h1" },
  lg: { icon: 38, text: "text-display" },
};

export default function Logo({ size = "md", variant = "default", withWordmark = true, className = "" }) {
  const { icon, text } = sizes[size];
  const isReversed = variant === "reversed";
  const iconFill = isReversed ? "#FFFFFF" : "#2D6A4F";
  const textColor = isReversed ? "text-white" : "text-ink";

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect x="2" y="2" width="28" height="28" rx="7" fill={iconFill} />
        <path d="M16 8v16M8 16h16" stroke={isReversed ? "#2D6A4F" : "#FFFFFF"} strokeWidth="2.6" strokeLinecap="round" />
      </svg>
      {withWordmark && (
        <span className={`font-display font-medium ${text} ${textColor}`}>Veris</span>
      )}
    </div>
  );
}
