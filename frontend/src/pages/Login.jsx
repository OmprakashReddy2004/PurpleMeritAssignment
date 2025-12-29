import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { setTokens } from "../auth/tokens";
import Toast from "../components/Toast";

export default function Login() {
  const navigate = useNavigate();
  const { loadMe } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setToast(null);

    if (!email.trim() || !password.trim()) {
      setToast({ type: "error", message: "Email and password are required." });
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/api/auth/login/", { email, password });
      setTokens(res.data.tokens);
      await loadMe();

      // route based on role
      const role = res.data.user?.role;
      navigate(role === "admin" ? "/admin" : "/profile");
    } catch (err) {
      const msg =
        err?.response?.data?.error?.non_field_errors?.[0] ||
        err?.response?.data?.error ||
        "Login failed";
      setToast({ type: "error", message: typeof msg === "string" ? msg : "Login failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <h1 className="text-2xl font-semibold text-slate-900">Login</h1>
      <p className="text-slate-600 mt-1">Sign in to continue.</p>

      <form onSubmit={submit} className="mt-6 bg-white p-6 rounded-xl shadow-sm border">
        <label className="block text-sm font-medium text-slate-700">Email</label>
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
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="••••••••"
        />

        <button
          disabled={loading}
          className="mt-5 w-full bg-slate-900 text-white rounded-lg py-2 hover:bg-slate-800 disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="text-sm text-slate-600 mt-4">
          No account?{" "}
          <Link className="text-slate-900 font-medium hover:underline" to="/signup">
            Create one
          </Link>
        </div>
      </form>
    </div>
  );
}
