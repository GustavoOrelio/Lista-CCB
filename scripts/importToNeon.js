#!/usr/bin/env node

/**
 * Script de Importação Firebase → NeonDB PostgreSQL
 * Importa os dados exportados do Firebase para o PostgreSQL usando Prisma
 */

require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

// Mapeamento de IDs Firebase → PostgreSQL
const idMappings = {
  usuarios: new Map(),
  igrejas: new Map(),
  cargos: new Map(),
  voluntarios: new Map(),
  escalas: new Map(),
  escalaDias: new Map(),
};

// Função para encontrar o arquivo de export mais recente
function findLatestExportFile() {
  const backupDir = path.join(process.cwd(), "backups");

  if (!fs.existsSync(backupDir)) {
    throw new Error(
      "❌ Diretório de backup não encontrado. Execute primeiro: npm run firebase:export"
    );
  }

  // Procurar pelo arquivo mais recente
  const latestFile = path.join(backupDir, "firebase-export-latest.json");
  if (fs.existsSync(latestFile)) {
    return latestFile;
  }

  // Caso contrário, procurar pelos arquivos com timestamp
  const files = fs
    .readdirSync(backupDir)
    .filter(
      (file) =>
        file.startsWith("firebase-export-") &&
        file.endsWith(".json") &&
        !file.includes("mock")
    )
    .sort()
    .reverse();

  if (files.length === 0) {
    throw new Error(
      "❌ Nenhum arquivo de export encontrado. Execute: npm run firebase:export"
    );
  }

  return path.join(backupDir, files[0]);
}

// Função para converter datas válidas
function parseDate(dateString) {
  if (!dateString) return new Date();

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    console.log(
      `   ⚠️  Data inválida encontrada: ${dateString}, usando data atual`
    );
    return new Date();
  }

  return date;
}

// Função para carregar dados do arquivo JSON
function loadExportData(filePath) {
  console.log(`📁 Carregando dados de: ${path.basename(filePath)}`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`❌ Arquivo não encontrado: ${filePath}`);
  }

  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

  console.log("📊 Dados carregados:");
  Object.entries(data).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      console.log(`   • ${key}: ${value.length} registros`);
    }
  });

  return data;
}

// Função para limpar banco (opcional)
async function clearDatabase() {
  console.log("\n🧹 Limpando banco de dados...");

  try {
    // Ordem inversa devido às foreign keys
    await prisma.escalaVoluntario.deleteMany();
    await prisma.escalaDia.deleteMany();
    await prisma.escala.deleteMany();
    await prisma.disponibilidade.deleteMany();
    await prisma.voluntario.deleteMany();
    await prisma.cargo.deleteMany();
    await prisma.usuario.deleteMany();
    await prisma.igreja.deleteMany();

    console.log("✅ Banco limpo com sucesso");
  } catch (error) {
    console.error("❌ Erro ao limpar banco:", error.message);
    throw error;
  }
}

// Importar igrejas
async function importIgrejas(igrejas) {
  console.log("\n⛪ Importando igrejas...");

  for (const igreja of igrejas) {
    try {
      const created = await prisma.igreja.create({
        data: {
          nome: igreja.nome,
          cultoDomingoRDJ: igreja.cultoDomingoRDJ || false,
          cultoDomingo: igreja.cultoDomingo || false,
          cultoSegunda: igreja.cultoSegunda || false,
          cultoTerca: igreja.cultoTerca || false,
          cultoQuarta: igreja.cultoQuarta || false,
          cultoQuinta: igreja.cultoQuinta || false,
          cultoSexta: igreja.cultoSexta || false,
          cultoSabado: igreja.cultoSabado || false,
          criadoEm: parseDate(igreja.criadoEm),
        },
      });

      idMappings.igrejas.set(igreja.id, created.id);
      console.log(`   ✅ ${igreja.nome} → ${created.id}`);
    } catch (error) {
      console.error(
        `   ❌ Erro ao importar igreja ${igreja.nome}:`,
        error.message
      );
    }
  }

  console.log(
    `📊 Igrejas importadas: ${idMappings.igrejas.size}/${igrejas.length}`
  );
}

