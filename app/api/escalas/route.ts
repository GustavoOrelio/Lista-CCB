import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { verifyToken } from "@/app/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json(
        { message: "Token não fornecido" },
        { status: 401 }
      );
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ message: "Token inválido" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    switch (action) {
      case "igrejas":
        const igrejas = await prisma.igreja.findMany({
          orderBy: { nome: "asc" },
        });
        return NextResponse.json(igrejas);

      case "cargos":
        const cargos = await prisma.cargo.findMany({
          where: { ativo: true },
          orderBy: { nome: "asc" },
        });
        return NextResponse.json(cargos);

      case "escala":
        const mes = parseInt(searchParams.get("mes") || "0");
        const ano = parseInt(searchParams.get("ano") || "2024");
        const igrejaId = searchParams.get("igrejaId");
        const cargoId = searchParams.get("cargoId");

        if (!igrejaId || !cargoId) {
          return NextResponse.json(
            { message: "igrejaId e cargoId são obrigatórios" },
            { status: 400 }
          );
        }

        const escala = await prisma.escalaItem.findMany({
          where: {
            igrejaId,
            cargoId,
            data: {
              gte: new Date(ano, mes, 1),
              lt: new Date(ano, mes + 1, 1),
            },
          },
          include: {
            voluntarios: {
              include: {
                voluntario: true,
              },
            },
          },
          orderBy: { data: "asc" },
        });

        const escalaFormatada = escala.map((item) => ({
          data: item.data,
          voluntarios: item.voluntarios.map((ve: any) => ({
            id: ve.voluntario.id,
            nome: ve.voluntario.nome,
          })),
          igrejaId: item.igrejaId,
          cargoId: item.cargoId,
          tipoCulto: item.tipoCulto,
        }));

        return NextResponse.json(escalaFormatada);

      default:
        return NextResponse.json(
          { message: "Ação não especificada" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Erro na API de escalas:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("POST /api/escalas - Iniciando requisição");

    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json(
        { message: "Token não fornecido" },
        { status: 401 }
      );
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ message: "Token inválido" }, { status: 401 });
    }

    const body = await request.json();
    console.log("Body recebido:", JSON.stringify(body, null, 2));

    const { action, ...data } = body;

    switch (action) {
      case "gerar":
        console.log("Gerando escala...");
        const { dias, igrejaId, cargoId } = data;

        // Validar dados obrigatórios
        if (!dias || !Array.isArray(dias) || dias.length === 0) {
          console.log("Erro: dias inválidos", dias);
          return NextResponse.json(
            { message: "Dias são obrigatórios e devem ser um array não vazio" },
            { status: 400 }
          );
        }

        if (!igrejaId || !cargoId) {
          console.log("Erro: igrejaId ou cargoId faltando", {
            igrejaId,
            cargoId,
          });
          return NextResponse.json(
            { message: "igrejaId e cargoId são obrigatórios" },
            { status: 400 }
          );
        }

        console.log("Dados válidos, convertendo datas...");
        // Converter strings de data para objetos Date
        const diasConvertidos = dias.map((dia: string) => new Date(dia));
        console.log("Datas convertidas:", diasConvertidos);

        // Deletar escala existente do mês
        const primeiroDia = diasConvertidos[0];
        const mes = primeiroDia.getMonth();
        const ano = primeiroDia.getFullYear();
        console.log("Mês/Ano:", mes, ano);

        console.log("Iniciando transação...");
        await prisma.$transaction(async (tx) => {
          console.log("Buscando escalas existentes...");
          // Buscar e deletar escalas existentes
          const escalasExistentes = await tx.escalaItem.findMany({
            where: {
              igrejaId,
              cargoId,
              data: {
                gte: new Date(ano, mes, 1),
                lt: new Date(ano, mes + 1, 1),
              },
            },
          });
          console.log(
            "Escalas existentes encontradas:",
            escalasExistentes.length
          );

          for (const escala of escalasExistentes) {
            await tx.voluntarioEscala.deleteMany({
              where: { escalaItemId: escala.id },
            });
            await tx.escalaItem.delete({
              where: { id: escala.id },
            });
          }
          console.log("Escalas existentes deletadas");

          console.log("Gerando nova escala...");
          // Gerar nova escala
          const escala = await gerarEscala(
            diasConvertidos,
            igrejaId,
            cargoId,
            tx
          );
          console.log("Escala gerada:", escala.length, "itens");

          // Salvar nova escala
          for (const item of escala) {
            const escalaItem = await tx.escalaItem.create({
              data: {
                data: item.data,
                igrejaId: item.igrejaId,
                cargoId: item.cargoId,
                tipoCulto: item.tipoCulto,
              },
            });

            for (const voluntario of item.voluntarios) {
              await tx.voluntarioEscala.create({
                data: {
                  voluntarioId: voluntario.id,
                  escalaItemId: escalaItem.id,
                },
              });
            }
          }
          console.log("Escala salva no banco");
        });

        console.log("Buscando escala gerada...");
        // Retornar a escala gerada
        const escalaGerada = await prisma.escalaItem.findMany({
          where: {
            igrejaId,
            cargoId,
            data: {
              gte: new Date(ano, mes, 1),
              lt: new Date(ano, mes + 1, 1),
            },
          },
          include: {
            voluntarios: {
              include: {
                voluntario: true,
              },
            },
          },
          orderBy: { data: "asc" },
        });

        const escalaFormatada = escalaGerada.map((item) => ({
          data: item.data,
          voluntarios: item.voluntarios.map((ve: any) => ({
            id: ve.voluntario.id,
            nome: ve.voluntario.nome,
          })),
          igrejaId: item.igrejaId,
          cargoId: item.cargoId,
          tipoCulto: item.tipoCulto,
        }));

        console.log(
          "Retornando escala formatada:",
          escalaFormatada.length,
          "itens"
        );
        return NextResponse.json(escalaFormatada);

      default:
        return NextResponse.json(
          { message: "Ação não especificada" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Erro na API de escalas:", error);
    console.error(
      "Stack trace:",
      error instanceof Error ? error.stack : "Sem stack trace"
    );
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

async function gerarEscala(
  dias: Date[],
  igrejaId: string,
  cargoId: string,
  tx: any
) {
  console.log("gerarEscala - Iniciando com:", {
    dias: dias.length,
    igrejaId,
    cargoId,
  });
  const escala: any[] = [];

  for (const data of dias) {
    console.log("Processando data:", data);
    const diaSemana = getDiaDaSemana(data);
    console.log("Dia da semana:", diaSemana);

    // Buscar voluntários disponíveis
    console.log("Buscando voluntários para:", { igrejaId, cargoId, diaSemana });
    const voluntarios = await tx.voluntario.findMany({
      where: {
        igrejaId,
        cargoId,
        [diaSemana]: true,
      },
      orderBy: { nome: "asc" },
    });
    console.log("Voluntários encontrados:", voluntarios.length);

    if (voluntarios.length > 0) {
      // Selecionar voluntário com menos dias trabalhados
      const voluntarioSelecionado = voluntarios[0]; // Simplificado por enquanto
      console.log("Voluntário selecionado:", voluntarioSelecionado.nome);

      escala.push({
        data,
        voluntarios: [
          {
            id: voluntarioSelecionado.id,
            nome: voluntarioSelecionado.nome,
          },
        ],
        igrejaId,
        cargoId,
        tipoCulto: getTipoCulto(data, diaSemana),
      });
      console.log("Item adicionado à escala");
    } else {
      console.log("Nenhum voluntário disponível para esta data");
    }
  }

  console.log("Escala final gerada:", escala.length, "itens");
  return escala;
}

function getDiaDaSemana(data: Date): string {
  const dias = [
    "domingo",
    "segunda",
    "terca",
    "quarta",
    "quinta",
    "sexta",
    "sabado",
  ];
  return dias[data.getDay()];
}

function getTipoCulto(data: Date, diaSemana: string): string {
  // Se for domingo, verificar se é RDJ ou culto normal
  if (diaSemana === "domingo") {
    // Se for antes das 12h, é RDJ, senão é culto normal
    return data.getHours() < 12 ? "domingoRDJ" : "domingo";
  }

  return diaSemana;
}
