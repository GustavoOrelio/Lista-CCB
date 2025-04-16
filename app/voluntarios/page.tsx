'use client';

import { useState, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Voluntario } from '../types/voluntario';
import { voluntarioService } from '../services/voluntarioService';

export default function Voluntarios() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [voluntarios, setVoluntarios] = useState<Voluntario[]>([]);
  const [novoVoluntario, setNovoVoluntario] = useState({
    nome: '',
    disponibilidadeTerca: false,
    disponibilidadeSabado: false,
  });

  useEffect(() => {
    carregarVoluntarios();
  }, []);

  const carregarVoluntarios = async () => {
    try {
      const dados = await voluntarioService.listar();
      setVoluntarios(dados);
    } catch (error) {
      console.error('Erro ao carregar voluntários:', error);
      alert('Erro ao carregar voluntários. Por favor, tente novamente.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const id = await voluntarioService.adicionar(novoVoluntario);

      setVoluntarios(prev => [...prev, { id, ...novoVoluntario }]);

      setNovoVoluntario({
        nome: '',
        disponibilidadeTerca: false,
        disponibilidadeSabado: false,
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error('Erro ao salvar voluntário:', error);
      alert('Erro ao salvar voluntário. Por favor, tente novamente.');
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Voluntários</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Adicionar Voluntário
        </button>
      </div>

      {/* Lista de Voluntários */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Disponível Terça
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Disponível Sábado
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {voluntarios.map((voluntario) => (
              <tr key={voluntario.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {voluntario.nome}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {voluntario.disponibilidadeTerca ? 'Sim' : 'Não'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {voluntario.disponibilidadeSabado ? 'Sim' : 'Não'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Cadastro */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Adicionar Novo Voluntário</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome
                </label>
                <input
                  type="text"
                  value={novoVoluntario.nome}
                  onChange={(e) => setNovoVoluntario(prev => ({ ...prev, nome: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={novoVoluntario.disponibilidadeTerca}
                    onChange={(e) => setNovoVoluntario(prev => ({ ...prev, disponibilidadeTerca: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Disponível para Terça-feira</span>
                </label>
              </div>
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={novoVoluntario.disponibilidadeSabado}
                    onChange={(e) => setNovoVoluntario(prev => ({ ...prev, disponibilidadeSabado: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Disponível para Sábado</span>
                </label>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 