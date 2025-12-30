import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../auth/AuthContext";
import Toast from "../components/Toast";

export default function AdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [confirm, setConfirm] = useState(null); // { id, action, email }

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(count / 10)),
    [count]
  );

  /* =========================
     FETCH USERS
  ========================== */
  const fetchUsers = async (p = 1) => {
    try {
      setLoading(true);
      const res = await api.get(`/api/admin/users/?page=${p}`);
      setUsers(res.data.results || []);
      setCount(res.data.count || 0);
    } catch {
      setToast({ type: "error", message: "Failed to fetch users" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  /* =========================
     ACTIVATE / DEACTIVATE
  ========================== */
  const doAction = async () => {
    if (!confirm) return;

    const { id, action } = confirm;

    try {
      if (action === "activate") {
        await api.patch(`/api/admin/users/${id}/activate/`);
      } else {
        await api.patch(`/api/admin/users/${id}/deactivate/`);
      }

      setToast({ type: "success", message: `User ${action}d` });
      setConfirm(null);
      fetchUsers(page);
    } catch {
      setToast({ type: "error", message: "Action failed" });
    }
  };

  /* =========================
     LOGOUT
  ========================== */
  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  /* =========================
     PROFILE
  ========================== */
  const goToProfile = () => {
    navigate("/profile");
  };

  return (
    <div className="min-h-screen px-4 py-8 relative bg-[#0b0f1a] text-white">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-400 mt-1">
              Manage users (activate/deactivate).
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={goToProfile}
              className="px-4 py-2 rounded-lg
                         bg-slate-800 border border-slate-700
                         text-gray-200 hover:bg-slate-700 transition"
            >
              Profile
            </button>

            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg
                         bg-red-500/20 border border-red-500/40
                         text-red-300 hover:bg-red-500/30 transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 flex justify-between">
            <div className="font-semibold">Users</div>
            <button
              onClick={() => fetchUsers(page)}
              className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="p-10 text-center text-gray-400">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-800 text-gray-400">
                  <tr>
                    <th className="text-left px-5 py-3">Email</th>
                    <th className="text-left px-5 py-3">Full name</th>
                    <th className="text-left px-5 py-3">Role</th>
                    <th className="text-left px-5 py-3">Status</th>
                    <th className="text-right px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800 transition">
                      <td className="px-5 py-3">{u.email}</td>
                      <td className="px-5 py-3">{u.full_name || "-"}</td>
                      <td className="px-5 py-3">
                        <span className="px-2 py-1 rounded-lg text-xs border border-slate-700 bg-slate-800">
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`px-2 py-1 rounded-lg text-xs border ${
                            u.is_active
                              ? "border-emerald-400 bg-emerald-900 text-emerald-300"
                              : "border-rose-400 bg-rose-900 text-rose-300"
                          }`}
                        >
                          {u.is_active ? "active" : "inactive"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right space-x-2">
                        <button
                          className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm"
                          onClick={() =>
                            setConfirm({
                              id: u.id,
                              action: "activate",
                              email: u.email,
                            })
                          }
                        >
                          Activate
                        </button>
                        <button
                          className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm"
                          onClick={() =>
                            setConfirm({
                              id: u.id,
                              action: "deactivate",
                              email: u.email,
                            })
                          }
                        >
                          Deactivate
                        </button>
                      </td>
                    </tr>
                  ))}

                  {users.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-5 py-10 text-center text-gray-400"
                      >
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-slate-800 flex justify-between">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50"
            >
              Prev
            </button>

            <div className="text-gray-400 text-sm">
              Page <b>{page}</b> of <b>{totalPages}</b>
            </div>

            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        {/* Confirm Modal */}
        {confirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setConfirm(null)}
            />
            <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold">Confirm action</h3>
              <p className="text-gray-400 mt-2">
                Are you sure you want to <b>{confirm.action}</b> user{" "}
                <b>{confirm.email}</b>?
              </p>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  onClick={() => setConfirm(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={doAction}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 font-semibold"
                >
                  Yes, {confirm.action}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
