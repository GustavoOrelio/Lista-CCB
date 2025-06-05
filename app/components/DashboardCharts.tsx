"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/app/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { voluntarioService } from '@/app/services/voluntarioService';
import { igrejaService } from '@/app/services/igrejaService';
import { cargoService } from '@/app/services/cargoService';
import { EscalaService } from '@/app/services/escalaService';

const COLORS = ["#6366f1", "#f59e42", "#10b981", "#ef4444", "#3b82f6", "#a21caf", "#eab308", "#14b8a6"];

export function DashboardCharts() {
  const [data, setData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);
  const [lineData, setLineData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [heatmap, setHeatmap] = useState<{ [dia: string]: { [horario: string]: number } }>({});

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const igrejas = await igrejaService.listar();
      const voluntarios = await voluntarioService.listar();
      const cargos = await cargoService.listar();
      // Agrupar voluntários por igreja
      const porIgreja = igrejas.map(igreja => ({
        igreja: igreja.nome,
        total: voluntarios.filter(v => v.igrejaId === igreja.id).length
      }));
      setData(porIgreja);
      // Agrupar voluntários por cargo
      const porCargo = cargos.map((cargo, idx) => ({
        name: cargo.nome,
        value: voluntarios.filter(v => v.cargoId === cargo.id).length,
        color: COLORS[idx % COLORS.length]
      })).filter(c => c.value > 0);
      setPieData(porCargo);
      // Evolução de voluntários ao longo dos meses (acumulado)
      const meses = Array.from({ length: 12 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (11 - i));
        return d;
      });
      const evolucao = meses.map((mes) => {
        // Não temos data de cadastro, então mostramos o total acumulado
        return {
          mes: mes.toLocaleString('default', { month: 'short', year: '2-digit' }),
          total: voluntarios.length
        };
      });
      setLineData(evolucao);
      // Heatmap de presença (último mês)
      const hoje = new Date();
      const mes = hoje.getMonth();
      const ano = hoje.getFullYear();
      // Buscar escalas do mês para todas as igrejas/cargos
      let escalas: any[] = [];
      // Para simplificar, buscar para igreja/cargo vazio (todas)
      try {
        escalas = await EscalaService.getEscalaDoMes(mes, ano, '', '');
      } catch { }
      // Mapear dias da semana e horários
      const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const horarios = ['Manhã', 'Tarde', 'Noite'];
      // Inicializar matriz
      const matriz: { [dia: string]: { [horario: string]: number } } = {};
      diasSemana.forEach(dia => {
        matriz[dia] = { Manhã: 0, Tarde: 0, Noite: 0 };
      });
      // Preencher matriz
      escalas.forEach((escala) => {
        const data = new Date(escala.data);
        const dia = diasSemana[data.getDay()];
        const hora = data.getHours();
        let horario = 'Manhã';
        if (hora >= 12 && hora < 18) horario = 'Tarde';
        if (hora >= 18) horario = 'Noite';
        matriz[dia][horario]++;
      });
      setHeatmap(matriz);
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Distribuição de Voluntários por Igreja</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            {loading ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">Carregando...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="igreja" fontSize={12} />
                  <YAxis allowDecimals={false} fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" fill="#6366f1" name="Voluntários" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Distribuição de Voluntários por Cargo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full flex items-center justify-center">
            {loading ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">Carregando...</div>
            ) : pieData.length === 0 ? (
              <div className="text-muted-foreground">Nenhum dado para exibir</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {pieData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Evolução do Número de Voluntários (últimos 12 meses)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            {loading ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">Carregando...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" fontSize={12} />
                  <YAxis allowDecimals={false} fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} name="Voluntários" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Heatmap de Presença (Escalas por Dia/Horário - Último mês)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-max border-collapse">
              <thead>
                <tr>
                  <th className="p-2 text-xs font-medium text-gray-500 bg-muted"></th>
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(dia => (
                    <th key={dia} className="p-2 text-xs font-medium text-gray-500 bg-muted">{dia}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {['Manhã', 'Tarde', 'Noite'].map(horario => (
                  <tr key={horario}>
                    <td className="p-2 text-xs font-medium text-gray-500 bg-muted">{horario}</td>
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(dia => {
                      const valor = heatmap[dia]?.[horario] || 0;
                      // Definir cor baseada no valor
                      const cor = valor === 0 ? 'bg-gray-100' : valor < 2 ? 'bg-blue-100' : valor < 4 ? 'bg-blue-400' : 'bg-blue-700 text-white';
                      return (
                        <td key={dia} className={`p-2 text-center rounded transition-colors ${cor}`}>{valor}</td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 