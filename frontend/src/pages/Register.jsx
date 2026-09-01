import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../services/api";

const GENDER_OPTIONS = [
  { value: "", label: "Select gender" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

const initialForm = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  dateOfBirth: "",
  gender: "",
};

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const next = {};
    if (!form.fullName.trim()) next.fullName = "Full name is required.";
    if (!form.email.trim()) next.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid email address.";
    if (!form.password) next.password = "Password is required.";
    else if (form.password.length < 8) next.password = "Password must be at least 8 characters.";
    if (!form.confirmPassword) next.confirmPassword = "Please confirm your password.";
    else if (form.password !== form.confirmPassword) next.confirmPassword = "Passwords don't match.";
    if (!form.dateOfBirth) next.dateOfBirth = "Date of birth is required.";
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(form.dateOfBirth)) next.dateOfBirth = "Enter a valid date of birth (YYYY-MM-DD).";
    if (!form.gender) next.gender = "Please select a gender.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!validate()) return;

    setLoading(true);
    try {
      await register({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
      });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "We couldn't create your account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fieldClass = (field) =>
    `w-full rounded-btn border px-3 py-2.5 text-body text-ink bg-white focus:border-forest focus:outline-none ${
      errors[field] ? "border-critical" : "border-border"
    }`;

  return (
    <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-10 py-16 sm:py-24">
      <div className="mx-auto w-full max-w-sm">
        <h1 className="font-display text-h1 text-ink">Create your account</h1>
        <p className="mt-1.5 text-body text-muted">Start understanding your lab reports.</p>

        <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
          {formError && (
            <div className="rounded-tag bg-critical-bg px-3 py-2.5 text-body-sm text-critical" role="alert">
              {formError}
            </div>
          )}

          <div>
            <label htmlFor="fullName" className="block text-body-sm font-medium text-ink mb-1.5">
              Full name
            </label>
            <input id="fullName" value={form.fullName} onChange={update("fullName")} className={fieldClass("fullName")} />
            {errors.fullName && <p className="mt-1 text-body-sm text-critical">{errors.fullName}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-body-sm font-medium text-ink mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={update("email")}
              className={fieldClass("email")}
            />
            {errors.email && <p className="mt-1 text-body-sm text-critical">{errors.email}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="dateOfBirth" className="block text-body-sm font-medium text-ink mb-1.5">
                Date of birth
              </label>
              <input
                id="dateOfBirth"
                type="date"
                value={form.dateOfBirth}
                onChange={update("dateOfBirth")}
                className={fieldClass("dateOfBirth")}
              />
              {errors.dateOfBirth && <p className="mt-1 text-body-sm text-critical">{errors.dateOfBirth}</p>}
            </div>
            <div>
              <label htmlFor="gender" className="block text-body-sm font-medium text-ink mb-1.5">
                Gender
              </label>
              <select id="gender" value={form.gender} onChange={update("gender")} className={fieldClass("gender")}>
                {GENDER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.gender && <p className="mt-1 text-body-sm text-critical">{errors.gender}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-body-sm font-medium text-ink mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={form.password}
                onChange={update("password")}
                className={`${fieldClass("password")} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted transition-colors hover:text-ink focus:outline-none focus:ring-2 focus:ring-forest/40"
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-body-sm text-critical">{errors.password}</p>}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-body-sm font-medium text-ink mb-1.5">
              Confirm password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={update("confirmPassword")}
                className={`${fieldClass("confirmPassword")} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((visible) => !visible)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted transition-colors hover:text-ink focus:outline-none focus:ring-2 focus:ring-forest/40"
                aria-label={showConfirmPassword ? "Hide password confirmation" : "Show password confirmation"}
                aria-pressed={showConfirmPassword}
              >
                {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {errors.confirmPassword && <p className="mt-1 text-body-sm text-critical">{errors.confirmPassword}</p>}
          </div>

          <Button type="submit" size="lg" className="w-full" loading={loading}>
            Create account
          </Button>
        </form>

        <p className="mt-6 text-body text-muted text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-forest font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12S5.625 5.25 12 5.25 21.75 12 21.75 12 18.375 18.75 12 18.75 2.25 12 2.25 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m3 3 18 18M10.584 10.587a2 2 0 0 0 2.829 2.828M9.881 5.09A10.94 10.94 0 0 1 12 4.875c6.375 0 9.75 7.125 9.75 7.125a18.01 18.01 0 0 1-3.205 4.361M6.228 6.228A18.142 18.142 0 0 0 2.25 12S5.625 19.125 12 19.125a10.89 10.89 0 0 0 3.314-.516" />
    </svg>
  );
}
