import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/Button";
import { api, ApiError } from "../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      await api.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn't send the reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-10 py-16 sm:py-24">
      <div className="mx-auto w-full max-w-sm">
        <h1 className="font-display text-h1 text-ink">Reset your password</h1>
        <p className="mt-1.5 text-body text-muted">We'll email you a link to reset your password.</p>

        {sent ? (
          <div className="mt-8 rounded-tag bg-forest-light px-3 py-2.5 text-body-sm text-forest">
            If an account exists for {email}, a reset link is on its way.
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
            {error && (
              <div className="rounded-tag bg-critical-bg px-3 py-2.5 text-body-sm text-critical" role="alert">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-body-sm font-medium text-ink mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-btn border border-border px-3 py-2.5 text-body text-ink bg-white focus:border-forest focus:outline-none"
              />
            </div>
            <Button type="submit" size="lg" className="w-full" loading={loading}>
              Send reset link
            </Button>
          </form>
        )}

        <p className="mt-6 text-body text-muted text-center">
          <Link to="/login" className="text-forest font-medium hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
