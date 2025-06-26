import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

// ===============================================
// INTERFACES - Dados Transformados
// ===============================================

interface TransformedData {
  usuarios: PrismaUsuario[];
  igrejas: PrismaIgreja[];
  cargos: PrismaCargo[];
  voluntarios: PrismaVoluntario[];
  disponibilidades: PrismaDisponibilidade[];
  escalas: PrismaEscala[];
  escalaDias: PrismaEscalaDia[];
  escalaVoluntarios: PrismaEscalaVoluntario[];
}

interface PrismaUsuario {
  id: string;
  uid: string;
  email: string;
  nome: string;
  igrejaId: string | null;
  cargo: string | null;
  isAdmin: boolean;
  criadoEm: string | Date;
}

interface PrismaIgreja {
  id: string;
  nome: string;
  cultoDomingoRDJ: boolean;
  cultoDomingo: boolean;
  cultoSegunda: boolean;
  cultoTerca: boolean;
  cultoQuarta: boolean;
  cultoQuinta: boolean;
  cultoSexta: boolean;
  cultoSabado: boolean;
  criadoEm: string | Date;
}

interface PrismaCargo {
  id: string;
  nome: string;
  descricao: string | null;
  criadoEm: string | Date;
}

interface PrismaVoluntario {
  id: string;
  nome: string;
  telefone: string;
  igrejaId: string;
  cargoId: string;
  diasTrabalhados: number;
  ultimaEscala: string | Date | null;
  criadoEm: string | Date;
}

interface PrismaDisponibilidade {
  id: string;
  voluntarioId: string;
  diaSemana: string;
  disponivel: boolean;
}

interface PrismaEscala {
  id: string;
  mes: number;
  ano: number;
  igrejaId: string;
  cargoId: string;
  criadoEm: string | Date;
}

interface PrismaEscalaDia {
  id: string;
  escalaId: string;
  data: string | Date;
  tipoCulto: string;
}

interface PrismaEscalaVoluntario {
  id: string;
  escalaDiaId: string;
  voluntarioId: string;
}

// ===============================================
// UTILITÁRIOS
// ===============================================

/**
 * Converte string ou Date para objeto Date válido
 */
function parseDate(dateValue: string | Date | null): Date | null {
  if (!dateValue) return null;

  if (dateValue instanceof Date) {
    return dateValue;
  }

  const parsedDate = new Date(dateValue);
  return isNaN(parsedDate.getTime()) ? null : parsedDate;
}

/**
 * Processa dados em lotes para evitar sobrecarga de memória
 */
async function processBatch<T>(
  items: T[],
  batchSize: number,
  processor: (batch: T[]) => Promise<void>
): Promise<void> {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await processor(batch);
  }
}

// ===============================================
// FUNÇÕES DE IMPORTAÇÃO
// ===============================================

/**
 * Importa igrejas para o banco de dados
 */
async function importIgrejas(
  prisma: PrismaClient,
  igrejas: PrismaIgreja[]
): Promise<void> {
  console.log("⛪ Importando igrejas...");

  try {
    const processedIgrejas = igrejas.map((igreja) => ({
      id: igreja.id,
      nome: igreja.nome,
      cultoDomingoRDJ: igreja.cultoDomingoRDJ,
      cultoDomingo: igreja.cultoDomingo,
      cultoSegunda: igreja.cultoSegunda,
      cultoTerca: igreja.cultoTerca,
      cultoQuarta: igreja.cultoQuarta,
      cultoQuinta: igreja.cultoQuinta,
      cultoSexta: igreja.cultoSexta,
      cultoSabado: igreja.cultoSabado,
      criadoEm: parseDate(igreja.criadoEm) || new Date(),
    }));

    // Usar upsert para evitar duplicatas
    for (const igreja of processedIgrejas) {
      await prisma.igreja.upsert({
        where: { id: igreja.id },
        update: igreja,
        create: igreja,
      });
    }

    console.log(
      `  ✅ ${processedIgrejas.length} igrejas importadas com sucesso`
    );
  } catch (error) {
    console.error("❌ Erro ao importar igrejas:", error);
    throw error;
  }
}

/**
 * Importa cargos para o banco de dados
 */