// Importar cargos
async function importCargos(cargos) {
  console.log("\n👔 Importando cargos...");

  for (const cargo of cargos) {
    try {
      const created = await prisma.cargo.create({
        data: {
          nome: cargo.nome,
          descricao: cargo.descricao || null,
          criadoEm: parseDate(cargo.criadoEm),
        },
      });

      idMappings.cargos.set(cargo.id, created.id);
      console.log(`   ✅ ${cargo.nome} → ${created.id}`);
    } catch (error) {
      console.error(
        `   ❌ Erro ao importar cargo ${cargo.nome}:`,
        error.message
      );
    }
  }

  console.log(
    `📊 Cargos importados: ${idMappings.cargos.size}/${cargos.length}`
  );
}

// Importar usuários
async function importUsuarios(usuarios) {
  console.log("\n👤 Importando usuários...");

  for (const usuario of usuarios) {
    try {
      const igrejaId = usuario.igrejaId
        ? idMappings.igrejas.get(usuario.igrejaId)
        : null;

      const created = await prisma.usuario.create({
        data: {
          uid: usuario.uid,
          email: usuario.email,
          nome: usuario.nome,
          igrejaId: igrejaId,
          cargo: usuario.cargo || null,
          isAdmin: usuario.isAdmin || false,
          criadoEm: parseDate(usuario.criadoEm),
        },
      });

      idMappings.usuarios.set(usuario.id, created.id);
      console.log(`   ✅ ${usuario.nome} → ${created.id}`);
    } catch (error) {
      console.error(
        `   ❌ Erro ao importar usuário ${usuario.nome}:`,
        error.message
      );
    }
  }

  console.log(
    `📊 Usuários importados: ${idMappings.usuarios.size}/${usuarios.length}`
  );
}

// Importar voluntários
async function importVoluntarios(voluntarios) {
  console.log("\n🙋 Importando voluntários...");

  for (const voluntario of voluntarios) {
    try {
      const igrejaId = idMappings.igrejas.get(voluntario.igrejaId);
      const cargoId = idMappings.cargos.get(voluntario.cargoId);

      if (!igrejaId || !cargoId) {
        console.error(
          `   ⚠️  Voluntário ${voluntario.nome}: Igreja ou cargo não encontrado`
        );
        continue;
      }

      const created = await prisma.voluntario.create({
        data: {
          nome: voluntario.nome,
          telefone: voluntario.telefone,
          igrejaId: igrejaId,
          cargoId: cargoId,
          diasTrabalhados: voluntario.diasTrabalhados || 0,
          ultimaEscala: voluntario.ultimaEscala
            ? parseDate(voluntario.ultimaEscala)
            : null,
          criadoEm: parseDate(voluntario.criadoEm),
        },
      });

      idMappings.voluntarios.set(voluntario.id, created.id);
      console.log(`   ✅ ${voluntario.nome} → ${created.id}`);
    } catch (error) {
      console.error(
        `   ❌ Erro ao importar voluntário ${voluntario.nome}:`,
        error.message
      );
    }
  }

  console.log(
    `📊 Voluntários importados: ${idMappings.voluntarios.size}/${voluntarios.length}`
  );
}

// Importar escalas
async function importEscalas(escalas) {
  console.log("\n📅 Importando escalas...");

  for (const escala of escalas) {
    try {
      const igrejaId = idMappings.igrejas.get(escala.igrejaId);
      const cargoId = idMappings.cargos.get(escala.cargoId);

      if (!igrejaId || !cargoId) {
        console.error(
          `   ⚠️  Escala ${escala.mes}/${escala.ano}: Igreja ou cargo não encontrado`
        );
        continue;
      }

      const created = await prisma.escala.create({
        data: {
          mes: escala.mes,
          ano: escala.ano,
          igrejaId: igrejaId,
          cargoId: cargoId,
          criadoEm: parseDate(escala.criadoEm),
        },
      });

      idMappings.escalas.set(escala.id, created.id);
      console.log(`   ✅ Escala ${escala.mes}/${escala.ano} → ${created.id}`);
    } catch (error) {
      console.error(
        `   ❌ Erro ao importar escala ${escala.mes}/${escala.ano}:`,
        error.message
      );
    }
  }

  console.log(
    `📊 Escalas importadas: ${idMappings.escalas.size}/${escalas.length}`
  );
}

