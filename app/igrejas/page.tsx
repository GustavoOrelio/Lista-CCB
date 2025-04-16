'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Igreja } from '../types/igreja';
import { igrejaService } from '../services/igrejaService';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteConfirmationDialog } from '../components/voluntarios/DeleteConfirmationDialog';

const diasCulto = [
  { key: 'cultoDomingo', label: 'Domingo' },
  { key: 'cultoSegunda', label: 'Segunda-feira' },
  { key: 'cultoTerca', label: 'Terça-feira' },
  { key: 'cultoQuarta', label: 'Quarta-feira' },
  { key: 'cultoQuinta', label: 'Quinta-feira' },
  { key: 'cultoSexta', label: 'Sexta-feira' },
  { key: 'cultoSabado', label: 'Sábado' },
] as const;

export default function Igrejas() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [igrejaParaExcluir, setIgrejaParaExcluir] = useState<string | null>(null);
  const [igrejas, setIgrejas] = useState<Igreja[]>([]);
  const [igrejaEmEdicao, setIgrejaEmEdicao] = useState<Igreja | null>(null);
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
      toast.error('Erro ao carregar igrejas. Por favor, tente novamente.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (igrejaEmEdicao) {
        await igrejaService.atualizar(igrejaEmEdicao.id, novaIgreja);
        setIgrejas(prev => prev.map(i =>
          i.id === igrejaEmEdicao.id ? { ...novaIgreja, id: igrejaEmEdicao.id } : i
        ));
        toast.success('Igreja atualizada com sucesso!');
      } else {
        const id = await igrejaService.adicionar(novaIgreja);
        setIgrejas(prev => [...prev, { id, ...novaIgreja }]);
        toast.success('Igreja adicionada com sucesso!');
      }
      handleCloseModal();
    } catch (error) {
      console.error('Erro ao salvar igreja:', error);
      toast.error('Erro ao salvar igreja. Por favor, tente novamente.');
    }
  };

  const handleCloseModal = () => {
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
    setIgrejaEmEdicao(null);
    setIsModalOpen(false);
  };

  const handleEdit = (igreja: Igreja) => {
    setIgrejaEmEdicao(igreja);
    setNovaIgreja({
      nome: igreja.nome,
      cultoDomingo: igreja.cultoDomingo,
      cultoSegunda: igreja.cultoSegunda,
      cultoTerca: igreja.cultoTerca,
      cultoQuarta: igreja.cultoQuarta,
      cultoQuinta: igreja.cultoQuinta,
      cultoSexta: igreja.cultoSexta,
      cultoSabado: igreja.cultoSabado,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    setIgrejaParaExcluir(id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!igrejaParaExcluir) return;

    try {
      await igrejaService.excluir(igrejaParaExcluir);
      setIgrejas(prev => prev.filter(i => i.id !== igrejaParaExcluir));
      setIsDeleteDialogOpen(false);
      setIgrejaParaExcluir(null);
      toast.success('Igreja excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir igreja:', error);
      toast.error('Erro ao excluir igreja. Por favor, tente novamente.');
    }
  };

  const formatarDiasCulto = (igreja: Igreja) => {
    return diasCulto
      .filter(dia => igreja[dia.key])
      .map(dia => dia.label)
      .join(', ');
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold">Igrejas</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Adicionar Igreja
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Dias de Culto</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {igrejas.map((igreja) => (
              <TableRow key={igreja.id}>
                <TableCell className="font-medium">{igreja.nome}</TableCell>
                <TableCell>{formatarDiasCulto(igreja)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(igreja)}
                    className="mr-2"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(igreja.id)}
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
            {igrejaEmEdicao ? 'Editar Igreja' : 'Adicionar Nova Igreja'}
          </DialogTitle>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da Igreja</Label>
              <Input
                id="nome"
                value={novaIgreja.nome}
                onChange={(e) => setNovaIgreja(prev => ({ ...prev, nome: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Dias de Culto</Label>
              <div className="space-y-2">
                {diasCulto.map(dia => (
                  <div key={dia.key} className="flex items-center space-x-2">
                    <Checkbox
                      id={`culto-${dia.key}`}
                      checked={novaIgreja[dia.key]}
                      onCheckedChange={(checked) =>
                        setNovaIgreja(prev => ({ ...prev, [dia.key]: checked as boolean }))
                      }
                    />
                    <Label htmlFor={`culto-${dia.key}`}>{dia.label}</Label>
                  </div>
                ))}
              </div>
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
                {igrejaEmEdicao ? "Salvar Alterações" : "Salvar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Excluir Igreja"
        description="Tem certeza que deseja excluir esta igreja? Esta ação não pode ser desfeita."
      />
    </div>
  );
} 