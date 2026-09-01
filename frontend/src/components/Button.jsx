import { forwardRef } from "react";

const base =
  "inline-flex items-center justify-center gap-2 font-body font-medium rounded-btn transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed";

const sizeClasses = {
  sm: "text-body-sm px-3 py-1.5",
  md: "text-body px-4 py-2.5",
  lg: "text-body-lg px-5 py-3",
};

const variantClasses = {
  primary: "bg-forest text-white hover:bg-[#255840] active:bg-[#204a37]",
  secondary: "bg-white text-forest border border-forest hover:bg-forest-light",
  ghost: "bg-transparent text-ink hover:bg-forest-light",
  danger: "bg-critical text-white hover:bg-[#a53024]",
  "danger-ghost": "bg-transparent text-critical border border-critical/40 hover:bg-critical-bg",
};

const Button = forwardRef(function Button(
  { children, variant = "primary", size = "md", className = "", loading = false, disabled, type = "button", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={`${base} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
});

export default Button;