// Função para mapear dias da semana do Firebase para o enum do Prisma
function mapDiaSemana(diaSemana) {
  const mapping = {
    domingoRDJ: "DOMINGO_RDJ",
    domingo: "DOMINGO",
    segunda: "SEGUNDA",
    terca: "TERCA",
    quarta: "QUARTA",
    quinta: "QUINTA",
    sexta: "SEXTA",
    sabado: "SABADO",
  };

  return mapping[diaSemana] || diaSemana;
}

// Importar disponibilidades (se existirem no export)
async function importDisponibilidades(voluntarios) {
  console.log("\n📋 Importando disponibilidades...");

  let totalImportadas = 0;

  for (const voluntario of voluntarios) {
    if (voluntario.disponibilidade) {
      const voluntarioId = idMappings.voluntarios.get(voluntario.id);

      if (!voluntarioId) {
        console.error(
          `   ⚠️  Voluntário não encontrado para disponibilidades: ${voluntario.nome}`
        );
        continue;
      }

      // Disponibilidade pode estar como objeto ou array
      const disponibilidades = Array.isArray(voluntario.disponibilidade)
        ? voluntario.disponibilidade
        : Object.entries(voluntario.disponibilidade || {});

      for (const [diaSemana, disponivel] of disponibilidades) {
        try {
          await prisma.disponibilidade.create({
            data: {
              voluntarioId: voluntarioId,
              diaSemana: mapDiaSemana(diaSemana),
              disponivel: Boolean(disponivel),
            },
          });

          totalImportadas++;
        } catch (error) {
          console.error(
            `   ❌ Erro ao importar disponibilidade:`,
            error.message
          );
        }
      }
    }
  }

  console.log(`📊 Disponibilidades importadas: ${totalImportadas}`);
}

// Função principal de importação
async function importData(filePath, options = {}) {
  const { clearFirst = false } = options;

  try {
    console.log("🚀 Iniciando importação Firebase → NeonDB PostgreSQL\n");

    // Testar conexão
    await prisma.$connect();
    console.log("✅ Conexão com PostgreSQL estabelecida");

    // Carregar dados
    const data = loadExportData(filePath);

    // Limpar banco se solicitado
    if (clearFirst) {
      await clearDatabase();
    }

    // Importar em ordem (devido às foreign keys)
    await importIgrejas(data.igrejas || []);
    await importCargos(data.cargos || []);
    await importUsuarios(data.usuarios || []);
    await importVoluntarios(data.voluntarios || []);
    await importEscalas(data.escalas || []);
    await importDisponibilidades(data.voluntarios || []);

    // Estatísticas finais
    console.log("\n📊 RESUMO DA IMPORTAÇÃO:");
    console.log("═".repeat(50));

    const stats = await Promise.all([
      prisma.igreja.count(),
      prisma.cargo.count(),
      prisma.usuario.count(),
      prisma.voluntario.count(),
      prisma.escala.count(),
      prisma.disponibilidade.count(),
    ]);

    console.log(`📋 Igrejas:          ${stats[0]}`);
    console.log(`📋 Cargos:           ${stats[1]}`);
    console.log(`📋 Usuários:         ${stats[2]}`);
    console.log(`📋 Voluntários:      ${stats[3]}`);
    console.log(`📋 Escalas:          ${stats[4]}`);
    console.log(`📋 Disponibilidades: ${stats[5]}`);
    console.log("─".repeat(50));
    console.log(
      `📈 Total:            ${stats.reduce((a, b) => a + b, 0)} registros`
    );

    console.log("\n🎉 Importação concluída com sucesso!");
    console.log("💡 Execute: npm run prisma:studio para visualizar os dados");
  } catch (error) {
    console.error("\n❌ Erro durante a importação:", error.message);
    if (error.stack) {
      console.error("Stack trace:", error.stack);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Função principal
async function main() {
  const args = process.argv.slice(2);
  const clearFirst = args.includes("--clear") || args.includes("-c");
  const filePath =
    args.find((arg) => !arg.startsWith("-")) || findLatestExportFile();

  console.log("🔄 MIGRAÇÃO FIREBASE → NEONDB POSTGRESQL\n");

  if (clearFirst) {
    console.log("⚠️  Modo: Limpar banco antes de importar");
  }

  await importData(filePath, { clearFirst });
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { importData, idMappings };
