'use client';

import { useState } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import PeopleManager from './components/PeopleManager';
import SchedulePDF from './components/SchedulePDF';
import { generateSchedule } from './utils/scheduleGenerator';

export default function Home() {
  const [people, setPeople] = useState<string[]>([]);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());

  const handlePeopleChange = (newPeople: string[]) => {
    setPeople(newPeople);
  };

  const getMonthName = (monthIndex: number) => {
    return new Date(2000, monthIndex, 1).toLocaleString('pt-BR', { month: 'long' });
  };

  const entries = generateSchedule(people, month, year);

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          Sistema de Escala de Porteiros
        </h1>

        <div className="mb-8 flex justify-center gap-4">
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            className="border p-2 rounded"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i}>
                {getMonthName(i)}
              </option>
            ))}
          </select>

          <input
            type="number"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="border p-2 rounded w-24"
          />
        </div>

        <PeopleManager onPeopleChange={handlePeopleChange} />

        {entries.length > 0 && (
          <div className="mt-8 text-center">
            <PDFDownloadLink
              document={
                <SchedulePDF
                  entries={entries}
                  month={getMonthName(month)}
                  year={year}
                />
              }
              fileName={`escala-porteiros-${getMonthName(month)}-${year}.pdf`}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              {({ loading }) =>
                loading ? 'Gerando PDF...' : 'Baixar PDF da Escala'
              }
            </PDFDownloadLink>
          </div>
        )}
      </div>
    </main>
  );
}
