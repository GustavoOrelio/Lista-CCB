#!/usr/bin/env node

/**
 * Script de Teste do Prisma
 * Testa a conexão com NeonDB usando Prisma Client
 */

require("dotenv").config();
const { PrismaClient } = require("@prisma/client");

async function testPrismaConnection() {
  console.log("🔍 Testando Conexão Prisma com NeonDB...\n");

  const prisma = new PrismaClient({
    log: ["query", "info", "warn", "error"],
  });

  try {
    console.log("⏳ Conectando ao banco...");

    // Teste de conexão básica
    await prisma.$connect();
    console.log("✅ Conexão estabelecida com sucesso!");

    // Teste de query simples
    console.log("\n⏳ Executando query de teste...");
    const result = await prisma.$queryRaw`SELECT version()`;
    console.log("✅ Query executada:", result[0].version);

    // Verificar se as tabelas existem (se já foram criadas)
    console.log("\n⏳ Verificando estrutura do banco...");
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;

    if (tables.length > 0) {
      console.log("✅ Tabelas encontradas:");
      tables.forEach((table) => {
        console.log(`   • ${table.table_name}`);
      });
    } else {
      console.log("⚠️  Nenhuma tabela encontrada. Execute: npx prisma db push");
    }

    // Teste de modelos (se tabelas existirem)
    if (tables.length > 0) {
      console.log("\n⏳ Testando modelos Prisma...");

      try {
        const usuarioCount = await prisma.usuario.count();
        const igrejaCount = await prisma.igreja.count();
        const cargoCount = await prisma.cargo.count();
        const voluntarioCount = await prisma.voluntario.count();

        console.log("✅ Contagem de registros:");
        console.log(`   • Usuários: ${usuarioCount}`);
        console.log(`   • Igrejas: ${igrejaCount}`);
        console.log(`   • Cargos: ${cargoCount}`);
        console.log(`   • Voluntários: ${voluntarioCount}`);
      } catch (modelError) {
        console.log("⚠️  Erro ao acessar modelos:", modelError.message);
        console.log("💡 Execute: npx prisma db push para criar as tabelas");
      }
    }
  } catch (error) {
    console.error("❌ Erro na conexão:", error.message);

    if (error.message.includes("ENOTFOUND")) {
      console.log("\n💡 Dicas para resolver:");
      console.log(
        "1. Verifique se DATABASE_URL está configurada no .env.local"
      );
      console.log("2. Confirme se o endpoint do NeonDB está correto");
      console.log("3. Verifique se o projeto NeonDB está ativo");
    } else if (error.message.includes("authentication")) {
      console.log("\n💡 Erro de autenticação:");
      console.log("1. Verifique usuário e senha na DATABASE_URL");
      console.log("2. Confirme se o usuário tem permissões no banco");
    }
  } finally {
    await prisma.$disconnect();
    console.log("\n🔌 Conexão encerrada.");
  }
}

async function showEnvironmentInfo() {
  console.log("🔧 Informações do Ambiente:");
  console.log(`   • NODE_ENV: ${process.env.NODE_ENV || "undefined"}`);
  console.log(
    `   • DATABASE_URL: ${
      process.env.DATABASE_URL ? "✅ Configurada" : "❌ Não configurada"
    }`
  );

  if (process.env.DATABASE_URL) {
    const url = process.env.DATABASE_URL;
    const host = url.match(/@([^/]+)/)?.[1] || "não encontrado";
    const dbName = url.match(/\/([^?]+)/)?.[1] || "não encontrado";
    console.log(`   • Host: ${host}`);
    console.log(`   • Database: ${dbName}`);
  }
  console.log("");
}

async function main() {
  console.log("🐘 Teste de Conexão Prisma + NeonDB\n");

  await showEnvironmentInfo();
  await testPrismaConnection();

  console.log("\n🎉 Teste concluído!");
  console.log("📚 Próximos passos:");
  console.log("1. Se não há tabelas: npx prisma db push");
  console.log("2. Para popular dados: criar seeds");
  console.log("3. Para ver no Studio: npx prisma studio");
}

if (require.main === module) {
  main().catch(console.error);
}
