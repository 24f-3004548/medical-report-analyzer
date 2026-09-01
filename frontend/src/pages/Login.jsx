import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../services/api";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const next = {};
    if (!form.email.trim()) next.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid email address.";
    if (!form.password) next.password = "Password is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!validate()) return;

    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "We couldn't sign you in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-10 py-16 sm:py-24">
      <div className="mx-auto w-full max-w-sm">
        <h1 className="font-display text-h1 text-ink">Sign in</h1>
        <p className="mt-1.5 text-body text-muted">Welcome back to Veris.</p>

        <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
          {formError && (
            <div className="rounded-tag bg-critical-bg px-3 py-2.5 text-body-sm text-critical" role="alert">
              {formError}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-body-sm font-medium text-ink mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className={`w-full rounded-btn border px-3 py-2.5 text-body text-ink bg-white focus:border-forest focus:outline-none ${
                errors.email ? "border-critical" : "border-border"
              }`}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {errors.email && (
              <p id="email-error" className="mt-1 text-body-sm text-critical">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="block text-body-sm font-medium text-ink">
                Password
              </label>
              <Link to="/forgot-password" className="text-body-sm text-forest hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                className={`w-full rounded-btn border px-3 py-2.5 text-body text-ink bg-white focus:border-forest focus:outline-none pr-10 ${
                  errors.password ? "border-critical" : "border-border"
                }`}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : undefined}
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
            {errors.password && (
              <p id="password-error" className="mt-1 text-body-sm text-critical">
                {errors.password}
              </p>
            )}
          </div>

          <Button type="submit" size="lg" className="w-full" loading={loading}>
            Sign in
          </Button>
        </form>

        <p className="mt-6 text-body text-muted text-center">
          Don't have an account?{" "}
          <Link to="/register" className="text-forest font-medium hover:underline">
            Register
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