async function importCargos(
  prisma: PrismaClient,
  cargos: PrismaCargo[]
): Promise<void> {
  console.log("💼 Importando cargos...");

  try {
    const processedCargos = cargos.map((cargo) => ({
      id: cargo.id,
      nome: cargo.nome,
      descricao: cargo.descricao,
      criadoEm: parseDate(cargo.criadoEm) || new Date(),
    }));

    // Usar upsert para evitar duplicatas
    for (const cargo of processedCargos) {
      await prisma.cargo.upsert({
        where: { id: cargo.id },
        update: cargo,
        create: cargo,
      });
    }

    console.log(`  ✅ ${processedCargos.length} cargos importados com sucesso`);
  } catch (error) {
    console.error("❌ Erro ao importar cargos:", error);
    throw error;
  }
}

/**
 * Importa usuários para o banco de dados
 */
async function importUsuarios(
  prisma: PrismaClient,
  usuarios: PrismaUsuario[]
): Promise<void> {
  console.log("👤 Importando usuários...");

  try {
    const processedUsuarios = usuarios.map((usuario) => ({
      id: usuario.id,
      uid: usuario.uid,
      email: usuario.email,
      nome: usuario.nome,
      igrejaId: usuario.igrejaId,
      cargo: usuario.cargo,
      isAdmin: usuario.isAdmin,
      criadoEm: parseDate(usuario.criadoEm) || new Date(),
    }));

    // Usar upsert para evitar duplicatas baseado no uid (unique constraint)
    for (const usuario of processedUsuarios) {
      await prisma.usuario.upsert({
        where: { uid: usuario.uid },
        update: usuario,
        create: usuario,
      });
    }

    console.log(
      `  ✅ ${processedUsuarios.length} usuários importados com sucesso`
    );
  } catch (error) {
    console.error("❌ Erro ao importar usuários:", error);
    throw error;
  }
}

/**
 * Importa voluntários para o banco de dados
 */
async function importVoluntarios(
  prisma: PrismaClient,
  voluntarios: PrismaVoluntario[]
): Promise<void> {
  console.log("👥 Importando voluntários...");

  try {
    const processedVoluntarios = voluntarios.map((voluntario) => ({
      id: voluntario.id,
      nome: voluntario.nome,
      telefone: voluntario.telefone,
      igrejaId: voluntario.igrejaId,
      cargoId: voluntario.cargoId,
      diasTrabalhados: voluntario.diasTrabalhados,
      ultimaEscala: parseDate(voluntario.ultimaEscala),
      criadoEm: parseDate(voluntario.criadoEm) || new Date(),
    }));

    // Usar upsert para evitar duplicatas
    for (const voluntario of processedVoluntarios) {
      await prisma.voluntario.upsert({
        where: { id: voluntario.id },
        update: voluntario,
        create: voluntario,
      });
    }

    console.log(
      `  ✅ ${processedVoluntarios.length} voluntários importados com sucesso`
    );
  } catch (error) {
    console.error("❌ Erro ao importar voluntários:", error);
    throw error;
  }
}

/**
 * Importa disponibilidades para o banco de dados
 */
async function importDisponibilidades(
  prisma: PrismaClient,
  disponibilidades: PrismaDisponibilidade[]
): Promise<void> {
  console.log("📋 Importando disponibilidades...");

  try {
    // Processar em lotes para melhor performance
    const BATCH_SIZE = 100;
    let importedCount = 0;

    await processBatch(disponibilidades, BATCH_SIZE, async (batch) => {
      const processedBatch = batch.map((disp) => ({
        id: disp.id,
        voluntarioId: disp.voluntarioId,
        diaSemana: disp.diaSemana as any, // Enum será validado pelo Prisma
        disponivel: disp.disponivel,
      }));

      // Usar upsert para evitar duplicatas baseado em voluntarioId + diaSemana
      for (const disponibilidade of processedBatch) {
        await prisma.disponibilidade.upsert({
          where: {
            voluntarioId_diaSemana: {
              voluntarioId: disponibilidade.voluntarioId,
              diaSemana: disponibilidade.diaSemana,
            },
          },
          update: {
            disponivel: disponibilidade.disponivel,
          },
          create: disponibilidade,
        });
      }

      importedCount += batch.length;
      console.log(
        `    📊 Processadas ${importedCount}/${disponibilidades.length} disponibilidades`
      );
    });

    console.log(
      `  ✅ ${disponibilidades.length} disponibilidades importadas com sucesso`
    );
  } catch (error) {
    console.error("❌ Erro ao importar disponibilidades:", error);
    throw error;
  }
}

/**
 * Importa escalas para o banco de dados
 */
