import * as XLSX from "xlsx";
import { EscalaItem } from "../types/escala";

export const exportService = {
  exportarEscalaParaXLSX(
    escala: EscalaItem[],
    nomeIgreja: string,
    isPorteiro: boolean
  ) {
    if (isPorteiro) {
      return this.exportarEscalaPorteirosXLSX(escala, nomeIgreja);
    } else {
      return this.exportarEscalaColetaXLSX(escala, nomeIgreja);
    }
  },

  exportarEscalaPorteirosXLSX(escala: EscalaItem[], nomeIgreja: string) {
    // Pegar o mês e ano da primeira data da escala
    const cabecalhoMesAno = escala[0]?.data
      .toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
      })
      .toUpperCase();

    // Criar o cabeçalho
    const cabecalho = [
      [nomeIgreja.toUpperCase()],
      [cabecalhoMesAno], // Mês e ano dinâmico
      [""], // Linha em branco
      ["DATA", "PEDIDO", "AB.IGREJA"],
    ];

    // Formatar os dados da escala
    const dadosEscala = escala.map((item) => {
      const data = item.data;
      const diaSemana = this.getDiaSemana(data);
      return [
        `${data.getDate().toString().padStart(2, "0")}/${(data.getMonth() + 1)
          .toString()
          .padStart(2, "0")} ${diaSemana}`,
        item.voluntarios[0]?.nome || "",
        item.voluntarios[1]?.nome || "",
      ];
    });

    // Combinar todos os dados
    const todosOsDados = [...cabecalho, ...dadosEscala];

    // Criar a planilha
    const ws = XLSX.utils.aoa_to_sheet(todosOsDados);

    // Configurar estilos
    const mergeRanges = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }, // Nome da Igreja
      { s: { r: 1, c: 0 }, e: { r: 1, c: 2 } }, // Mês e Ano
    ];

    ws["!merges"] = mergeRanges;

    // Ajustar largura das colunas
    ws["!cols"] = [
      { wch: 12 }, // Data
      { wch: 20 }, // Pedido
      { wch: 20 }, // Ab.Igreja
    ];

    // Criar o workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Escala");

    // Nome do arquivo
    const mesAno = escala[0]?.data.toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    });
    const nomeArquivo = `Escala ${nomeIgreja} - ${mesAno}.xlsx`;

    // Gerar o arquivo
    XLSX.writeFile(wb, nomeArquivo);
  },

  exportarEscalaColetaXLSX(escala: EscalaItem[], nomeIgreja: string) {
    // Criar o cabeçalho
    const cabecalho = [
      ["CONGREGAÇÃO CRISTÃ NO BRASIL"],
      [`${nomeIgreja.toUpperCase()}`],
      [""], // Linha em branco
      ["DATA", "IRMÃOS RESPONSÁVEL"],
    ];

    // Formatar os dados da escala
    const dadosEscala = escala.map((item) => [
      item.data.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: undefined,
      }) +
        " - " +
        this.getDiaSemana(item.data) +
        (item.tipoCulto === "domingoRDJ" ? " (RDJ)" : ""),
      item.voluntarios.map((v) => v.nome).join(" e "),
    ]);

    // Combinar todos os dados
    const todosOsDados = [...cabecalho, ...dadosEscala];

    // Criar a planilha
    const ws = XLSX.utils.aoa_to_sheet(todosOsDados);

    // Configurar estilos
    const mergeRanges = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }, // Congregação
      { s: { r: 1, c: 0 }, e: { r: 1, c: 1 } }, // Nome da Igreja
    ];

    ws["!merges"] = mergeRanges;

    // Ajustar largura das colunas
    ws["!cols"] = [
      { wch: 20 }, // Data
      { wch: 35 }, // Irmãos
    ];

    // Criar o workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Escala");

    // Nome do arquivo
    const mesAno = escala[0]?.data.toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    });
    const nomeArquivo = `Escala ${nomeIgreja} - ${mesAno}.xlsx`;

    // Gerar o arquivo
    XLSX.writeFile(wb, nomeArquivo);
  },

  getDiaSemana(data: Date): string {
    const diasSemana = {
      0: "Domingo",
      1: "Segunda-Feira",
      2: "Terça-Feira",
      3: "Quarta-Feira",
      4: "Quinta-Feira",
      5: "Sexta-Feira",
      6: "Sábado",
    };
    return diasSemana[data.getDay() as keyof typeof diasSemana];
  },

  getDiaSemanaAbreviado(data: Date): string {
    const diasSemana = {
      0: "Domingo",
      1: "Segunda-Feira",
      2: "Terça-Feira",
      3: "Quarta-Feira",
      4: "Quinta-Feira",
      5: "Sexta-Feira",
      6: "Sábado",
    };
    const dia = diasSemana[data.getDay() as keyof typeof diasSemana];

    // Adiciona sufixo especial para RDJ
    if (data.getDay() === 0) {
      return data.getHours() === 9 ? "RDJ" : "";
    }

    return dia;
  },
};
