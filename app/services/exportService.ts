import * as XLSX from "xlsx";
import { EscalaItem } from "../types/escala";

export const exportService = {
  exportarEscalaParaXLSX(escala: EscalaItem[], nomeIgreja: string) {
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

    // Criar a lista de contatos
    // const contatos = [
    //   [""], // Linha em branco
    //   ["Nome", "Telefone"],
    //   ["Alcindo", "98441-5428"],
    //   ["César", "99816-5324"],
    //   ["Davi", "97400-8347"],
    //   ["Dirceu", "99715-9204"],
    //   ["Edson", "99914-3088"],
    //   ["Eduardo", "99936-3908"],
    //   ["Erick", "99851-0399"],
    //   ["Fábio", "99935-0028"],
    //   ["Júnior", "99121-5661"],
    //   ["Kaique", "99920-0024"],
    //   ["Mauro", "99953-8016"],
    //   ["Sérgio", "99803-2891"],
    // ];

    // Combinar todos os dados
    const todosOsDados = [
      ...cabecalho,
      ...dadosEscala,
      //...contatos
    ];

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
};
