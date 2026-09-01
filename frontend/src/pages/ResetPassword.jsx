import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import { api, ApiError } from "../services/api";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resetToken, setResetToken] = useState("");

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const searchParams = new URLSearchParams(window.location.search);
    const token = hashParams.get("access_token") || searchParams.get("access_token");
    const type = hashParams.get("type") || searchParams.get("type");

    if (!token || type !== "recovery") {
      setError("Invalid or expired reset link. Please request a new one.");
      return;
    }

    setResetToken(token);
    window.history.replaceState(null, "", window.location.pathname);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.password) {
      setError("Password is required.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords don't match.");
      return;
    }

    if (!resetToken) {
      setError("Reset token is missing. Please request a new password reset link.");
      return;
    }

    setLoading(true);
    try {
      await api.resetPassword(resetToken, form.password);
      setSuccess(true);
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fieldClass = (hasError) =>
    `w-full rounded-btn border px-3 py-2.5 text-body text-ink bg-white focus:border-forest focus:outline-none ${
      hasError ? "border-critical" : "border-border"
    }`;

  if (error && !resetToken) {
    return (
      <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-10 py-16 sm:py-24">
        <div className="mx-auto w-full max-w-sm">
          <div className="text-center">
            <h1 className="font-display text-h1 text-ink">Invalid reset link</h1>
            <p className="mt-2 text-body text-muted">The password reset link has expired or is invalid.</p>
            <Link to="/forgot-password">
              <Button className="mt-6">Request a new reset link</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-10 py-16 sm:py-24">
        <div className="mx-auto w-full max-w-sm">
          <div className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-forest-light flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="font-display text-h1 text-ink">Password reset successfully</h1>
            <p className="mt-2 text-body text-muted">Your password has been updated. Redirecting you to sign in...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-10 py-16 sm:py-24">
      <div className="mx-auto w-full max-w-sm">
        <h1 className="font-display text-h1 text-ink">Set a new password</h1>
        <p className="mt-1.5 text-body text-muted">Enter your new password below.</p>

        <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
          {error && (
            <div className="rounded-tag bg-critical-bg px-3 py-2.5 text-body-sm text-critical" role="alert">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="password" className="block text-body-sm font-medium text-ink mb-1.5">
              New password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className={fieldClass(!!error && !form.password)}
            />
          </div>

          <div>
            <label htmlFor="confirm" className="block text-body-sm font-medium text-ink mb-1.5">
              Confirm password
            </label>
            <input
              id="confirm"
              type="password"
              autoComplete="new-password"
              value={form.confirm}
              onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
              className={fieldClass(!!error && form.password !== form.confirm)}
            />
          </div>

          <Button type="submit" size="lg" className="w-full" loading={loading}>
            Reset password
          </Button>
        </form>

        <p className="mt-6 text-body text-muted text-center">
          Remember your password?{" "}
          <Link to="/login" className="text-forest font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
