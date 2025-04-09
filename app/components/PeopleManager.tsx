'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';

interface PeopleManagerProps {
  onPeopleChange: (people: string[]) => void;
}

export default function PeopleManager({ onPeopleChange }: PeopleManagerProps) {
  const [people, setPeople] = useState<string[]>([]);
  const [newPerson, setNewPerson] = useState('');

  useEffect(() => {
    onPeopleChange(people);
  }, [people, onPeopleChange]);

  const addPerson = () => {
    if (newPerson.trim()) {
      setPeople([...people, newPerson.trim()]);
      setNewPerson('');
    }
  };

  const removePerson = (index: number) => {
    setPeople(people.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Gerenciar Porteiros</h2>
      <div className="flex gap-4 mb-4">
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

      <div className="space-y-2">
        {people.map((person, index) => (
          <div key={index} className="flex items-center gap-4 p-2 border rounded">
            <span>{person}</span>
            <button
              onClick={() => removePerson(index)}
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