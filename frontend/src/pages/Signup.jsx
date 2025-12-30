import { Eye, EyeOff } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../api/client";
import Toast from "../components/Toast";

/* ---------- Password strength logic ---------- */
function getPasswordStrength(pw) {
  if (!pw) return { label: "", score: 0 };

  let score = 0;
  if (pw.length >= 6) score++;
  if (/\d/.test(pw)) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (pw.length >= 8 && score >= 4)
    return { label: "Strong", score: 3 };
  if (score >= 2)
    return { label: "Medium", score: 2 };
  return { label: "Weak", score: 1 };
}

export default function Signup() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [cpw, setCpw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const strength = useMemo(() => getPasswordStrength(pw), [pw]);

  const submit = async (e) => {
    e.preventDefault();
    setToast(null);

    if (!fullName.trim() || !email.trim() || !pw || !cpw) {
      setToast({ type: "error", message: "All fields are required." });
      return;
    }

    if (pw !== cpw) {
      setToast({ type: "error", message: "Passwords do not match." });
      return;
    }

    if (strength.label !== "Strong") {
      setToast({
        type: "error",
        message: "Password must be strong to continue.",
      });
      return;
    }

    try {
      setLoading(true);
      await api.post("/api/auth/signup/", {
        full_name: fullName,
        email,
        password: pw,
        confirm_password: cpw,
      });

      setToast({ type: "success", message: "Account created. Please login." });
      setTimeout(() => navigate("/login"), 700);
    } catch (err) {
      const data = err?.response?.data;
      const msg =
        data?.error ||
        data?.detail ||
        "Signup failed";

      setToast({ type: "error", message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-xl border border-slate-800 bg-slate-900 p-8 shadow-lg"
      >
        <h1 className="text-2xl font-semibold text-white">Create account</h1>
        <p className="text-sm text-slate-400 mt-1">
          Get started in less than a minute.
        </p>

        {/* Full name */}
        <div className="mt-6">
          <label className="text-sm text-slate-300">Full name</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-2 w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2.5 text-slate-100"
          />
        </div>

        {/* Email */}
        <div className="mt-5">
          <label className="text-sm text-slate-300">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2.5 text-slate-100"
          />
        </div>

        {/* Password */}
        <div className="mt-5">
          <label className="text-sm text-slate-300">Password</label>

          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              className="mt-2 w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2.5 pr-10 text-slate-100"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            >
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Strength bar */}
          {pw && (
            <div className="mt-2">
              <div className="flex gap-1">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded ${
                      strength.score >= i
                        ? strength.label === "Strong"
                          ? "bg-green-500"
                          : strength.label === "Medium"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                        : "bg-slate-700"
                    }`}
                  />
                ))}
              </div>
              <p
                className={`mt-1 text-xs ${
                  strength.label === "Strong"
                    ? "text-green-400"
                    : strength.label === "Medium"
                    ? "text-yellow-400"
                    : "text-red-400"
                }`}
              >
                Password strength: {strength.label}
              </p>
            </div>
          )}
        </div>

        {/* Confirm password */}
        <div className="mt-5">
          <label className="text-sm text-slate-300">Confirm password</label>
          <div className="relative">
            <input
              type={showCpw ? "text" : "password"}
              value={cpw}
              onChange={(e) => setCpw(e.target.value)}
              className="mt-2 w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2.5 pr-10 text-slate-100"
            />
            <button
              type="button"
              onClick={() => setShowCpw(!showCpw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            >
              {showCpw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          disabled={loading}
          className="mt-7 w-full rounded-lg bg-white py-2.5 text-slate-900 font-medium disabled:opacity-60"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link to="/login" className="text-white hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
