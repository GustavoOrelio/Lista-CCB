'use client';

import { useState, useEffect } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { Porteiro, addPorteiro, getPorteiros, updatePorteiro, deletePorteiro } from '../services/porteiroService';

interface PeopleManagerProps {
  onPeopleChange: (people: Porteiro[]) => void;
}

export default function PeopleManager({ onPeopleChange }: PeopleManagerProps) {
  const [people, setPeople] = useState<Porteiro[]>([]);
  const [newPerson, setNewPerson] = useState('');
  const [canWorkTuesday, setCanWorkTuesday] = useState(true);
  const [canWorkSaturday, setCanWorkSaturday] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPorteiros();
  }, []);

  useEffect(() => {
    onPeopleChange(people);
  }, [people, onPeopleChange]);

  const loadPorteiros = async () => {
    try {
      const porteiros = await getPorteiros();
      setPeople(porteiros);
    } catch (error) {
      console.error('Erro ao carregar porteiros:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPerson = async () => {
    if (newPerson.trim()) {
      try {
        const newPorteiro: Omit<Porteiro, 'id'> = {
          name: newPerson.trim(),
          canWorkTuesday,
          canWorkSaturday,
          serviceCount: 0
        };

        await addPorteiro(newPorteiro);
        await loadPorteiros(); // Recarrega os dados do Firebase

        setNewPerson('');
        setCanWorkTuesday(true);
        setCanWorkSaturday(true);
      } catch (error) {
        console.error('Erro ao adicionar porteiro:', error);
      }
    }
  };

  const removePerson = async (id: string) => {
    try {
      await deletePorteiro(id);
      await loadPorteiros(); // Recarrega os dados do Firebase
    } catch (error) {
      console.error('Erro ao remover porteiro:', error);
    }
  };

  const toggleAvailability = async (porteiro: Porteiro, day: 'tuesday' | 'saturday') => {
    if (!porteiro.id) return;

    try {
      const field = day === 'tuesday' ? 'canWorkTuesday' : 'canWorkSaturday';
      await updatePorteiro(porteiro.id, {
        [field]: !porteiro[field]
      });
      await loadPorteiros(); // Recarrega os dados do Firebase
    } catch (error) {
      console.error('Erro ao atualizar disponibilidade:', error);
    }
  };

  if (loading) {
    return <div className="text-center">Carregando porteiros...</div>;
  }

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
        {people.map((person) => (
          <div key={person.id} className="flex items-center gap-4 p-2 border rounded">
            <span className="flex-1">{person.name}</span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={person.canWorkTuesday}
                  onChange={() => toggleAvailability(person, 'tuesday')}
                  className="h-4 w-4"
                />
                <span className="text-sm">Terça</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={person.canWorkSaturday}
                  onChange={() => toggleAvailability(person, 'saturday')}
                  className="h-4 w-4"
                />
                <span className="text-sm">Sábado</span>
              </div>
              <span className="text-sm text-gray-600">
                Serviços: {person.serviceCount}
              </span>
            </div>
            <button
              onClick={() => person.id && removePerson(person.id)}
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