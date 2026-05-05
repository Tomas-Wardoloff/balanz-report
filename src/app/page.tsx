"use client";

import { useState } from "react";
import { UploadView } from "../components/UploadView";
import { Dashboard } from "../components/Dashboard";
import { parseExcelFile } from "../utils/parser";
import { calculatePositions } from "../utils/calculator";
import { Position } from "../types";

export default function Home() {
  const [arsToUsdRate, setArsToUsdRate] = useState<number>(0);
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDashboard, setIsDashboard] = useState(false);

  const handleFileSelect = async (file: File) => {
    try {
      setIsLoading(true);
      const orders = await parseExcelFile(file);
      const calculatedPositions = calculatePositions(orders, arsToUsdRate);
      setPositions(calculatedPositions);
      setIsDashboard(true);
    } catch (error) {
      console.error("Error al procesar el archivo:", error);
      alert("Hubo un error al procesar el archivo. Asegúrate de que sea el Excel de Balanz.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setIsDashboard(false);
    setPositions([]);
  };

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      {!isDashboard ? (
        <UploadView 
          onFileSelect={handleFileSelect} 
          arsToUsdRate={arsToUsdRate} 
          setArsToUsdRate={setArsToUsdRate}
          isLoading={isLoading}
        />
      ) : (
        <Dashboard 
          positions={positions} 
          arsToUsdRate={arsToUsdRate} 
          onReset={handleReset}
        />
      )}
    </main>
  );
}
