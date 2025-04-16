'use client';

import { useState, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Voluntario } from '../types/voluntario';
import { Igreja } from '../types/igreja';
import { voluntarioService } from '../services/voluntarioService';
import { igrejaService } from '../services/igrejaService';

const diasSemana = [
  { key: 'domingo', label: 'Domingo', cultoProp: 'cultoDomingo' },
  { key: 'segunda', label: 'Segunda-feira', cultoProp: 'cultoSegunda' },
  { key: 'terca', label: 'Terça-feira', cultoProp: 'cultoTerca' },
  { key: 'quarta', label: 'Quarta-feira', cultoProp: 'cultoQuarta' },
  { key: 'quinta', label: 'Quinta-feira', cultoProp: 'cultoQuinta' },
  { key: 'sexta', label: 'Sexta-feira', cultoProp: 'cultoSexta' },
  { key: 'sabado', label: 'Sábado', cultoProp: 'cultoSabado' },
] as const;

export default function Voluntarios() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [voluntarios, setVoluntarios] = useState<Voluntario[]>([]);
  const [igrejas, setIgrejas] = useState<Igreja[]>([]);
  const [novoVoluntario, setNovoVoluntario] = useState<Omit<Voluntario, 'id'>>({
    nome: '',
    igrejaId: '',
    igrejaNome: '',
    disponibilidades: {
      domingo: false,
      segunda: false,
      terca: false,
      quarta: false,
      quinta: false,
      sexta: false,
      sabado: false,
    },
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const [dadosVoluntarios, dadosIgrejas] = await Promise.all([
        voluntarioService.listar(),
        igrejaService.listar()
      ]);
      setVoluntarios(dadosVoluntarios);
      setIgrejas(dadosIgrejas);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados. Por favor, tente novamente.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const id = await voluntarioService.adicionar(novoVoluntario);
      setVoluntarios(prev => [...prev, { id, ...novoVoluntario }]);
      setNovoVoluntario({
        nome: '',
        igrejaId: '',
        igrejaNome: '',
        disponibilidades: {
          domingo: false,
          segunda: false,
          terca: false,
          quarta: false,
          quinta: false,
          sexta: false,
          sabado: false,
        },
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error('Erro ao salvar voluntário:', error);
      alert('Erro ao salvar voluntário. Por favor, tente novamente.');
    }
  };

  const handleIgrejaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const igreja = igrejas.find(i => i.id === e.target.value);
    if (igreja) {
      setNovoVoluntario(prev => ({
        ...prev,
        igrejaId: igreja.id,
        igrejaNome: igreja.nome,
        disponibilidades: {
          domingo: false,
          segunda: false,
          terca: false,
          quarta: false,
          quinta: false,
          sexta: false,
          sabado: false,
        },
      }));
    }
  };

  const formatarDisponibilidades = (disponibilidades: Voluntario['disponibilidades']) => {
    if (!disponibilidades) return '';

    return diasSemana
      .filter(dia => disponibilidades[dia.key])
      .map(dia => dia.label)
      .join(', ');
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-gray-100">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-medium text-gray-900">Voluntários</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-white text-gray-700 px-4 py-2 rounded-md flex items-center hover:bg-gray-50 transition-colors border border-gray-200"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Adicionar Voluntário
        </button>
      </div>

      {/* Lista de Voluntários */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                Nome
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                Igreja
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                Disponibilidade
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {voluntarios.map((voluntario) => (
              <tr key={voluntario.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {voluntario.nome}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {voluntario.igrejaNome}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {formatarDisponibilidades(voluntario.disponibilidades)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Cadastro */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black opacity-40"></div>
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-md z-50">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-medium text-gray-900">Adicionar Novo Voluntário</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500 transition-colors"
                >
                  <span className="sr-only">Fechar</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={novoVoluntario.nome}
                    onChange={(e) => setNovoVoluntario(prev => ({ ...prev, nome: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Igreja
                  </label>
                  <select
                    value={novoVoluntario.igrejaId}
                    onChange={handleIgrejaChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                    required
                  >
                    <option value="">Selecione uma igreja</option>
                    {igrejas.map(igreja => (
                      <option key={igreja.id} value={igreja.id}>
                        {igreja.nome}
                      </option>
                    ))}
                  </select>
                </div>

                {novoVoluntario.igrejaId && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Disponibilidade
                    </label>
                    {diasSemana.map(dia => {
                      const igreja = igrejas.find(i => i.id === novoVoluntario.igrejaId);
                      if (!igreja || !igreja[dia.cultoProp]) return null;

                      return (
                        <label key={dia.key} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={novoVoluntario?.disponibilidades?.[dia.key] ?? false}
                            onChange={(e) => setNovoVoluntario(prev => ({
                              ...prev,
                              disponibilidades: {
                                ...prev.disponibilidades,
                                [dia.key]: e.target.checked
                              } as Voluntario['disponibilidades']
                            }))}
                            className="h-4 w-4 text-gray-600 focus:ring-gray-400 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">Disponível para {dia.label}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 transition-colors"
                  >
                    Salvar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 