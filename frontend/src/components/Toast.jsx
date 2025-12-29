export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const styles =
    toast.type === "success"
      ? "bg-green-600"
      : toast.type === "error"
      ? "bg-red-600"
      : "bg-slate-800";

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`${styles} text-white px-4 py-3 rounded-lg shadow-lg flex gap-3 items-start`}>
        <div className="text-sm">{toast.message}</div>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white text-sm font-semibold"
          aria-label="Close toast"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
