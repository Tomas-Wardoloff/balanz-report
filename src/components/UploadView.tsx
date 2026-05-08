"use client";

import React, { useCallback, useState } from "react";
import { Upload, Loader2 } from "lucide-react";

interface UploadViewProps {
  onFileSelect: (file: File) => void;
  arsToUsdRate: number;
  setArsToUsdRate: (rate: number) => void;
  isLoading: boolean;
}

export function UploadView({ onFileSelect, arsToUsdRate, setArsToUsdRate, isLoading }: UploadViewProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith(".xlsx")) {
        onFileSelect(file);
      } else {
        alert("Por favor sube un archivo .xlsx válido.");
      }
    }
  }, [onFileSelect]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) onFileSelect(e.target.files[0]);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-[#f5f7fa]">
      <div className="w-full max-w-md">
        {/* Wordmark */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Portfolio Report</h1>
          <p className="text-sm text-slate-500 mt-2">
            Subí tu historial de operaciones para visualizar tu cartera
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 flex flex-col gap-7">
          {/* Exchange Rate */}
          <div className="flex flex-col gap-2">
            <label htmlFor="exchangeRate" className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Tipo de Cambio (ARS / USD)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm pointer-events-none">$</span>
              <input
                id="exchangeRate"
                type="number"
                value={arsToUsdRate || ""}
                onChange={(e) => setArsToUsdRate(Number(e.target.value))}
                className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-800 outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-300 transition-all placeholder:text-slate-300"
                placeholder="1200"
              />
            </div>
            <p className="text-xs text-slate-400">
              Requerido para unificar posiciones en pesos a dólares.
            </p>
          </div>

          {/* Drop Zone */}
          <div
            className={`relative flex flex-col items-center justify-center w-full py-10 px-6 border-2 border-dashed rounded-xl transition-all duration-200 ${
              isLoading
                ? "border-slate-200 bg-slate-50 cursor-not-allowed"
                : dragActive
                ? "border-emerald-400 bg-emerald-50"
                : "border-slate-200 hover:border-slate-300 bg-slate-50 cursor-pointer"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".xlsx"
              onChange={handleChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isLoading}
            />

            <div className="flex flex-col items-center gap-3 text-center">
              <div className={`p-3 rounded-xl transition-colors ${
                isLoading ? 'bg-slate-100 text-slate-400' : dragActive ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'
              }`}>
                {isLoading ? <Loader2 size={24} className="animate-spin" /> : <Upload size={24} />}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">
                  {isLoading ? "Procesando archivo…" : "Arrastrá o hacé clic para subir"}
                </p>
                <p className="text-xs text-slate-400 mt-1">Archivo .xlsx · Historial de operaciones de Balanz</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