async function importEscalas(
  prisma: PrismaClient,
  escalas: PrismaEscala[]
): Promise<void> {
  console.log("📅 Importando escalas...");

  try {
    const processedEscalas = escalas.map((escala) => ({
      id: escala.id,
      mes: escala.mes,
      ano: escala.ano,
      igrejaId: escala.igrejaId,
      cargoId: escala.cargoId,
      criadoEm: parseDate(escala.criadoEm) || new Date(),
    }));

    // Usar upsert para evitar duplicatas baseado na constraint única
    for (const escala of processedEscalas) {
      await prisma.escala.upsert({
        where: {
          mes_ano_igrejaId_cargoId: {
            mes: escala.mes,
            ano: escala.ano,
            igrejaId: escala.igrejaId,
            cargoId: escala.cargoId,
          },
        },
        update: escala,
        create: escala,
      });
    }

    console.log(
      `  ✅ ${processedEscalas.length} escalas importadas com sucesso`
    );
  } catch (error) {
    console.error("❌ Erro ao importar escalas:", error);
    throw error;
  }
}

/**
 * Importa dias de escala para o banco de dados
 */
async function importEscalaDias(
  prisma: PrismaClient,
  escalaDias: PrismaEscalaDia[]
): Promise<void> {
  console.log("📆 Importando dias de escala...");

  try {
    const BATCH_SIZE = 50;
    let importedCount = 0;

    await processBatch(escalaDias, BATCH_SIZE, async (batch) => {
      const processedBatch = batch.map((dia) => ({
        id: dia.id,
        escalaId: dia.escalaId,
        data: parseDate(dia.data) || new Date(),
        tipoCulto: dia.tipoCulto,
      }));

      // Usar upsert para evitar duplicatas
      for (const escalaDia of processedBatch) {
        await prisma.escalaDia.upsert({
          where: { id: escalaDia.id },
          update: escalaDia,
          create: escalaDia,
        });
      }

      importedCount += batch.length;
      console.log(
        `    📊 Processados ${importedCount}/${escalaDias.length} dias de escala`
      );
    });

    console.log(
      `  ✅ ${escalaDias.length} dias de escala importados com sucesso`
    );
  } catch (error) {
    console.error("❌ Erro ao importar dias de escala:", error);
    throw error;
  }
}

/**
 * Importa voluntários de escala para o banco de dados
 */
async function importEscalaVoluntarios(
  prisma: PrismaClient,
  escalaVoluntarios: PrismaEscalaVoluntario[]
): Promise<void> {
  console.log("🤝 Importando voluntários de escala...");

  try {
    const BATCH_SIZE = 100;
    let importedCount = 0;

    await processBatch(escalaVoluntarios, BATCH_SIZE, async (batch) => {
      const processedBatch = batch.map((escalaVol) => ({
        id: escalaVol.id,
        escalaDiaId: escalaVol.escalaDiaId,
        voluntarioId: escalaVol.voluntarioId,
      }));

      // Usar upsert para evitar duplicatas baseado na constraint única
      for (const escalaVoluntario of processedBatch) {
        await prisma.escalaVoluntario.upsert({
          where: {
            escalaDiaId_voluntarioId: {
              escalaDiaId: escalaVoluntario.escalaDiaId,
              voluntarioId: escalaVoluntario.voluntarioId,
            },
          },
          update: escalaVoluntario,
          create: escalaVoluntario,
        });
      }

      importedCount += batch.length;
      console.log(
        `    📊 Processados ${importedCount}/${escalaVoluntarios.length} voluntários de escala`
      );
    });

    console.log(
      `  ✅ ${escalaVoluntarios.length} voluntários de escala importados com sucesso`
    );
  } catch (error) {
    console.error("❌ Erro ao importar voluntários de escala:", error);
    throw error;
  }
}

// ===============================================
// FUNÇÃO PRINCIPAL
// ===============================================

/**
 * Função principal de importação
 */
