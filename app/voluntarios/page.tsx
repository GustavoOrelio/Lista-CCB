'use client';

import { useState, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Voluntario } from '../types/voluntario';
import { Igreja } from '../types/igreja';
import { Cargo } from '../types/cargo';
import { DiaSemana } from '../types/diaSemana';
import { voluntarioService } from '../services/voluntarioService';
import { igrejaService } from '../services/igrejaService';
import { cargoService } from '../services/cargoService';
import { Button } from '@/app/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/app/components/ui/dialog';
import { VoluntariosTable } from '../components/voluntarios/VoluntariosTable';
import { VoluntarioForm } from '../components/voluntarios/VoluntarioForm';
import { DeleteConfirmationDialog } from '../components/voluntarios/DeleteConfirmationDialog';
import { toast } from 'sonner';

const diasSemana: DiaSemana[] = [
  { id: 'domingoRDJ', key: 'domingoRDJ', label: 'Domingo (RDJ)', cultoProp: 'cultoDomingoRDJ' },
  { id: 'domingo', key: 'domingo', label: 'Domingo', cultoProp: 'cultoDomingo' },
  { id: 'segunda', key: 'segunda', label: 'Segunda-feira', cultoProp: 'cultoSegunda' },
  { id: 'terca', key: 'terca', label: 'Terça-feira', cultoProp: 'cultoTerca' },
  { id: 'quarta', key: 'quarta', label: 'Quarta-feira', cultoProp: 'cultoQuarta' },
  { id: 'quinta', key: 'quinta', label: 'Quinta-feira', cultoProp: 'cultoQuinta' },
  { id: 'sexta', key: 'sexta', label: 'Sexta-feira', cultoProp: 'cultoSexta' },
  { id: 'sabado', key: 'sabado', label: 'Sábado', cultoProp: 'cultoSabado' }
];

