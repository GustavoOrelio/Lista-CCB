'use client';

import { useState, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Igreja } from '../types/igreja';
import { igrejaService } from '../services/igrejaService';

export default function Igrejas() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [igrejas, setIgrejas] = useState<Igreja[]>([]);
  const [novaIgreja, setNovaIgreja] = useState<Omit<Igreja, 'id'>>({
    nome: '',
    cultoDomingo: false,
    cultoSegunda: false,
    cultoTerca: false,
    cultoQuarta: false,
    cultoQuinta: false,
    cultoSexta: false,
    cultoSabado: false,
  });

  useEffect(() => {
    carregarIgrejas();
  }, []);

  const carregarIgrejas = async () => {
    try {
      const dados = await igrejaService.listar();
      setIgrejas(dados);
    } catch (error) {
      console.error('Erro ao carregar igrejas:', error);
      alert('Erro ao carregar igrejas. Por favor, tente novamente.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const id = await igrejaService.adicionar(novaIgreja);
      setIgrejas(prev => [...prev, { id, ...novaIgreja }]);
      setNovaIgreja({
        nome: '',
        cultoDomingo: false,
        cultoSegunda: false,
        cultoTerca: false,
        cultoQuarta: false,
        cultoQuinta: false,
        cultoSexta: false,
        cultoSabado: false,
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error('Erro ao salvar igreja:', error);
      alert('Erro ao salvar igreja. Por favor, tente novamente.');
    }
  };

  const diasCulto = [
    { key: 'cultoDomingo', label: 'Domingo' },
    { key: 'cultoSegunda', label: 'Segunda-feira' },
    { key: 'cultoTerca', label: 'Terça-feira' },
    { key: 'cultoQuarta', label: 'Quarta-feira' },
    { key: 'cultoQuinta', label: 'Quinta-feira' },
    { key: 'cultoSexta', label: 'Sexta-feira' },
    { key: 'cultoSabado', label: 'Sábado' },
  ] as const;

  return (
    <div className="p-6 max-w-6xl mx-auto bg-gray-100">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-medium text-gray-900">Igrejas</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-white text-gray-700 px-4 py-2 rounded-md flex items-center hover:bg-gray-50 transition-colors border border-gray-200"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Adicionar Igreja
        </button>
      </div>

      {/* Lista de Igrejas */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                Nome
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                Dias de Culto
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {igrejas.map((igreja) => (
              <tr key={igreja.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {igreja.nome}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {diasCulto
                    .filter(dia => igreja[dia.key])
                    .map(dia => dia.label)
                    .join(', ')}
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
                <h2 className="text-xl font-medium text-gray-900">Adicionar Nova Igreja</h2>
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
                    Nome da Igreja
                  </label>
                  <input
                    type="text"
                    value={novaIgreja.nome}
                    onChange={(e) => setNovaIgreja(prev => ({ ...prev, nome: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dias de Culto
                  </label>
                  {diasCulto.map(dia => (
                    <label key={dia.key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={novaIgreja[dia.key]}
                        onChange={(e) => setNovaIgreja(prev => ({ ...prev, [dia.key]: e.target.checked }))}
                        className="h-4 w-4 text-gray-600 focus:ring-gray-400 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{dia.label}</span>
                    </label>
                  ))}
                </div>
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