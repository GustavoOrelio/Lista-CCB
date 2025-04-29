'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Calendar } from '@/app/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { EscalaService } from '@/app/services/escalaService';
import { toast } from 'sonner';
import { exportService } from '../services/exportService';

interface EscalaItem {
  data: Date;
  voluntarios: {
    id: string;
    nome: string;
  }[];
  igrejaId: string;
  cargoId: string;
  tipoCulto: string;
}

interface Igreja {
  id: string;
  nome: string;
  diasCulto: string[]; // ['domingo', 'quarta', 'sabado']
  cultoDomingoRDJ?: boolean;
  cultoDomingo?: boolean;
  cultoSegunda?: boolean;
  cultoTerca?: boolean;
  cultoQuarta?: boolean;
  cultoQuinta?: boolean;
  cultoSexta?: boolean;
  cultoSabado?: boolean;
}

interface Cargo {
  id: string;
  nome: string;
}

export default function EscalasPage() {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [selectedIgreja, setSelectedIgreja] = useState<string>('');
  const [selectedCargo, setSelectedCargo] = useState<string>('');
  const [igrejas, setIgrejas] = useState<Igreja[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [diasCulto, setDiasCulto] = useState<Date[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [escalaAtual, setEscalaAtual] = useState<EscalaItem[]>([]);

  // Carregar igrejas e cargos
  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [igrejasData, cargosData] = await Promise.all([
          EscalaService.getIgrejas(),
          EscalaService.getCargos()
        ]);
        setIgrejas(igrejasData);
        setCargos(cargosData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast.error('Erro ao carregar dados', {
          description: 'Não foi possível carregar as igrejas e cargos'
        });
      }
    };
    carregarDados();
  }, []);

  // Carregar escala atual quando mudar igreja, cargo ou mês
  useEffect(() => {
    if (!selectedIgreja || !selectedCargo) return;

    const carregarEscala = async () => {
      try {
        const escala = await EscalaService.getEscalaDoMes(
          selectedMonth.getMonth(),
          selectedMonth.getFullYear(),
          selectedIgreja,
          selectedCargo
        );
        setEscalaAtual(escala);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro inesperado';

        // Verifica se é o erro de índice
        if (errorMessage.includes('requires an index')) {
          toast.error('Configuração inicial necessária', {
            description: 'O sistema está sendo configurado pela primeira vez. Por favor, aguarde alguns minutos e tente novamente.'
          });
        } else {
          toast.error('Erro ao carregar escala', {
            description: errorMessage
          });
        }
      }
    };

    carregarEscala();
  }, [selectedMonth, selectedIgreja, selectedCargo]);

  // Atualizar dias de culto quando mudar a igreja ou mês
  useEffect(() => {
    if (!selectedIgreja) {
      setDiasCulto([]);
      return;
    }

    const igreja = igrejas.find(i => i.id === selectedIgreja);

    if (!igreja || !igreja.diasCulto || !Array.isArray(igreja.diasCulto)) {
      console.error('Igreja não encontrada ou dados inválidos:', {
        igreja,
        todasIgrejas: igrejas,
        selectedIgreja
      });
      toast.error('Erro ao carregar dias de culto', {
        description: 'Os dados da igreja estão incompletos ou inválidos'
      });
      setDiasCulto([]);
      return;
    }

    // Gerar datas dos cultos para o mês selecionado
    const diasDoMes = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0).getDate();
    const diasCultoDoMes: Date[] = [];
    const diasProcessados = new Set<string>();

    for (let dia = 1; dia <= diasDoMes; dia++) {
      const data = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), dia);
      const diaDaSemana = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'][data.getDay()];
      const dataString = data.toISOString().split('T')[0];

      // Se já processamos este dia, pula
      if (diasProcessados.has(dataString)) {
        continue;
      }

      // Se for domingo, verifica se tem algum dos cultos
      if (diaDaSemana === 'domingo') {
        // Se tem culto RDJ, adiciona
        if (igreja.cultoDomingoRDJ === true) {
          const novaData = new Date(data);
          novaData.setHours(9); // Define horário para RDJ
          diasCultoDoMes.push(novaData);
        }
        // Se tem culto normal de domingo, adiciona também
        if (igreja.cultoDomingo === true) {
          const novaData = new Date(data);
          novaData.setHours(18); // Define horário para culto noturno
          diasCultoDoMes.push(novaData);
        }
        diasProcessados.add(dataString);
      }
      // Para os outros dias, verifica normalmente
      else if (igreja.diasCulto.includes(diaDaSemana)) {
        diasCultoDoMes.push(new Date(data));
        diasProcessados.add(dataString);
      }
    }

    setDiasCulto(diasCultoDoMes);
  }, [selectedIgreja, selectedMonth, igrejas]);

  const handleGerarEscala = async () => {
    if (!selectedIgreja || !selectedCargo) {
      toast.error('Selecione a igreja e o cargo');
      return;
    }

    if (diasCulto.length === 0) {
      toast.error('Não há dias de culto definidos', {
        description: 'Verifique se os dias de culto estão configurados corretamente na igreja.'
      });
      return;
    }

    try {
      setIsLoading(true);
      const escala = await EscalaService.gerarEscala(diasCulto, selectedIgreja, selectedCargo);

      if (escala.length === 0) {
        toast.error('Não foi possível gerar a escala', {
          description: 'Não há voluntários disponíveis para os dias de culto selecionados. Verifique se existem voluntários cadastrados e se eles têm disponibilidade nos dias necessários.'
        });
      } else {
        toast.success('Escala gerada com sucesso!', {
          description: `Foram distribuídos ${escala.length} dias entre os voluntários.`
        });
        setEscalaAtual(escala);
      }
    } catch (error) {
      console.error('Erro ao gerar escala:', error);
      toast.error('Erro ao gerar escala', {
        description: error instanceof Error ? error.message : 'Ocorreu um erro inesperado'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMonthSelect = (value: string) => {
    const date = new Date();
    date.setMonth(parseInt(value));
    setSelectedMonth(date);
  };

  const handleExportarXLSX = () => {
    if (escalaAtual.length === 0) {
      toast.error('Não há escala para exportar');
      return;
    }

    const igreja = igrejas.find(i => i.id === selectedIgreja);
    const cargo = cargos.find(c => c.id === selectedCargo);

    if (!igreja || !cargo) {
      toast.error('Igreja ou cargo não encontrado');
      return;
    }

    try {
      // Verifica se o cargo é de porteiro
      const isPorteiro = cargo.nome.toLowerCase().includes('porteiro');
      exportService.exportarEscalaParaXLSX(escalaAtual, igreja.nome, isPorteiro);
      toast.success('Escala exportada com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar escala:', error);
      toast.error('Erro ao exportar escala', {
        description: error instanceof Error ? error.message : 'Ocorreu um erro inesperado'
      });
    }
  };

  const handleExportarPDF = async () => {
    if (escalaAtual.length === 0) {
      toast.error('Não há escala para exportar');
      return;
    }

    const igreja = igrejas.find(i => i.id === selectedIgreja);
    const cargo = cargos.find(c => c.id === selectedCargo);

    if (!igreja || !cargo) {
      toast.error('Igreja ou cargo não encontrado');
      return;
    }

    try {
      // Verifica se o cargo é de porteiro
      const isPorteiro = cargo.nome.toLowerCase().includes('porteiro');
      await exportService.exportarEscalaParaXLSX(escalaAtual, igreja.nome, isPorteiro, 'pdf');
      toast.success('PDF exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao exportar PDF', {
        description: error instanceof Error ? error.message : 'Ocorreu um erro inesperado'
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Geração de Escalas</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Configuração</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Igreja</label>
                <Select onValueChange={setSelectedIgreja} value={selectedIgreja}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a igreja" />
                  </SelectTrigger>
                  <SelectContent>
                    {igrejas.map((igreja) => (
                      <SelectItem key={igreja.id} value={igreja.id}>
                        {igreja.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Cargo</label>
                <Select onValueChange={setSelectedCargo} value={selectedCargo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    {cargos.map((cargo) => (
                      <SelectItem key={cargo.id} value={cargo.id}>
                        {cargo.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Mês de Referência</label>
                <Select onValueChange={handleMonthSelect} defaultValue={selectedMonth.getMonth().toString()}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o mês" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => {
                      const date = new Date();
                      date.setMonth(i);
                      return (
                        <SelectItem key={i} value={i.toString()}>
                          {date.toLocaleString('pt-BR', { month: 'long' })}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {selectedIgreja && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">Dias de Culto</h3>
                  <Calendar
                    mode="multiple"
                    selected={diasCulto}
                    className="rounded-md border"
                    disabled
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Escala Atual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {escalaAtual.length > 0 ? (
                <div className="space-y-2">
                  {escalaAtual
                    .sort((a, b) => {
                      // Primeiro ordena por data
                      const dateCompare = a.data.getTime() - b.data.getTime();
                      if (dateCompare !== 0) return dateCompare;

                      // Se for mesmo dia, RDJ vem antes de domingo
                      if (a.tipoCulto === 'domingoRDJ' && b.tipoCulto === 'domingo') return -1;
                      if (a.tipoCulto === 'domingo' && b.tipoCulto === 'domingoRDJ') return 1;
                      return 0;
                    })
                    .reduce((acc, item, index) => {
                      // Cria um identificador único baseado na data e tipo de culto
                      const dateStr = item.data.toISOString().split('T')[0];
                      const key = `${dateStr}-${item.tipoCulto}-${index}`;

                      acc.push(
                        <div
                          key={key}
                          className="flex items-center justify-between p-2 border rounded"
                        >
                          <span>
                            {item.data.toLocaleDateString('pt-BR')}
                            {item.tipoCulto === 'domingoRDJ' ? ' (RDJ)' : ''}
                          </span>
                          <div className="flex gap-2">
                            {item.voluntarios.map((voluntario, idx) => (
                              <span key={`${key}-${voluntario.id}`}>
                                {voluntario.nome}
                                {idx < item.voluntarios.length - 1 ? ' | ' : ''}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                      return acc;
                    }, [] as React.ReactElement[])}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  {selectedIgreja && selectedCargo
                    ? 'Nenhuma escala gerada para este mês'
                    : 'Selecione uma igreja e um cargo para visualizar a escala'}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 mt-6 justify-end">
        <Button
          variant="outline"
          onClick={handleExportarXLSX}
          disabled={escalaAtual.length === 0}
        >
          Exportar XLSX
        </Button>
        <Button
          variant="outline"
          onClick={handleExportarPDF}
          disabled={escalaAtual.length === 0}
        >
          Exportar PDF
        </Button>
        <Button
          onClick={handleGerarEscala}
          disabled={!selectedIgreja || !selectedCargo || isLoading}
        >
          {isLoading ? 'Gerando...' : 'Gerar Escala'}
        </Button>
      </div>
    </div>
  );
} 