export default function Voluntarios() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [voluntarioParaExcluir, setVoluntarioParaExcluir] = useState<string | null>(null);
  const [voluntarios, setVoluntarios] = useState<Voluntario[]>([]);
  const [igrejas, setIgrejas] = useState<Igreja[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [voluntarioEmEdicao, setVoluntarioEmEdicao] = useState<Voluntario | null>(null);
  const [novoVoluntario, setNovoVoluntario] = useState<Omit<Voluntario, 'id'> & {
    disponibilidades: NonNullable<Voluntario['disponibilidades']>;
  }>({
    nome: '',
    igrejaId: '',
    igrejaNome: '',
    cargoId: '',
    cargoNome: '',
    disponibilidades: {
      domingoRDJ: false,
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
      const [dadosVoluntarios, dadosIgrejas, dadosCargos] = await Promise.all([
        voluntarioService.listar(),
        igrejaService.listar(),
        cargoService.listar()
      ]);
      setVoluntarios(dadosVoluntarios);
      setIgrejas(dadosIgrejas);
      setCargos(dadosCargos);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados. Por favor, tente novamente.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (voluntarioEmEdicao) {
        await voluntarioService.atualizar(voluntarioEmEdicao.id, novoVoluntario);
        setVoluntarios(prev => prev.map(v =>
          v.id === voluntarioEmEdicao.id ? { ...novoVoluntario, id: voluntarioEmEdicao.id } : v
        ));
        toast.success('Voluntário atualizado com sucesso!');
      } else {
        const id = await voluntarioService.adicionar(novoVoluntario);
        setVoluntarios(prev => [...prev, { id, ...novoVoluntario }]);
        toast.success('Voluntário adicionado com sucesso!');
      }

      handleCloseModal();
    } catch (error) {
      console.error('Erro ao salvar voluntário:', error);
      toast.error('Erro ao salvar voluntário. Por favor, tente novamente.');
    }
  };

  const handleCloseModal = () => {
    setNovoVoluntario({
      nome: '',
      igrejaId: '',
      igrejaNome: '',
      cargoId: '',
      cargoNome: '',
      disponibilidades: {
        domingoRDJ: false,
        domingo: false,
        segunda: false,
        terca: false,
        quarta: false,
        quinta: false,
        sexta: false,
        sabado: false,
      },
    });
    setVoluntarioEmEdicao(null);
    setIsModalOpen(false);
  };

  const handleIgrejaChange = (igrejaId: string) => {
    const igreja = igrejas.find(i => i.id === igrejaId);
    if (igreja) {
      setNovoVoluntario(prev => ({
        ...prev,
        igrejaId: igreja.id,
        igrejaNome: igreja.nome,
        disponibilidades: {
          domingoRDJ: false,
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

  const handleCargoChange = (cargoId: string) => {
    const cargo = cargos.find(c => c.id === cargoId);
    if (cargo) {
      setNovoVoluntario(prev => ({
        ...prev,
        cargoId: cargo.id,
        cargoNome: cargo.nome,
      }));
    }
  };

  const handleEdit = (voluntario: Voluntario) => {
    setVoluntarioEmEdicao(voluntario);
    setNovoVoluntario({
      nome: voluntario.nome,
      igrejaId: voluntario.igrejaId,
      igrejaNome: voluntario.igrejaNome,
      cargoId: voluntario.cargoId,
      cargoNome: voluntario.cargoNome,
      disponibilidades: voluntario.disponibilidades || {
        domingoRDJ: false,
        domingo: false,
        segunda: false,
        terca: false,
        quarta: false,
        quinta: false,
        sexta: false,
        sabado: false,
      },
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    setVoluntarioParaExcluir(id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!voluntarioParaExcluir) return;

    try {
      await voluntarioService.excluir(voluntarioParaExcluir);
      setVoluntarios(prev => prev.filter(v => v.id !== voluntarioParaExcluir));
      setIsDeleteDialogOpen(false);
      setVoluntarioParaExcluir(null);
      toast.success('Voluntário excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir voluntário:', error);
      toast.error('Erro ao excluir voluntário. Por favor, tente novamente.');
    }
  };

  const formatarDisponibilidades = (disponibilidades: Voluntario['disponibilidades']) => {
    if (!disponibilidades) return '';

    return diasSemana
      .filter(dia => disponibilidades[dia.key])
      .map(dia => dia.label)
      .join(', ');
  };

  const handleOpenModal = () => {
    setNovoVoluntario({
      nome: '',
      igrejaId: '',
      igrejaNome: '',
      cargoId: '',
      cargoNome: '',
      disponibilidades: {
        domingoRDJ: false,
        domingo: false,
        segunda: false,
        terca: false,
        quarta: false,
        quinta: false,
        sexta: false,
        sabado: false,
      },
    });
    setVoluntarioEmEdicao(null);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold">Voluntários</h1>
        <Button onClick={handleOpenModal}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Adicionar Voluntário
        </Button>
      </div>

      <VoluntariosTable
        voluntarios={voluntarios}
        onEdit={handleEdit}
        onDelete={handleDelete}
        formatarDisponibilidades={formatarDisponibilidades}
      />

      <Dialog open={isModalOpen} onOpenChange={(open) => {
        if (!open) {
          handleCloseModal();
        } else {
          handleOpenModal();
        }
      }}>
        <DialogContent>
          <DialogTitle>
            {voluntarioEmEdicao ? 'Editar Voluntário' : 'Adicionar Novo Voluntário'}
          </DialogTitle>
          <VoluntarioForm
            voluntario={novoVoluntario}
            igrejas={igrejas}
            cargos={cargos}
            diasSemana={diasSemana}
            onSubmit={handleSubmit}
            onChange={setNovoVoluntario}
            onIgrejaChange={handleIgrejaChange}
            onCargoChange={handleCargoChange}
            isEditing={!!voluntarioEmEdicao}
            onCancel={handleCloseModal}
          />
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Excluir Voluntário"
        description="Tem certeza que deseja excluir este voluntário? Esta ação não pode ser desfeita."
      />
    </div>
  );
} 