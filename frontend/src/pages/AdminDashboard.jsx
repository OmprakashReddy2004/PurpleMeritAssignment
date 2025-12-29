import { useEffect, useState } from "react";
import api from "../api/client";
import { useAuth } from "../auth/AuthContext";
import Toast from "../components/Toast";

export default function AdminDashboard() {
  const { user } = useAuth();

  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [data, setData] = useState(null); // paginated response

  const fetchUsers = async (p = page) => {
    try {
      setLoading(true);
      const res = await api.get(`/api/admin/users?page=${p}`);
      setData(res.data);
    } catch (err) {
      setToast({ type: "error", message: "Failed to load users" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const confirmAction = (msg) => window.confirm(msg);

  const activate = async (id) => {
    if (!confirmAction("Activate this user?")) return;
    try {
      await api.patch(`/api/admin/users/${id}/activate/`);
      setToast({ type: "success", message: "User activated" });
      fetchUsers(page);
    } catch {
      setToast({ type: "error", message: "Activation failed" });
    }
  };

  const deactivate = async (id) => {
    if (!confirmAction("Deactivate this user?")) return;
    try {
      await api.patch(`/api/admin/users/${id}/deactivate/`);
      setToast({ type: "success", message: "User deactivated" });
      fetchUsers(page);
    } catch {
      setToast({ type: "error", message: "Deactivation failed" });
    }
  };

  const results = data?.results || [];
  const total = data?.count || 0;
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-600 mt-1">Manage users (activate/deactivate).</p>
        </div>
        <div className="text-sm text-slate-600">
          Total: <span className="font-medium text-slate-900">{total}</span>
        </div>
      </div>

      <div className="mt-5 bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Full name</th>
                <th className="text-left px-4 py-3">Role</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td className="px-4 py-6 text-slate-600" colSpan={5}>
                    Loading...
                  </td>
                </tr>
              ) : results.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-slate-600" colSpan={5}>
                    No users found.
                  </td>
                </tr>
              ) : (
                results.map((u) => {
                  const isSelf = user?.id === u.id;

                  return (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">{u.email}</td>
                      <td className="px-4 py-3">{u.full_name}</td>
                      <td className="px-4 py-3 capitalize">{u.role}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            u.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          }`}
                        >
                          {u.is_active ? "active" : "inactive"}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => activate(u.id)}
                            disabled={isSelf || u.is_active}
                            className="px-3 py-1.5 rounded-md bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50"
                            title={
                              isSelf
                                ? "You cannot change your own status"
                                : u.is_active
                                ? "User is already active"
                                : "Activate user"
                            }
                          >
                            Activate
                          </button>

                          <button
                            onClick={() => deactivate(u.id)}
                            disabled={isSelf || !u.is_active}
                            className="px-3 py-1.5 rounded-md bg-red-600 text-white hover:bg-red-500 disabled:opacity-50"
                            title={
                              isSelf
                                ? "You cannot change your own status"
                                : !u.is_active
                                ? "User is already inactive"
                                : "Deactivate user"
                            }
                          >
                            Deactivate
                          </button>
                        </div>

                        {isSelf && (
                          <div className="mt-1 text-xs text-slate-500">
                            You can’t activate/deactivate yourself.
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t bg-white">
          <button
            className="px-3 py-1.5 rounded-md border hover:bg-slate-50 disabled:opacity-50"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </button>

          <div className="text-sm text-slate-600">
            Page <span className="font-medium text-slate-900">{page}</span> of{" "}
            <span className="font-medium text-slate-900">{totalPages}</span>
          </div>

          <button
            className="px-3 py-1.5 rounded-md border hover:bg-slate-50 disabled:opacity-50"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
