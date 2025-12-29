import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";
import Toast from "../components/Toast";

function strongPassword(pw) {
  // quick client-side check (server is authoritative)
  return pw.length >= 8 && /[A-Z]/i.test(pw) && /\d/.test(pw);
}

export default function Signup() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [cpw, setCpw] = useState("");

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

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
    if (!strongPassword(pw)) {
      setToast({ type: "error", message: "Password must be at least 8 chars and include a number." });
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
      setToast({ type: "success", message: "Signup successful. Please login." });
      setTimeout(() => navigate("/login"), 700);
    } catch (err) {
      const data = err?.response?.data;
      const msg =
        (typeof data?.error === "string" && data.error) ||
        (data?.error && JSON.stringify(data.error)) ||
        "Signup failed";
      setToast({ type: "error", message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <h1 className="text-2xl font-semibold text-slate-900">Create account</h1>
      <p className="text-slate-600 mt-1">Signup to get started.</p>

      <form onSubmit={submit} className="mt-6 bg-white p-6 rounded-xl shadow-sm border">
        <label className="block text-sm font-medium text-slate-700">Full name</label>
        <input
          className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Your name"
        />

        <label className="block text-sm font-medium text-slate-700 mt-4">Email</label>
        <input
          className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="you@example.com"
        />

        <label className="block text-sm font-medium text-slate-700 mt-4">Password</label>
        <input
          className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          type="password"
          placeholder="At least 8 chars"
        />

        <label className="block text-sm font-medium text-slate-700 mt-4">Confirm password</label>
        <input
          className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
          value={cpw}
          onChange={(e) => setCpw(e.target.value)}
          type="password"
          placeholder="Repeat password"
        />

        <button
          disabled={loading}
          className="mt-5 w-full bg-slate-900 text-white rounded-lg py-2 hover:bg-slate-800 disabled:opacity-60"
        >
          {loading ? "Creating..." : "Signup"}
        </button>

        <div className="text-sm text-slate-600 mt-4">
          Already have an account?{" "}
          <Link className="text-slate-900 font-medium hover:underline" to="/login">
            Login
          </Link>
        </div>
      </form>
    </div>
  );
}
