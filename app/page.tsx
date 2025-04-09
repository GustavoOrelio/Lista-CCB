'use client';

import { useState } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import PeopleManager from './components/PeopleManager';
import SchedulePDF from './components/SchedulePDF';
import { generateSchedule } from './utils/scheduleGenerator';

interface Porteiro {
  name: string;
  canWorkTuesday: boolean;
  canWorkSaturday: boolean;
  serviceCount: number;
}

interface ScheduleMonth {
  month: number;
  year: number;
  entries: { day: number; people: string[] }[];
}

export default function Home() {
  const [people, setPeople] = useState<Porteiro[]>([]);
  const [startMonth, setStartMonth] = useState(new Date().getMonth());
  const [startYear, setStartYear] = useState(new Date().getFullYear());
  const [monthsToGenerate, setMonthsToGenerate] = useState(1);
  const [schedules, setSchedules] = useState<ScheduleMonth[]>([]);

  const handlePeopleChange = (newPeople: Porteiro[]) => {
    setPeople(newPeople);
  };

  const getMonthName = (monthIndex: number) => {
    return new Date(2000, monthIndex, 1).toLocaleString('pt-BR', { month: 'long' });
  };

  const generateAllSchedules = () => {
    const newSchedules: ScheduleMonth[] = [];

    for (let i = 0; i < monthsToGenerate; i++) {
      const currentMonth = (startMonth + i) % 12;
      const currentYear = startYear + Math.floor((startMonth + i) / 12);

      const entries = generateSchedule(people, currentMonth, currentYear);

      newSchedules.push({
        month: currentMonth,
        year: currentYear,
        entries
      });
    }

    setSchedules(newSchedules);
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          Sistema de Escala de Porteiros
        </h1>

        <div className="mb-8 flex flex-col items-center gap-4">
          <div className="flex gap-4">
            <select
              value={startMonth}
              onChange={(e) => setStartMonth(parseInt(e.target.value))}
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
              value={startYear}
              onChange={(e) => setStartYear(parseInt(e.target.value))}
              className="border p-2 rounded w-24"
            />
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="monthsToGenerate">Número de meses:</label>
            <input
              type="number"
              id="monthsToGenerate"
              min="1"
              max="12"
              value={monthsToGenerate}
              onChange={(e) => setMonthsToGenerate(parseInt(e.target.value))}
              className="border p-2 rounded w-20"
            />
          </div>

          <button
            onClick={generateAllSchedules}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Gerar Escalas
          </button>
        </div>

        <PeopleManager onPeopleChange={handlePeopleChange} />

        {schedules.length > 0 && (
          <div className="mt-8 space-y-4">
            {schedules.map((schedule, index) => (
              <div key={index} className="text-center">
                <h3 className="text-xl font-semibold mb-2">
                  {getMonthName(schedule.month)}/{schedule.year}
                </h3>
                <PDFDownloadLink
                  document={
                    <SchedulePDF
                      entries={schedule.entries}
                      month={getMonthName(schedule.month)}
                      year={schedule.year}
                    />
                  }
                  fileName={`escala-porteiros-${getMonthName(schedule.month)}-${schedule.year}.pdf`}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  {({ loading }) =>
                    loading ? 'Gerando PDF...' : `Baixar PDF - ${getMonthName(schedule.month)}/${schedule.year}`
                  }
                </PDFDownloadLink>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
