import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../auth/AuthContext";
import Toast from "../components/Toast";

export default function Profile() {
  const { user, loadMe, logout } = useAuth();
  const navigate = useNavigate();

  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmNewPw, setConfirmNewPw] = useState("");

  const [showOldPw, setShowOldPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  /* =========================
     LOGOUT
  ========================== */
  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  /* =========================
     PROFILE UPDATE
  ========================== */
  const saveProfile = async () => {
    setToast(null);

    if (!fullName.trim() && !email.trim()) {
      setToast({ type: "error", message: "Nothing to update." });
      return;
    }

    try {
      setSaving(true);
      await api.patch("/api/users/me/", {
        full_name: fullName,
        email,
      });
      await loadMe();
      setToast({ type: "success", message: "Profile updated" });
    } catch (err) {
      const msg =
        err?.response?.data?.error ??
        "Profile update failed";
      setToast({ type: "error", message: msg });
    } finally {
      setSaving(false);
    }
  };

  /* =========================
     PASSWORD CHANGE
  ========================== */
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
        err?.response?.data?.error ??
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0b0f1a] px-4 py-8 relative">
      {/* Logout */}
      <button
        onClick={handleLogout}
        className="absolute top-6 right-6 px-4 py-2 rounded-lg
                   bg-red-500/20 border border-red-500/40 text-red-300
                   hover:bg-red-500/30 transition"
      >
        Logout
      </button>

      {/* Glow blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-cyan-500/30 rounded-full blur-3xl animate-pulse delay-200" />

      <Toast toast={toast} onClose={() => setToast(null)} />

      <h1 className="text-3xl font-bold text-white mb-6">My Profile</h1>

      <div className="w-full max-w-3xl grid gap-6">
        {/* PROFILE */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Profile</h2>

          <div className="grid gap-4">
            <div>
              <label className="text-sm text-gray-300">Full name</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 w-full rounded-lg bg-transparent border border-white/20 px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="text-sm text-gray-300">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg bg-transparent border border-white/20 px-3 py-2 text-white"
              />
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={saveProfile}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-purple-500 text-black font-semibold"
              >
                {saving ? "Saving..." : "Save"}
              </button>

              <button
                onClick={resetProfile}
                className="px-4 py-2 rounded-lg border border-white/30 text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>

        {/* PASSWORD */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Change Password
          </h2>

          <div className="grid gap-4">
            {[
              ["Old password", oldPw, setOldPw, showOldPw, setShowOldPw],
              ["New password", newPw, setNewPw, showNewPw, setShowNewPw],
              ["Confirm new password", confirmNewPw, setConfirmNewPw, showConfirmPw, setShowConfirmPw],
            ].map(([label, value, setter, show, toggle], i) => (
              <div key={i} className="relative">
                <label className="text-sm text-gray-300">{label}</label>
                <input
                  type={show ? "text" : "password"}
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  className="mt-1 w-full rounded-lg bg-transparent border border-white/20 px-3 py-2 text-white"
                />
                <button
                  type="button"
                  onClick={() => toggle(!show)}
                  className="absolute right-3 top-9 text-gray-400"
                >
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            ))}

            <button
              onClick={changePassword}
              disabled={saving}
              className="mt-3 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-400 to-cyan-500 text-black font-semibold w-fit"
            >
              {saving ? "Updating..." : "Update password"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
