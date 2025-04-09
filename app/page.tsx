'use client';

import { useState } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ScheduleForm from './components/ScheduleForm';
import SchedulePDF from './components/SchedulePDF';

interface ScheduleEntry {
  day: number;
  people: string[];
}

export default function Home() {
  const [entries, setEntries] = useState<ScheduleEntry[]>([]);
  const [month, setMonth] = useState(new Date().toLocaleString('pt-BR', { month: 'long' }));
  const [year, setYear] = useState(new Date().getFullYear());

  const handleEntriesChange = (newEntries: ScheduleEntry[]) => {
    setEntries(newEntries);
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          Sistema de Escala de Porteiros
        </h1>

        <div className="mb-8 flex justify-center gap-4">
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border p-2 rounded"
          >
            {Array.from({ length: 12 }, (_, i) => {
              const date = new Date(2000, i, 1);
              return (
                <option key={i} value={date.toLocaleString('pt-BR', { month: 'long' })}>
                  {date.toLocaleString('pt-BR', { month: 'long' })}
                </option>
              );
            })}
          </select>

          <input
            type="number"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="border p-2 rounded w-24"
          />
        </div>

        <ScheduleForm onEntriesChange={handleEntriesChange} />

        {entries.length > 0 && (
          <div className="mt-8 text-center">
            <PDFDownloadLink
              document={<SchedulePDF entries={entries} month={month} year={year} />}
              fileName={`escala-porteiros-${month}-${year}.pdf`}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              {({ loading }) =>
                loading ? 'Gerando PDF...' : 'Baixar PDF'
              }
            </PDFDownloadLink>
          </div>
        )}
      </div>
    </main>
  );
}
