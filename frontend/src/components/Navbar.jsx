import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const onLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="border-b bg-white">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/profile" className="font-semibold text-slate-900">
            User Manager
          </Link>
          <Link to="/profile" className="text-sm text-slate-600 hover:text-slate-900">
            Profile
          </Link>
          {user.role === "admin" && (
            <Link to="/admin" className="text-sm text-slate-600 hover:text-slate-900">
              Admin
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm text-slate-700">
            <span className="font-medium">{user.full_name}</span>{" "}
            <span className="text-slate-500">({user.role})</span>
          </div>
          <button
            onClick={onLogout}
            className="text-sm px-3 py-1.5 rounded-md bg-slate-900 text-white hover:bg-slate-800"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
