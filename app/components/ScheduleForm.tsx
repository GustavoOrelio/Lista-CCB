'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';

interface ScheduleEntry {
  day: number;
  people: string[];
}

interface ScheduleFormProps {
  onEntriesChange: (entries: ScheduleEntry[]) => void;
}

export default function ScheduleForm({ onEntriesChange }: ScheduleFormProps) {
  const [entries, setEntries] = useState<ScheduleEntry[]>([]);
  const [newDay, setNewDay] = useState('');
  const [newPeople, setNewPeople] = useState('');

  useEffect(() => {
    onEntriesChange(entries);
  }, [entries, onEntriesChange]);

  const addEntry = () => {
    if (newDay && newPeople) {
      const day = parseInt(newDay);
      if (day >= 1 && day <= 31) {
        const people = newPeople.split(',').map(p => p.trim());
        setEntries([...entries, { day, people }]);
        setNewDay('');
        setNewPeople('');
      }
    }
  };

  const removeEntry = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Adicionar Escala</h2>
      <div className="flex gap-4 mb-4">
        <input
          type="number"
          placeholder="Dia do mês"
          min="1"
          max="31"
          value={newDay}
          onChange={(e) => setNewDay(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Nomes (separados por vírgula)"
          value={newPeople}
          onChange={(e) => setNewPeople(e.target.value)}
          className="flex-1 border p-2 rounded"
        />
        <button
          onClick={addEntry}
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          <FaPlus />
        </button>
      </div>

      <div className="space-y-2">
        {entries.map((entry, index) => (
          <div key={index} className="flex items-center gap-4 p-2 border rounded">
            <span className="font-bold">Dia {entry.day}:</span>
            <span>{entry.people.join(', ')}</span>
            <button
              onClick={() => removeEntry(index)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <FaTrash />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 