"use client";

import React, { useCallback, useState, useEffect } from "react";
import { Upload, Loader2, AlertCircle } from "lucide-react";

interface UploadViewProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
  error?: string | null;
  onErrorClear?: () => void;
}

export function UploadView({ onFileSelect, isLoading, error, onErrorClear }: UploadViewProps) {
  const [dragActive, setDragActive] = useState(false);
  const [countdown, setCountdown] = useState(4);

  useEffect(() => {
    if (error) {
      setCountdown(5);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            if (onErrorClear) onErrorClear();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [error, onErrorClear]);

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
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard de Inversiones</h1>
          <p className="text-sm text-slate-500 mt-2">
            Tus inversiones de una manera simple
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 flex flex-col gap-7">
          {error ? (
            <div className="flex flex-col items-center justify-center w-full py-10 px-6 border-2 border-red-200 bg-slate-50 rounded-xl text-center">
              <div className="p-3 text-red-600 rounded-xl mb-4">
                <AlertCircle size={32} />
              </div>
              <p className="text-sm font-semibold text-red-700 mb-2">
                {error}
              </p>
              <p className="text-xs text-red-500 font-medium">
                Serás redirigido en {countdown} segundos...
              </p>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center w-full py-12 px-6 border-2 border-slate-100 bg-slate-50 rounded-xl text-center">
              <Loader2 size={40} className="animate-spin text-emerald-500 mb-4" />
              <p className="text-sm font-semibold text-slate-700">
                Calculando cotizaciones y armando tu portfolio...
              </p>
            </div>
          ) : (
            <div
              className={`relative flex flex-col items-center justify-center w-full py-10 px-6 border-2 border-dashed rounded-xl transition-all duration-200 ${dragActive
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
              />

              <div className="flex flex-col items-center gap-3 text-center">
                <div className={`p-3 rounded-xl transition-colors ${dragActive ? 'text-emerald-600' : 'text-slate-500'}`}>
                  <Upload size={24} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    Arrastrá o hacé clic para subir
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Archivo .xlsx · Historial de operaciones · Dólar MEP automático</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
