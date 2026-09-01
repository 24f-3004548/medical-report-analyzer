import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import ConfirmModal from "../components/ConfirmModal";
import { useAuth } from "../context/AuthContext";
import { api, ApiError } from "../services/api";

export default function Profile() {
  const { user, logout, refresh } = useAuth();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || "",
    dateOfBirth: user?.dateOfBirth || "",
    gender: user?.gender || "",
  });
  const [profileError, setProfileError] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: "", next: "", confirm: "" });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordMessage, setPasswordMessage] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileError("");
    setSavingProfile(true);
    try {
      await api.updateProfile(profileForm);
      await refresh();
      setEditing(false);
    } catch (err) {
      setProfileError(err instanceof ApiError ? err.message : "We couldn't save your changes.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage("");
    const next = {};
    if (!passwordForm.current) next.current = "Current password is required.";
    if (!passwordForm.next) next.next = "New password is required.";
    else if (passwordForm.next.length < 8) next.next = "Password must be at least 8 characters.";
    if (passwordForm.next !== passwordForm.confirm) next.confirm = "Passwords don't match.";
    setPasswordErrors(next);
    if (Object.keys(next).length > 0) return;

    setSavingPassword(true);
    try {
      await api.changePassword({
        currentPassword: passwordForm.current,
        newPassword: passwordForm.next,
      });
      setPasswordMessage("Password updated.");
      setPasswordForm({ current: "", next: "", confirm: "" });
      setShowPasswordForm(false);
    } catch (err) {
      setPasswordMessage(err instanceof ApiError ? err.message : "We couldn't update your password.");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await api.deleteAccount();
      await logout();
      navigate("/");
    } catch {
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-10">
      <div>
        <h1 className="font-display text-h1 text-ink">Profile</h1>
        <p className="mt-1.5 text-body text-muted">Manage your personal information and account settings.</p>
      </div>

      {/* Personal information */}
      <section className="rounded-card border border-border bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-body font-semibold text-body-lg text-ink">Personal information</h2>
          {!editing && (
            <button onClick={() => setEditing(true)} className="text-body-sm font-medium text-forest hover:underline">
              Edit profile
            </button>
          )}
        </div>

        {!editing ? (
          <dl className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <dt className="text-body-sm text-muted">Name</dt>
              <dd className="text-body text-ink mt-0.5">{user?.fullName || "—"}</dd>
            </div>
            <div>
              <dt className="text-body-sm text-muted">Email</dt>
              <dd className="text-body text-ink mt-0.5">{user?.email || "—"}</dd>
            </div>
            <div>
              <dt className="text-body-sm text-muted">Date of Birth</dt>
              <dd className="text-body text-ink mt-0.5">{user?.dateOfBirth || "—"}</dd>
            </div>
            <div>
              <dt className="text-body-sm text-muted">Gender</dt>
              <dd className="text-body text-ink mt-0.5">{user?.gender || "—"}</dd>
            </div>
          </dl>
        ) : (
          <form onSubmit={handleSaveProfile} className="mt-4 space-y-4">
            {profileError && (
              <div className="rounded-tag bg-critical-bg px-3 py-2.5 text-body-sm text-critical">{profileError}</div>
            )}
            <div>
              <label className="block text-body-sm font-medium text-ink mb-1.5">Name</label>
              <input
                value={profileForm.fullName}
                onChange={(e) => setProfileForm((f) => ({ ...f, fullName: e.target.value }))}
                className="w-full rounded-btn border border-border px-3 py-2.5 text-body text-ink focus:border-forest focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-body-sm font-medium text-ink mb-1.5">Date of Birth</label>
                <input
                  type="date"
                  value={profileForm.dateOfBirth}
                  onChange={(e) => setProfileForm((f) => ({ ...f, dateOfBirth: e.target.value }))}
                  className="w-full rounded-btn border border-border px-3 py-2.5 text-body text-ink focus:border-forest focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-body-sm font-medium text-ink mb-1.5">Gender</label>
                <select
                  value={profileForm.gender}
                  onChange={(e) => setProfileForm((f) => ({ ...f, gender: e.target.value }))}
                  className="w-full rounded-btn border border-border px-3 py-2.5 text-body text-ink focus:border-forest focus:outline-none"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="submit" loading={savingProfile}>
                Save changes
              </Button>
              <Button type="button" variant="ghost" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </section>

      {/* Security */}
      <section className="rounded-card border border-border bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-body font-semibold text-body-lg text-ink">Security</h2>
          {!showPasswordForm && (
            <button
              onClick={() => setShowPasswordForm(true)}
              className="text-body-sm font-medium text-forest hover:underline"
            >
              Change password
            </button>
          )}
        </div>

        {passwordMessage && !showPasswordForm && (
          <p className="mt-3 text-body-sm text-forest">{passwordMessage}</p>
        )}

        {showPasswordForm && (
          <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
            <div>
              <label className="block text-body-sm font-medium text-ink mb-1.5">Current password</label>
              <input
                type="password"
                value={passwordForm.current}
                onChange={(e) => setPasswordForm((f) => ({ ...f, current: e.target.value }))}
                className={`w-full rounded-btn border px-3 py-2.5 text-body text-ink focus:border-forest focus:outline-none ${
                  passwordErrors.current ? "border-critical" : "border-border"
                }`}
              />
              {passwordErrors.current && <p className="mt-1 text-body-sm text-critical">{passwordErrors.current}</p>}
            </div>
            <div>
              <label className="block text-body-sm font-medium text-ink mb-1.5">New password</label>
              <input
                type="password"
                value={passwordForm.next}
                onChange={(e) => setPasswordForm((f) => ({ ...f, next: e.target.value }))}
                className={`w-full rounded-btn border px-3 py-2.5 text-body text-ink focus:border-forest focus:outline-none ${
                  passwordErrors.next ? "border-critical" : "border-border"
                }`}
              />
              {passwordErrors.next && <p className="mt-1 text-body-sm text-critical">{passwordErrors.next}</p>}
            </div>
            <div>
              <label className="block text-body-sm font-medium text-ink mb-1.5">Confirm new password</label>
              <input
                type="password"
                value={passwordForm.confirm}
                onChange={(e) => setPasswordForm((f) => ({ ...f, confirm: e.target.value }))}
                className={`w-full rounded-btn border px-3 py-2.5 text-body text-ink focus:border-forest focus:outline-none ${
                  passwordErrors.confirm ? "border-critical" : "border-border"
                }`}
              />
              {passwordErrors.confirm && <p className="mt-1 text-body-sm text-critical">{passwordErrors.confirm}</p>}
            </div>
            <div className="flex gap-3">
              <Button type="submit" loading={savingPassword}>
                Update password
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowPasswordForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </section>

      {/* Account */}
      <section className="rounded-card border border-border bg-white p-6">
        <h2 className="font-body font-semibold text-body-lg text-ink">Account</h2>
        <div className="mt-4">
          <Button variant="secondary" onClick={handleLogout}>
            Log out
          </Button>
        </div>
      </section>

      {/* Danger zone */}
      <section className="rounded-card border border-critical/30 bg-white p-6">
        <h2 className="font-body font-semibold text-body-lg text-critical">Delete Account</h2>
        <p className="mt-1.5 text-body text-muted">
          Deleting your account permanently removes your data and cannot be undone.
        </p>
        <div className="mt-4">
          <Button variant="danger-ghost" onClick={() => setDeleteOpen(true)}>
            Delete account
          </Button>
        </div>
      </section>

      <ConfirmModal
        open={deleteOpen}
        title="Delete your account?"
        description="This is permanent. Your account and all associated reports will be deleted and cannot be recovered."
        confirmLabel="Delete account"
        variant="danger"
        loading={deleting}
        onConfirm={handleDeleteAccount}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}
