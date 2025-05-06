'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { Calendar } from '@/app/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Skeleton } from "@/app/components/ui/skeleton";
import { EscalaService } from '@/app/services/escalaService';
import { toast } from 'sonner';
import { exportService } from '../services/exportService';
import { FileText, Calendar as CalendarIcon, Table } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<string>('calendario');
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Carregar igrejas e cargos
  useEffect(() => {
    const carregarDados = async () => {
      try {
        setIsInitialLoading(true);
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
      } finally {
        setIsInitialLoading(false);
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

  const handleExportarXLSX = async () => {
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
      await exportService.exportarEscalaParaXLSX(escalaAtual, igreja.nome, isPorteiro);
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
    <div className="p-4 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Escalas</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExportarXLSX}
            disabled={escalaAtual.length === 0 || isLoading}
          >
            <FileText className="w-4 h-4 mr-2" />
            Exportar XLSX
          </Button>
          <Button
            variant="outline"
            onClick={handleExportarPDF}
            disabled={escalaAtual.length === 0 || isLoading}
          >
            <FileText className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {isInitialLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      ) : (
        <>
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Igreja</label>
                  <Select value={selectedIgreja} onValueChange={setSelectedIgreja}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma igreja" />
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

                <div className="space-y-2">
                  <label className="text-sm font-medium">Cargo</label>
                  <Select value={selectedCargo} onValueChange={setSelectedCargo}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cargo" />
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

                <div className="space-y-2">
                  <label className="text-sm font-medium">Mês</label>
                  <Select
                    value={selectedMonth.getMonth().toString()}
                    onValueChange={handleMonthSelect}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          {new Date(0, i).toLocaleString('default', { month: 'long' })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <Button
                  onClick={handleGerarEscala}
                  disabled={!selectedIgreja || !selectedCargo || isLoading}
                  className="w-full sm:w-auto"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin mr-2">⏳</div>
                      Gerando Escala...
                    </>
                  ) : (
                    'Gerar Escala'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {selectedIgreja && selectedCargo && (
            <Card>
              <CardContent className="pt-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="calendario" className="flex items-center">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      Calendário
                    </TabsTrigger>
                    <TabsTrigger value="lista" className="flex items-center">
                      <Table className="w-4 h-4 mr-2" />
                      Lista
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="calendario" className="mt-4">
                    <div className="flex flex-col items-center space-y-4">
                      <Calendar
                        mode="multiple"
                        selected={diasCulto}
                        className="rounded-md border"
                        disabled={(date) => !diasCulto.some(d => d.toDateString() === date.toDateString())}
                        modifiers={{
                          culto: diasCulto
                        }}
                        modifiersStyles={{
                          culto: { backgroundColor: 'black', color: 'white' }
                        }}
                      />

                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: 'black' }}></div>
                        <span>Dias de Culto</span>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="lista" className="mt-4">
                    <div className="rounded-md border">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="px-4 py-2 text-left">Data</th>
                            <th className="px-4 py-2 text-left">Voluntários</th>
                          </tr>
                        </thead>
                        <tbody>
                          {escalaAtual.map((item, index) => (
                            <tr key={index} className="border-b">
                              <td className="px-4 py-2">
                                {item.data.toLocaleDateString()}
                              </td>
                              <td className="px-4 py-2">
                                {item.voluntarios.map(v => v.nome).join(', ')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Estatísticas na aba lista */}
                    {escalaAtual.length > 0 && (
                      <div className="mt-6 border rounded-md p-4">
                        <h3 className="text-lg font-semibold mb-3">Quantidade de Escalas por Voluntário</h3>
                        <div className="grid gap-2">
                          {Object.entries(
                            escalaAtual.reduce((acc, item) => {
                              item.voluntarios.forEach(v => {
                                acc[v.nome] = (acc[v.nome] || 0) + 1;
                              });
                              return acc;
                            }, {} as Record<string, number>)
                          )
                            .sort(([, a], [, b]) => b - a)
                            .map(([nome, quantidade]) => (
                              <div key={nome} className="flex justify-between items-center py-1 px-2 bg-muted/50 rounded">
                                <span>{nome}</span>
                                <span className="font-medium">{quantidade} {quantidade === 1 ? 'vez' : 'vezes'}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
} 