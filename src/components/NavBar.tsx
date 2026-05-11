import { ChevronLeft } from 'lucide-react';

export function NavBar({ arsToUsdRate, onReset }: { arsToUsdRate: number; onReset: () => void }) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {arsToUsdRate ? (
            <span className="ml-1.5 inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs font-mono font-medium">
              1 USD = ${arsToUsdRate.toLocaleString('es-AR')}
            </span>
          ) : (
            <span className="ml-1.5 text-slate-400">· sólo activos en USD</span>
          )}
        </p>
      </div>
      <button
        onClick={onReset}
        className="cursor-pointer flex items-center gap-2 px-4 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors font-medium text-sm"
      >
        <ChevronLeft size={15} />
        Subir otro archivo
      </button>
    </div>
  );
}
