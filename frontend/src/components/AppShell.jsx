import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import Button from "./Button";

function NavItem({ to, label }) {
  const { pathname } = useLocation();
  const active = pathname === to;
  return (
    <Link
      to={to}
      className={`block rounded-xl px-3 py-2 text-sm font-medium transition ${
        active ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
      }`}
    >
      {label}
    </Link>
  );
}

export default function AppShell({ children }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Top bar */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Mini User Management</h1>
            <p className="text-sm text-slate-600">Role-based access • JWT • Admin controls</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-medium text-slate-900">{user?.full_name}</div>
              <div className="text-xs text-slate-600">{user?.role}</div>
            </div>
            <Button variant="secondary" onClick={logout}>Logout</Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-[240px_1fr]">
          {/* Sidebar */}
          <aside className="bg-white border border-slate-200 rounded-2xl shadow-sm p-3 h-fit">
            <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase">
              Navigation
            </div>
            {user?.role === "admin" ? (
              <div className="space-y-1">
                <NavItem to="/admin" label="Admin Dashboard" />
                <NavItem to="/profile" label="My Profile" />
              </div>
            ) : (
              <div className="space-y-1">
                <NavItem to="/profile" label="My Profile" />
              </div>
            )}
          </aside>

          {/* Content */}
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
