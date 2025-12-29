export default function Modal({ open, title, children, onClose, footer }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-slate-200">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          </div>
          <div className="p-5">{children}</div>
          {footer && <div className="p-5 pt-0">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
