import { Eye, EyeOff } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);

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

      const role = res.data.user?.role;
      navigate(role === "admin" ? "/admin" : "/profile");
    } catch (err) {
      const msg =
        err?.response?.data?.error?.non_field_errors?.[0] ||
        err?.response?.data?.error ||
        "Login failed";
      setToast({
        type: "error",
        message: typeof msg === "string" ? msg : "Login failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
     
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 px-4">
        {/* APP TITLE */}
      <h1 className="mb-8 text-3xl font-bold text-white text-center">
        Mini User Management System
      </h1>
      <Toast toast={toast} onClose={() => setToast(null)} />

      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-xl border border-slate-800 bg-slate-900 p-8 shadow-lg
                   hover:shadow-2xl transition-all duration-300"
      >
        <h1 className="text-2xl font-semibold text-white">Sign in</h1>
        <p className="text-sm text-slate-400 mt-1">Welcome back. Please login.</p>

        {/* Email */}
        <div className="mt-6">
          <label className="text-sm text-slate-300">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="mt-2 w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2.5 text-slate-100 placeholder-slate-500
                       focus:outline-none focus:ring-2 focus:ring-slate-600
                       hover:border-slate-500 hover:ring-slate-500 transition-all duration-200"
          />
        </div>

        {/* Password */}
        <div className="mt-5">
          <label className="text-sm text-slate-300">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-2 w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2.5 pr-10 text-slate-100 placeholder-slate-500
                         focus:outline-none focus:ring-2 focus:ring-slate-600
                         hover:border-slate-500 hover:ring-slate-500 transition-all duration-200"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400
                         hover:text-white hover:scale-110 transition-all duration-200"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Button */}
        <button
          disabled={loading}
          className="mt-7 w-full rounded-lg bg-slate-800 py-2.5 text-white font-medium
                     hover:bg-slate-700 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200
                     disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-slate-400">
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className="text-white hover:text-slate-200 hover:underline transition-all duration-200"
          >
            Create one
          </Link>
        </p>
      </form>
    </div>
  );
}
