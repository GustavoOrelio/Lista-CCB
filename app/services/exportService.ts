import * as XLSX from "xlsx";
import { EscalaItem } from "../types/escala";
import { voluntarioService } from "./voluntarioService";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { RowInput } from "jspdf-autotable";

// Estende o tipo jsPDF para incluir autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: {
      startY: number;
      head?: string[][];
      body: string[][];
      theme: string;
      headStyles?: {
        fillColor: number[];
        textColor: number[];
        fontStyle: string;
      };
      styles?: {
        fontSize: number;
        cellPadding: number;
      };
      columnStyles?: {
        [key: number]: {
          cellWidth: number;
        };
      };
    }) => { finalY: number };
  }
}

export const exportService = {
  async exportarEscalaParaXLSX(
    escala: EscalaItem[],
    nomeIgreja: string,
    isPorteiro: boolean,
    formato: "xlsx" | "pdf" = "xlsx"
  ) {
    if (isPorteiro) {
      if (formato === "pdf") {
        return this.exportarEscalaPorteirosPDF(escala, nomeIgreja);
      } else {
        return await this.exportarEscalaPorteirosXLSX(escala, nomeIgreja);
      }
    } else {
      if (formato === "pdf") {
        return this.exportarEscalaColetaPDF(escala, nomeIgreja);
      } else {
        return this.exportarEscalaColetaXLSX(escala, nomeIgreja);
      }
    }
  },

  async exportarEscalaPorteirosXLSX(escala: EscalaItem[], nomeIgreja: string) {
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

    // Buscar todos os voluntários escalados
    const voluntariosIds = new Set(
      escala.flatMap((item) => item.voluntarios.map((v) => v.id))
    );
    const todosVoluntarios = await voluntarioService.listar();
    const voluntariosMap = new Map(
      todosVoluntarios
        .filter((v) => voluntariosIds.has(v.id))
        .map((v) => [v.id, v])
    );

    // Criar lista de contatos dos voluntários escalados
    const espacamento = [[""], [""]];
    const contatosOrdenados = Array.from(voluntariosMap.values())
      .sort((a, b) => a.nome.localeCompare(b.nome))
      .map((v) => [v.nome, v.telefone]);

    // Combinar todos os dados
    const todosOsDados = [
      ...cabecalho,
      ...dadosEscala,
      ...espacamento,
      ...contatosOrdenados,
    ];

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
      { wch: 25 }, // Data
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

  async exportarEscalaColetaXLSX(escala: EscalaItem[], nomeIgreja: string) {
    // Criar o cabeçalho
    const cabecalho = [
      ["CONGREGAÇÃO CRISTÃ NO BRASIL"],
      ["RODÍZIO ESCRITURAÇÃO CENTRAL"],
      [""], // Linha em branco
      ["DATA", "IRMÃOS RESPONSÁVEL"],
    ];

    // Buscar todos os voluntários escalados
    const voluntariosIds = new Set(
      escala.flatMap((item) => item.voluntarios.map((v) => v.id))
    );
    const todosVoluntarios = await voluntarioService.listar();
    const voluntariosMap = new Map(
      todosVoluntarios
        .filter((v) => voluntariosIds.has(v.id))
        .map((v) => [v.id, v])
    );

    // Formatar os dados da escala
    const dadosEscala = escala.map((item) => {
      const data = item.data;
      const diaFormatado = `${data.getDate().toString().padStart(2, "0")}/${(
        data.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}`;
      const diaSemana = this.getDiaSemanaAbreviado(data);
      const isRDJ = diaSemana === "RDJ";

      return [
        `${diaFormatado} - ${this.getDiaSemana(data)}${isRDJ ? " (RDJ)" : ""}`,
        item.voluntarios.map((v) => v.nome).join(", "),
      ];
    });

    // Criar lista de contatos dos voluntários escalados
    const contatosOrdenados = Array.from(voluntariosMap.values())
      .sort((a, b) => a.nome.localeCompare(b.nome))
      .map((v) => [v.nome, v.telefone]);

    // Adicionar espaço entre a escala e os contatos
    const espacamento = [[""], [""]];

    // Combinar todos os dados
    const todosOsDados = [
      ...cabecalho,
      ...dadosEscala,
      ...espacamento,
      ...contatosOrdenados,
    ];

    // Criar a planilha
    const ws = XLSX.utils.aoa_to_sheet(todosOsDados);

    // Configurar estilos
    const mergeRanges = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }, // Congregação
      { s: { r: 1, c: 0 }, e: { r: 1, c: 1 } }, // Rodízio Escrituração
    ];

    ws["!merges"] = mergeRanges;

    // Ajustar largura das colunas
    ws["!cols"] = [
      { wch: 25 }, // Data
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

  async exportarEscalaColetaPDF(escala: EscalaItem[], nomeIgreja: string) {
    // Buscar todos os voluntários escalados
    const voluntariosIds = new Set(
      escala.flatMap((item) => item.voluntarios.map((v) => v.id))
    );
    const todosVoluntarios = await voluntarioService.listar();
    const voluntariosMap = new Map(
      todosVoluntarios
        .filter((v) => voluntariosIds.has(v.id))
        .map((v) => [v.id, v])
    );

    // Criar o PDF
    const doc = new jsPDF();
    autoTable(doc, {
      /* configuração inicial vazia */
    }); // Inicializa o plugin

    // Configurar fonte e tamanho
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);

    // Adicionar cabeçalho
    doc.text(
      "CONGREGAÇÃO CRISTÃ NO BRASIL",
      doc.internal.pageSize.width / 2,
      15,
      { align: "center" }
    );
    doc.text(
      "RODÍZIO ESCRITURAÇÃO CENTRAL",
      doc.internal.pageSize.width / 2,
      22,
      { align: "center" }
    );

    // Preparar dados da escala
    const dadosEscala = escala.map((item) => {
      const data = item.data;
      const diaFormatado = `${data.getDate().toString().padStart(2, "0")}/${(
        data.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}`;
      const diaSemana = this.getDiaSemanaAbreviado(data);
      const isRDJ = diaSemana === "RDJ";

      return [
        `${diaFormatado} - ${this.getDiaSemana(data)}${isRDJ ? " (RDJ)" : ""}`,
        item.voluntarios.map((v) => v.nome).join(", "),
      ] as RowInput;
    });

    try {
      // Adicionar tabela da escala
      let finalY = 30;
      autoTable(doc, {
        startY: finalY,
        head: [["DATA", "IRMÃOS RESPONSÁVEL"]],
        body: dadosEscala,
        theme: "grid",
        headStyles: {
          fillColor: [200, 200, 200],
          textColor: [0, 0, 0],
          fontStyle: "bold",
        },
        styles: {
          fontSize: 10,
          cellPadding: 2,
          textColor: [0, 0, 0],
        },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 100 },
        },
        didDrawPage: (data) => {
          if (data.cursor) {
            finalY = data.cursor.y;
          }
        },
      });

      // Preparar lista de contatos
      const contatosOrdenados = Array.from(voluntariosMap.values())
        .sort((a, b) => a.nome.localeCompare(b.nome))
        .map((v) => [v.nome, v.telefone] as RowInput);

      // Adicionar tabela de contatos com espaçamento fixo
      autoTable(doc, {
        startY: finalY + 20,
        body: contatosOrdenados,
        theme: "grid",
        styles: {
          fontSize: 10,
          cellPadding: 2,
          textColor: [0, 0, 0],
        },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 50 },
        },
      });

      // Nome do arquivo
      const mesAno = escala[0]?.data.toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
      });
      const nomeArquivo = `Escala ${nomeIgreja} - ${mesAno}.pdf`;

      // Salvar o PDF
      doc.save(nomeArquivo);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      throw new Error(
        "Não foi possível gerar o PDF. Por favor, tente novamente."
      );
    }
  },

  async exportarEscalaPorteirosPDF(escala: EscalaItem[], nomeIgreja: string) {
    // Buscar todos os voluntários escalados
    const voluntariosIds = new Set(
      escala.flatMap((item) => item.voluntarios.map((v) => v.id))
    );
    const todosVoluntarios = await voluntarioService.listar();
    const voluntariosMap = new Map(
      todosVoluntarios
        .filter((v) => voluntariosIds.has(v.id))
        .map((v) => [v.id, v])
    );

    // Criar o PDF
    const doc = new jsPDF();

    // Configurar fonte e tamanho
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);

    // Adicionar cabeçalho
    doc.text(nomeIgreja.toUpperCase(), doc.internal.pageSize.width / 2, 15, {
      align: "center",
    });

    // Pegar o mês e ano da primeira data da escala
    const cabecalhoMesAno = escala[0]?.data
      .toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
      })
      .toUpperCase();

    doc.text(cabecalhoMesAno, doc.internal.pageSize.width / 2, 22, {
      align: "center",
    });

    // Preparar dados da escala
    const dadosEscala = escala.map((item) => {
      const data = item.data;
      const diaSemana = this.getDiaSemana(data);
      return [
        `${data.getDate().toString().padStart(2, "0")}/${(data.getMonth() + 1)
          .toString()
          .padStart(2, "0")} ${diaSemana}`,
        item.voluntarios[0]?.nome || "",
        item.voluntarios[1]?.nome || "",
      ] as RowInput;
    });

    try {
      // Adicionar tabela da escala
      let finalY = 30;
      autoTable(doc, {
        startY: finalY,
        head: [["DATA", "PEDIDO", "AB.IGREJA"]],
        body: dadosEscala,
        theme: "grid",
        headStyles: {
          fillColor: [200, 200, 200],
          textColor: [0, 0, 0],
          fontStyle: "bold",
        },
        styles: {
          fontSize: 10,
          cellPadding: 2,
          textColor: [0, 0, 0],
        },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 65 },
          2: { cellWidth: 65 },
        },
        didDrawPage: (data) => {
          if (data.cursor) {
            finalY = data.cursor.y;
          }
        },
      });

      // Preparar lista de contatos
      const contatosOrdenados = Array.from(voluntariosMap.values())
        .sort((a, b) => a.nome.localeCompare(b.nome))
        .map((v) => [v.nome, v.telefone] as RowInput);

      // Adicionar tabela de contatos com espaçamento fixo
      autoTable(doc, {
        startY: finalY + 20,
        body: contatosOrdenados,
        theme: "grid",
        styles: {
          fontSize: 10,
          cellPadding: 2,
          textColor: [0, 0, 0],
        },
        columnStyles: {
          0: { cellWidth: 90 },
          1: { cellWidth: 70 },
        },
      });

      // Nome do arquivo
      const mesAno = escala[0]?.data.toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
      });
      const nomeArquivo = `Escala ${nomeIgreja} - ${mesAno}.pdf`;

      // Salvar o PDF
      doc.save(nomeArquivo);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      throw new Error(
        "Não foi possível gerar o PDF. Por favor, tente novamente."
      );
    }
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
