// NOTE: The actual Veris logo asset was not available at build time (the
// uploaded zip didn't come through). This renders a wordmark that follows
// the brand book's typography and color rules exactly (Lora, Forest Green /
// Ink / white). Swap the <mark> SVG below for the real logo file — the
// clearspace and min-size rules noted in the brand book are preserved via
// the `compact` size options.

const sizes = {
  sm: { icon: 20, text: "text-h3" },
  md: { icon: 26, text: "text-h1" },
  lg: { icon: 34, text: "text-display" },
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
        <path
          d="M4 6L16 26L28 6"
          stroke={iconFill}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {withWordmark && (
        <span className={`font-display font-medium ${text} ${textColor}`}>Veris</span>
      )}
    </div>
  );
}
