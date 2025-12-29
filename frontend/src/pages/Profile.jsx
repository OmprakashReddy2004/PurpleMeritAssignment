import { useEffect, useState } from "react";
import api from "../api/client";
import { useAuth } from "../auth/AuthContext";
import Toast from "../components/Toast";

export default function Profile() {
  const { user, loadMe } = useAuth();

  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState(user?.full_name || "");
  const [email, setEmail] = useState(user?.email || "");

  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmNewPw, setConfirmNewPw] = useState("");

  useEffect(() => {
    setFullName(user?.full_name || "");
    setEmail(user?.email || "");
  }, [user]);

  const saveProfile = async () => {
    setToast(null);
    if (!fullName.trim() && !email.trim()) {
      setToast({ type: "error", message: "Nothing to update." });
      return;
    }
    try {
      setSaving(true);
      await api.patch("/api/users/me", { full_name: fullName, email });
      await loadMe();
      setToast({ type: "success", message: "Profile updated" });
    } catch (err) {
      const msg =
        (typeof err?.response?.data?.error === "string" && err.response.data.error) ||
        (err?.response?.data?.error && JSON.stringify(err.response.data.error)) ||
        "Profile update failed";
      setToast({ type: "error", message: msg });
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    setToast(null);
    if (!oldPw || !newPw || !confirmNewPw) {
      setToast({ type: "error", message: "Fill all password fields." });
      return;
    }
    if (newPw !== confirmNewPw) {
      setToast({ type: "error", message: "New passwords do not match." });
      return;
    }
    try {
      setSaving(true);
      await api.patch("/api/users/change-password/", {
        old_password: oldPw,
        new_password: newPw,
        confirm_new_password: confirmNewPw,
      });
      setOldPw("");
      setNewPw("");
      setConfirmNewPw("");
      setToast({ type: "success", message: "Password updated" });
    } catch (err) {
      const msg =
        (typeof err?.response?.data?.error === "string" && err.response.data.error) ||
        (err?.response?.data?.error && JSON.stringify(err.response.data.error)) ||
        "Password update failed";
      setToast({ type: "error", message: msg });
    } finally {
      setSaving(false);
    }
  };

  const resetProfile = () => {
    setFullName(user?.full_name || "");
    setEmail(user?.email || "");
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <h1 className="text-2xl font-semibold text-slate-900">My Profile</h1>
      <p className="text-slate-600 mt-1">View and update your account.</p>

      <div className="mt-5 grid gap-4">
        {/* Profile card */}
        <div className="bg-white border rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900">Profile</h2>

          <div className="mt-4 grid gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Full name</label>
              <input
                className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Email</label>
              <input
                className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={saveProfile}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={resetProfile}
                className="px-4 py-2 rounded-lg border hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>

        {/* Password card */}
        <div className="bg-white border rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900">Change Password</h2>

          <div className="mt-4 grid gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Old password</label>
              <input
                className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
                value={oldPw}
                onChange={(e) => setOldPw(e.target.value)}
                type="password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">New password</label>
              <input
                className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                type="password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Confirm new password</label>
              <input
                className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
                value={confirmNewPw}
                onChange={(e) => setConfirmNewPw(e.target.value)}
                type="password"
              />
            </div>

            <button
              onClick={changePassword}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-60 w-fit"
            >
              {saving ? "Updating..." : "Update password"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
