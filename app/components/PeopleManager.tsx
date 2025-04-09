'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';

interface Porteiro {
  name: string;
  canWorkTuesday: boolean;
  canWorkSaturday: boolean;
}

interface PeopleManagerProps {
  onPeopleChange: (people: Porteiro[]) => void;
}

export default function PeopleManager({ onPeopleChange }: PeopleManagerProps) {
  const [people, setPeople] = useState<Porteiro[]>([]);
  const [newPerson, setNewPerson] = useState('');
  const [canWorkTuesday, setCanWorkTuesday] = useState(true);
  const [canWorkSaturday, setCanWorkSaturday] = useState(true);

  useEffect(() => {
    onPeopleChange(people);
  }, [people, onPeopleChange]);

  const addPerson = () => {
    if (newPerson.trim()) {
      setPeople([...people, {
        name: newPerson.trim(),
        canWorkTuesday,
        canWorkSaturday
      }]);
      setNewPerson('');
      setCanWorkTuesday(true);
      setCanWorkSaturday(true);
    }
  };

  const removePerson = (index: number) => {
    setPeople(people.filter((_, i) => i !== index));
  };

  const toggleAvailability = (index: number, day: 'tuesday' | 'saturday') => {
    const updatedPeople = [...people];
    updatedPeople[index] = {
      ...updatedPeople[index],
      [day === 'tuesday' ? 'canWorkTuesday' : 'canWorkSaturday']:
        !updatedPeople[index][day === 'tuesday' ? 'canWorkTuesday' : 'canWorkSaturday']
    };
    setPeople(updatedPeople);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Gerenciar Porteiros</h2>
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Nome do porteiro"
            value={newPerson}
            onChange={(e) => setNewPerson(e.target.value)}
            className="flex-1 border p-2 rounded"
          />
          <button
            onClick={addPerson}
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            <FaPlus />
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="canWorkTuesday"
              checked={canWorkTuesday}
              onChange={(e) => setCanWorkTuesday(e.target.checked)}
              className="h-4 w-4"
            />
            <label htmlFor="canWorkTuesday">Pode trabalhar às terças</label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="canWorkSaturday"
              checked={canWorkSaturday}
              onChange={(e) => setCanWorkSaturday(e.target.checked)}
              className="h-4 w-4"
            />
            <label htmlFor="canWorkSaturday">Pode trabalhar aos sábados</label>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {people.map((person, index) => (
          <div key={index} className="flex items-center gap-4 p-2 border rounded">
            <span className="flex-1">{person.name}</span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={person.canWorkTuesday}
                  onChange={() => toggleAvailability(index, 'tuesday')}
                  className="h-4 w-4"
                />
                <span className="text-sm">Terça</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={person.canWorkSaturday}
                  onChange={() => toggleAvailability(index, 'saturday')}
                  className="h-4 w-4"
                />
                <span className="text-sm">Sábado</span>
              </div>
            </div>
            <button
              onClick={() => removePerson(index)}
              className="text-red-500 hover:text-red-700"
            >
              <FaTrash />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 