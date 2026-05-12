'use client';

import { useState, useEffect } from 'react';
import { AnimatedCurrency } from './AnimatedCurrency';
import { Position } from '@/types';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { usePrivacy } from '@/context/PrivacyContext';

interface PositionsTableProps {
  positions: Position[];
  arsToUsdRate: number;
  currency: 'USD' | 'ARS';
}

function SortableRow({
  pos,
  currency,
  arsToUsdRate,
  isLast,
}: {
  pos: Position;
  currency: 'USD' | 'ARS';
  arsToUsdRate: number;
  isLast: boolean;
}) {
  const { isPrivate } = usePrivacy();
  const targetMultiplier = currency === 'USD' ? 1 : arsToUsdRate;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: pos.ticker,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    position: isDragging ? ('relative' as const) : undefined,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`hover:bg-slate-50/70 transition-colors ${!isLast ? 'border-b border-slate-100' : ''} ${isDragging ? 'bg-white shadow-lg' : ''}`}
    >
      <td className="px-3 py-4 w-10">
        <button
          {...attributes}
          {...listeners}
          className="text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing p-1"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
        </button>
      </td>
      <td className="px-6 py-4 text-center font-semibold text-sm text-slate-800 tracking-tight">
        {pos.ticker}
      </td>
      <td className="px-6 py-4 text-center font-mono text-sm text-slate-600">
        {isPrivate ? '***' : pos.quantity.toLocaleString('es-AR')}
      </td>
      <td className="px-6 py-4 text-center font-mono text-sm text-slate-600">
        {pos.currentPriceUSD ? (
          <AnimatedCurrency value={pos.currentPriceUSD * targetMultiplier} currency={currency} />
        ) : (
          '-'
        )}
      </td>
      <td className="px-6 py-4 text-center font-mono text-sm font-semibold text-slate-800">
        <AnimatedCurrency value={pos.investedValueUSD * targetMultiplier} currency={currency} />
      </td>
      <td className="px-6 py-4 text-center font-mono text-sm font-semibold text-slate-800">
        {pos.currentValueUSD !== undefined ? (
          <AnimatedCurrency value={pos.currentValueUSD * targetMultiplier} currency={currency} />
        ) : (
          '-'
        )}
      </td>
      <td
        className={`px-6 py-4 text-center font-mono text-sm font-semibold ${pos.pnlAbsolute !== undefined ? (pos.pnlAbsolute >= 0 ? 'text-emerald-600' : 'text-red-600') : 'text-slate-600'}`}
      >
        {pos.pnlAbsolute !== undefined ? (
          <AnimatedCurrency
            value={pos.pnlAbsolute * targetMultiplier}
            currency={currency}
            showSign
          />
        ) : (
          '-'
        )}
      </td>
      <td className="px-6 py-4 text-center">
        {pos.pnlPercentage !== undefined ? (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${pos.pnlPercentage >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}
          >
            {pos.pnlPercentage > 0 ? '+' : ''}
            {pos.pnlPercentage.toFixed(2)}%
          </span>
        ) : (
          '-'
        )}
      </td>
    </tr>
  );
}

export function PositionsTable({ positions, arsToUsdRate, currency }: PositionsTableProps) {
  const [localPositions, setLocalPositions] = useState<Position[]>([]);

  useEffect(() => {
    setLocalPositions(positions);
  }, [positions]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setLocalPositions((items) => {
        const oldIndex = items.findIndex((i) => i.ticker === active.id);
        const newIndex = items.findIndex((i) => i.ticker === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  if (localPositions.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-500">
            Resumen de Posiciones
          </h3>
        </div>
      </div>
      <div>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-xs uppercase tracking-widest">
                <th className="px-3 py-3 w-10 border-b border-slate-100"></th>
                <th className="px-6 py-3 font-semibold border-b border-slate-100 text-center">
                  Ticket
                </th>
                <th className="px-6 py-3 font-semibold border-b border-slate-100 text-center">
                  Cant. Nominales
                </th>
                <th className="px-6 py-3 font-semibold border-b border-slate-100 text-center">
                  Precio Actual
                </th>
                <th className="px-6 py-3 font-semibold border-b border-slate-100 text-center">
                  Costo Total
                </th>
                <th className="px-6 py-3 font-semibold border-b border-slate-100 text-center">
                  Valor Actual
                </th>
                <th className="px-6 py-3 font-semibold border-b border-slate-100 text-center">
                  P&L
                </th>
                <th className="px-6 py-3 font-semibold border-b border-slate-100 text-center">
                  Variación
                </th>
              </tr>
            </thead>
            <tbody>
              <SortableContext
                items={localPositions.map((p) => p.ticker)}
                strategy={verticalListSortingStrategy}
              >
                {localPositions.map((pos, idx) => (
                  <SortableRow
                    key={pos.ticker}
                    pos={pos}
                    currency={currency}
                    arsToUsdRate={arsToUsdRate}
                    isLast={idx === localPositions.length - 1}
                  />
                ))}
              </SortableContext>
            </tbody>
          </table>
        </DndContext>
      </div>
    </div>
  );
}
