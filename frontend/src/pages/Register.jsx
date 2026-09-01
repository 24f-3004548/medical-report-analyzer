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
  dob: "",
  gender: "",
};

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

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
    if (!form.dob) next.dob = "Date of birth is required.";
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(form.dob)) next.dob = "Enter a valid date of birth (YYYY-MM-DD).";
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
        name: form.fullName,
        email: form.email,
        password: form.password,
        dob: form.dob,
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
              <label htmlFor="dob" className="block text-body-sm font-medium text-ink mb-1.5">
                Date of birth
              </label>
              <input
                id="dob"
                type="date"
                value={form.dob}
                onChange={update("dob")}
                className={fieldClass("dob")}
              />
              {errors.dob && <p className="mt-1 text-body-sm text-critical">{errors.dob}</p>}
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
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={update("password")}
              className={fieldClass("password")}
            />
            {errors.password && <p className="mt-1 text-body-sm text-critical">{errors.password}</p>}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-body-sm font-medium text-ink mb-1.5">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={update("confirmPassword")}
              className={fieldClass("confirmPassword")}
            />
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