async function main(): Promise<void> {
  const prisma = new PrismaClient();

  try {
    console.log("🚀 Iniciando importação de dados para NeonDB...");

    // Verificar se o arquivo de dados transformados existe
    const inputFile = path.join(process.cwd(), "transformed-data.json");
    if (!fs.existsSync(inputFile)) {
      console.error(
        `❌ Arquivo de dados transformados não encontrado: ${inputFile}`
      );
      console.log("📋 Execute primeiro: npm run migration:transform");
      process.exit(1);
    }

    // Carregar dados transformados
    console.log("📖 Carregando dados transformados...");
    const rawData = fs.readFileSync(inputFile, "utf8");
    const transformedData: TransformedData = JSON.parse(rawData);

    // Validar estrutura dos dados
    const requiredKeys = [
      "usuarios",
      "igrejas",
      "cargos",
      "voluntarios",
      "disponibilidades",
      "escalas",
      "escalaDias",
      "escalaVoluntarios",
    ];
    for (const key of requiredKeys) {
      if (!transformedData[key as keyof TransformedData]) {
        console.error(`❌ Dados obrigatórios não encontrados: ${key}`);
        process.exit(1);
      }
    }

    console.log("📊 Estatísticas dos dados a serem importados:");
    console.log(`  👤 Usuários: ${transformedData.usuarios.length}`);
    console.log(`  ⛪ Igrejas: ${transformedData.igrejas.length}`);
    console.log(`  💼 Cargos: ${transformedData.cargos.length}`);
    console.log(`  👥 Voluntários: ${transformedData.voluntarios.length}`);
    console.log(
      `  📋 Disponibilidades: ${transformedData.disponibilidades.length}`
    );
    console.log(`  📅 Escalas: ${transformedData.escalas.length}`);
    console.log(`  📆 Dias de Escala: ${transformedData.escalaDias.length}`);
    console.log(
      `  🤝 Voluntários de Escala: ${transformedData.escalaVoluntarios.length}`
    );

    // Testar conexão com o banco
    console.log("\n🔌 Testando conexão com o banco de dados...");
    await prisma.$connect();
    console.log("  ✅ Conexão estabelecida com sucesso");

    // Importar dados na ordem correta (respeitando dependências de FK)
    console.log("\n🔄 Iniciando importação sequencial...");

    const startTime = Date.now();

    // 1. Igrejas (sem dependências)
    await importIgrejas(prisma, transformedData.igrejas);

    // 2. Cargos (sem dependências)
    await importCargos(prisma, transformedData.cargos);

    // 3. Usuários (depende de igrejas)
    await importUsuarios(prisma, transformedData.usuarios);

    // 4. Voluntários (depende de igrejas e cargos)
    await importVoluntarios(prisma, transformedData.voluntarios);

    // 5. Disponibilidades (depende de voluntários)
    await importDisponibilidades(prisma, transformedData.disponibilidades);

    // 6. Escalas (depende de igrejas e cargos)
    await importEscalas(prisma, transformedData.escalas);

    // 7. Dias de Escala (depende de escalas)
    await importEscalaDias(prisma, transformedData.escalaDias);

    // 8. Voluntários de Escala (depende de dias de escala e voluntários)
    await importEscalaVoluntarios(prisma, transformedData.escalaVoluntarios);

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log("\n✅ Importação concluída com sucesso!");
    console.log(`⏱️  Tempo total de execução: ${duration} segundos`);

    // Verificar integridade dos dados importados
    console.log("\n🔍 Verificando integridade dos dados importados...");
    const counts = {
      usuarios: await prisma.usuario.count(),
      igrejas: await prisma.igreja.count(),
      cargos: await prisma.cargo.count(),
      voluntarios: await prisma.voluntario.count(),
      disponibilidades: await prisma.disponibilidade.count(),
      escalas: await prisma.escala.count(),
      escalaDias: await prisma.escalaDia.count(),
      escalaVoluntarios: await prisma.escalaVoluntario.count(),
    };

    console.log("📊 Registros no banco de dados:");
    Object.entries(counts).forEach(([key, count]) => {
      const icon =
        {
          usuarios: "👤",
          igrejas: "⛪",
          cargos: "💼",
          voluntarios: "👥",
          disponibilidades: "📋",
          escalas: "📅",
          escalaDias: "📆",
          escalaVoluntarios: "🤝",
        }[key] || "📄";

      console.log(`  ${icon} ${key}: ${count} registros`);
    });

    console.log("\n🎉 Migração de dados concluída com sucesso!");
    console.log(
      "🔗 Acesse o Prisma Studio para visualizar os dados: npx prisma studio"
    );
  } catch (error) {
    console.error("\n❌ Erro durante a importação:", error);

    if (error instanceof Error) {
      console.error("📝 Detalhes do erro:", error.message);
      console.error("🔍 Stack trace:", error.stack);
    }

    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log("🔌 Conexão com banco de dados encerrada");
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  main().catch((error) => {
    console.error("💥 Erro fatal:", error);
    process.exit(1);
  });
}

export { main as importDataToPrisma };
