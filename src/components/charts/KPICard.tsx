export interface KPICardProps {
  title: string;
  value: string;
  icon?: React.ReactNode;
  className?: string;
}

export function KPICard({
  title,
  value,
  icon,
  className,
}: KPICardProps) {
  return (
    <div className={`bg-white px-6 py-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 ${className}`}>
      {icon && <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">{icon}</div>}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{title}</p>
        <p className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">{value}</p>
      </div>
    </div>
  );
}