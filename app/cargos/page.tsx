'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Cargo } from '../types/cargo';
import { cargoService } from '../services/cargoService';
import { Button } from '@/app/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Textarea } from '@/app/components/ui/textarea';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { DeleteConfirmationDialog } from '../components/voluntarios/DeleteConfirmationDialog';

export default function Cargos() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [cargoParaExcluir, setCargoParaExcluir] = useState<string | null>(null);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [cargoEmEdicao, setCargoEmEdicao] = useState<Cargo | null>(null);
  const [novoCargo, setNovoCargo] = useState<Omit<Cargo, 'id'>>({
    nome: '',
    descricao: '',
    ativo: true,
  });

  useEffect(() => {
    carregarCargos();
  }, []);

  const carregarCargos = async () => {
    try {
      const dados = await cargoService.listar();
      setCargos(dados);
    } catch (error) {
      console.error('Erro ao carregar cargos:', error);
      toast.error('Erro ao carregar cargos. Por favor, tente novamente.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (cargoEmEdicao) {
        await cargoService.atualizar(cargoEmEdicao.id, novoCargo);
        setCargos(prev => prev.map(c =>
          c.id === cargoEmEdicao.id ? { ...novoCargo, id: cargoEmEdicao.id } : c
        ));
        toast.success('Cargo atualizado com sucesso!');
      } else {
        const id = await cargoService.adicionar(novoCargo);
        setCargos(prev => [...prev, { id, ...novoCargo }]);
        toast.success('Cargo adicionado com sucesso!');
      }
      handleCloseModal();
    } catch (error) {
      console.error('Erro ao salvar cargo:', error);
      toast.error('Erro ao salvar cargo. Por favor, tente novamente.');
    }
  };

  const handleCloseModal = () => {
    setNovoCargo({
      nome: '',
      descricao: '',
      ativo: true,
    });
    setCargoEmEdicao(null);
    setIsModalOpen(false);
  };

  const handleEdit = (cargo: Cargo) => {
    setCargoEmEdicao(cargo);
    setNovoCargo({
      nome: cargo.nome,
      descricao: cargo.descricao,
      ativo: cargo.ativo,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    setCargoParaExcluir(id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!cargoParaExcluir) return;

    try {
      await cargoService.excluir(cargoParaExcluir);
      setCargos(prev => prev.filter(c => c.id !== cargoParaExcluir));
      setIsDeleteDialogOpen(false);
      setCargoParaExcluir(null);
      toast.success('Cargo excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir cargo:', error);
      toast.error('Erro ao excluir cargo. Por favor, tente novamente.');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold">Cargos</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Adicionar Cargo
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cargos.map((cargo) => (
              <TableRow key={cargo.id}>
                <TableCell className="font-medium">{cargo.nome}</TableCell>
                <TableCell>{cargo.descricao}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${cargo.ativo
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                    }`}>
                    {cargo.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(cargo)}
                    className="mr-2"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(cargo.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogTitle>
            {cargoEmEdicao ? 'Editar Cargo' : 'Adicionar Novo Cargo'}
          </DialogTitle>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Cargo</Label>
              <Input
                id="nome"
                value={novoCargo.nome}
                onChange={(e) => setNovoCargo(prev => ({ ...prev, nome: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={novoCargo.descricao}
                onChange={(e) => setNovoCargo(prev => ({ ...prev, descricao: e.target.value }))}
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="ativo"
                checked={novoCargo.ativo}
                onCheckedChange={(checked) =>
                  setNovoCargo(prev => ({ ...prev, ativo: checked as boolean }))
                }
              />
              <Label htmlFor="ativo">Cargo Ativo</Label>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseModal}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {cargoEmEdicao ? "Salvar Alterações" : "Salvar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Excluir Cargo"
        description="Tem certeza que deseja excluir este cargo? Esta ação não pode ser desfeita."
      />
    </div>
  );
} 