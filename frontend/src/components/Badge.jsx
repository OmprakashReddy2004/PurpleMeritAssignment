export default function Badge({ tone = "slate", children }) {
  const tones = {
    green: "bg-emerald-50 text-emerald-700 border-emerald-100",
    red: "bg-rose-50 text-rose-700 border-rose-100",
    blue: "bg-sky-50 text-sky-700 border-sky-100",
    slate: "bg-slate-50 text-slate-700 border-slate-100",
    amber: "bg-amber-50 text-amber-800 border-amber-100",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
