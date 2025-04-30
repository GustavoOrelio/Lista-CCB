'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { Igreja } from '../types/igreja';
import { igrejaService } from '../services/igrejaService';
import { Button } from '@/app/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Badge } from '@/app/components/ui/badge';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/app/components/ui/hover-card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/app/components/ui/tooltip';
import { Skeleton } from '@/app/components/ui/skeleton';
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

const diasCulto = [
  { key: 'cultoDomingoRDJ', label: 'Domingo (RDJ)' },
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
    cultoDomingoRDJ: false,
    cultoDomingo: false,
    cultoSegunda: false,
    cultoTerca: false,
    cultoQuarta: false,
    cultoQuinta: false,
    cultoSexta: false,
    cultoSabado: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    carregarIgrejas();
  }, []);

  const carregarIgrejas = async () => {
    try {
      setIsLoading(true);
      const dados = await igrejaService.listar();
      setIgrejas(dados);
    } catch (error) {
      console.error('Erro ao carregar igrejas:', error);
      toast.error('Erro ao carregar igrejas. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
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
      cultoDomingoRDJ: false,
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
      cultoDomingoRDJ: igreja.cultoDomingoRDJ,
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

  const getDiasCultoAgrupados = (igreja: Igreja) => {
    const grupos = {
      domingo: diasCulto
        .filter(dia => dia.key.includes('domingo') && igreja[dia.key])
        .map(dia => dia.label),
      semanais: diasCulto
        .filter(dia => !dia.key.includes('domingo') && igreja[dia.key])
        .map(dia => dia.label),
    };

    return grupos;
  };

  return (
    <div className="p-4 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Igrejas</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Adicionar Igreja
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <div className="rounded-md border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Dias de Culto</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {igrejas.map((igreja) => {
                const diasAgrupados = getDiasCultoAgrupados(igreja);
                return (
                  <TableRow key={igreja.id}>
                    <TableCell className="font-medium">{igreja.nome}</TableCell>
                    <TableCell>
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8">
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            Ver dias de culto
                          </Button>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80">
                          <div className="space-y-4">
                            {diasAgrupados.domingo.length > 0 && (
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold">Domingos:</h4>
                                <div className="flex flex-wrap gap-2">
                                  {diasAgrupados.domingo.map(dia => (
                                    <Badge key={dia} variant="default">
                                      {dia}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            {diasAgrupados.semanais.length > 0 && (
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold">Durante a semana:</h4>
                                <div className="flex flex-wrap gap-2">
                                  {diasAgrupados.semanais.map(dia => (
                                    <Badge key={dia} variant="secondary">
                                      {dia}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    </TableCell>
                    <TableCell className="text-right">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(igreja)}
                              className="mr-2"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Editar igreja</p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(igreja.id)}
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Excluir igreja</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogTitle>
            {igrejaEmEdicao ? 'Editar Igreja' : 'Adicionar Nova Igreja'}
          </DialogTitle>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da Igreja</Label>
              <Input
                id="nome"
                value={novaIgreja.nome}
                onChange={(e) => setNovaIgreja(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Digite o nome da igreja"
                required
              />
            </div>

            <div className="space-y-3">
              <Label>Dias de Culto</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {diasCulto.map(dia => (
                  <div key={dia.key} className="flex items-center space-x-2 p-2 rounded-lg border">
                    <Checkbox
                      id={`culto-${dia.key}`}
                      checked={novaIgreja[dia.key]}
                      onCheckedChange={(checked) =>
                        setNovaIgreja(prev => ({ ...prev, [dia.key]: checked as boolean }))
                      }
                    />
                    <Label
                      htmlFor={`culto-${dia.key}`}
                      className="flex-1 cursor-pointer"
                    >
                      {dia.label}
                    </Label>
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