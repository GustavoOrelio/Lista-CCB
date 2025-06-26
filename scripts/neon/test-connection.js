#!/usr/bin/env node

/**
 * Script de Teste de Conexão NeonDB
 *
 * Este script testa a conectividade com o banco de dados NeonDB
 * para diferentes ambientes (dev, staging, prod).
 *
 * Uso:
 *   node scripts/neon/test-connection.js [ambiente]
 *   node scripts/neon/test-connection.js dev
 *   node scripts/neon/test-connection.js staging
 *   node scripts/neon/test-connection.js prod
 */

const { Pool } = require("pg");
require("dotenv").config();

// Configurações por ambiente (apenas 2 branches para economia)
const environments = {
  dev: {
    name: "Development",
    emoji: "🟢",
    envVar: "DATABASE_URL_DEV",
    branch: "development",
  },
  prod: {
    name: "Production",
    emoji: "🔴",
    envVar: "DATABASE_URL_PROD",
    branch: "production",
  },
};

async function testConnection(env = "dev") {
  const envConfig = environments[env];

  if (!envConfig) {
    console.error("❌ Ambiente inválido. Use: dev ou prod");
    console.error("💡 Apenas 2 branches configuradas para economia de custos");
    process.exit(1);
  }

  console.log(
    `\n${envConfig.emoji} Testando conexão com NeonDB - ${envConfig.name}`
  );
  console.log("=".repeat(50));

  // Buscar connection string
  const connectionString =
    process.env[envConfig.envVar] || process.env.DATABASE_URL;

  if (!connectionString) {
    console.error(`❌ Connection string não encontrada!`);
    console.error(`   Variável esperada: ${envConfig.envVar} ou DATABASE_URL`);
    console.error(`   Verifique seu arquivo .env`);
    process.exit(1);
  }

  // Mascarar senha na exibição
  const maskedUrl = connectionString.replace(/:([^:@]+)@/, ":****@");
  console.log(`🔗 Connection String: ${maskedUrl}`);

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 1, // Apenas 1 conexão para teste
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  try {
    console.log("\n⏳ Estabelecendo conexão...");
    const client = await pool.connect();

    console.log("✅ Conexão estabelecida com sucesso!");

    // Informações básicas do banco
    console.log("\n📊 Informações do Banco de Dados:");
    const result = await client.query(`
      SELECT 
        NOW() as current_time,
        version() as pg_version,
        current_database() as database_name,
        current_user as current_user,
        inet_server_addr() as server_ip,
        inet_server_port() as server_port
    `);

    const info = result.rows[0];
    console.log(`   📅 Data/Hora atual: ${info.current_time}`);
    console.log(`   🐘 Versão PostgreSQL: ${info.pg_version.split(" ")[1]}`);
    console.log(`   🗄️  Nome do banco: ${info.database_name}`);
    console.log(`   👤 Usuário atual: ${info.current_user}`);
    console.log(`   🌐 IP do servidor: ${info.server_ip || "N/A"}`);
    console.log(`   🔌 Porta do servidor: ${info.server_port || "5432"}`);

    // Teste de performance básico
    console.log("\n⚡ Teste de Performance:");
    const startTime = Date.now();
    await client.query("SELECT 1 as test");
    const endTime = Date.now();
    console.log(`   ⏱️  Latência: ${endTime - startTime}ms`);

    // Verificar configurações SSL
    console.log("\n🔒 Configurações de Segurança:");
    const sslResult = await client.query(`
      SELECT 
        CASE WHEN ssl THEN 'Habilitado' ELSE 'Desabilitado' END as ssl_status
      FROM pg_stat_ssl 
      WHERE pid = pg_backend_pid()
    `);

    if (sslResult.rows.length > 0) {
      console.log(`   🔐 SSL: ${sslResult.rows[0].ssl_status}`);
    } else {
      console.log(`   🔐 SSL: Status não disponível`);
    }

    // Verificar permissões básicas
    console.log("\n🔑 Teste de Permissões:");
    try {
      await client.query(
        "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'"
      );
      console.log("   ✅ Permissão de leitura: OK");
    } catch (error) {
      console.log("   ❌ Permissão de leitura: ERRO");
    }

    client.release();
    console.log("\n🎉 Teste concluído com sucesso!");
  } catch (error) {
    console.error(`\n❌ Erro na conexão com NeonDB (${env}):`);
    console.error(`   Mensagem: ${error.message}`);
    console.error(`   Código: ${error.code || "N/A"}`);

    // Sugestões de solução baseadas no erro
    if (error.code === "ENOTFOUND") {
      console.error("\n💡 Possíveis soluções:");
      console.error("   - Verifique se o hostname está correto");
      console.error("   - Confirme sua conexão com a internet");
      console.error("   - Verifique se o projeto NeonDB existe");
    } else if (error.code === "ECONNREFUSED") {
      console.error("\n💡 Possíveis soluções:");
      console.error("   - Verifique se a porta está correta (5432)");
      console.error("   - Confirme se o banco não está em auto-suspend");
    } else if (error.message.includes("password")) {
      console.error("\n💡 Possíveis soluções:");
      console.error("   - Verifique usuário e senha");
      console.error("   - Confirme se o usuário tem permissões");
    } else if (error.message.includes("database")) {
      console.error("\n💡 Possíveis soluções:");
      console.error("   - Verifique se o nome do banco está correto");
      console.error("   - Confirme se o banco foi criado");
    }

    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Função para testar todos os ambientes
async function testAllEnvironments() {
  console.log("🚀 Testando todos os ambientes NeonDB...\n");

  for (const [env, config] of Object.entries(environments)) {
    try {
      await testConnection(env);
      console.log("\n" + "─".repeat(60) + "\n");
    } catch (error) {
      console.log("\n" + "─".repeat(60) + "\n");
      continue;
    }
  }

  console.log("✅ Teste de todos os ambientes concluído!");
}

// Executar script
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === "--all" || command === "-a") {
    await testAllEnvironments();
  } else {
    const env = command || "dev";
    await testConnection(env);
  }
}

// Tratamento de erros não capturados
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Erro não tratado:", reason);
  process.exit(1);
});

process.on("SIGINT", () => {
  console.log("\n\n👋 Teste interrompido pelo usuário");
  process.exit(0);
});

// Executar
if (require.main === module) {
  main().catch((error) => {
    console.error("❌ Erro fatal:", error);
    process.exit(1);
  });
}

module.exports = { testConnection, testAllEnvironments };
