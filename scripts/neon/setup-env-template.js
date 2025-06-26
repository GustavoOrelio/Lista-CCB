#!/usr/bin/env node

/**
 * Script para Gerar Templates de Variáveis de Ambiente
 *
 * Este script cria arquivos .env template para configuração do NeonDB
 * em diferentes ambientes.
 *
 * Uso:
 *   node scripts/neon/setup-env-template.js
 */

const fs = require("fs");
const path = require("path");

// Templates de configuração por ambiente
const envTemplates = {
  ".env.local": {
    description: "Configuração de Desenvolvimento Local",
    emoji: "🟢",
    content: `# ===============================================
# 🟢 NEONDB CONFIGURATION - DEVELOPMENT
# ===============================================
# ⚠️  NUNCA commite este arquivo no Git!
# ⚠️  Use apenas para desenvolvimento local

# NeonDB Connection Strings
DATABASE_URL="postgresql://app_user_dev:SENHA_DEV@ep-XXXXXXX.us-east-1.aws.neon.tech/lista_porteiros_dev?sslmode=require"
DATABASE_URL_POOLED="postgresql://app_user_dev:SENHA_DEV@ep-XXXXXXX-pooler.us-east-1.aws.neon.tech/lista_porteiros_dev?sslmode=require"

# Environment Configuration
NODE_ENV="development"
NEXT_PUBLIC_ENV="development"

# Database Configuration (componentes separados)
DB_HOST="ep-XXXXXXX.us-east-1.aws.neon.tech"
DB_NAME="lista_porteiros_dev"
DB_USER="app_user_dev"
DB_PASSWORD="SENHA_DEV"
DB_PORT="5432"
DB_SSL_MODE="require"

# Connection Pool Settings
DB_POOL_MIN=2
DB_POOL_MAX=10
DB_POOL_IDLE_TIMEOUT=30000
DB_POOL_CONNECTION_TIMEOUT=10000

# Application Settings
APP_DEBUG=true
LOG_LEVEL="debug"

# ===============================================
# 📝 INSTRUÇÕES DE CONFIGURAÇÃO:
# ===============================================
# 1. Substitua XXXXXXX pelo identificador real do seu projeto Neon
# 2. Substitua SENHA_DEV pela senha real do usuário de desenvolvimento
# 3. Verifique se o nome do banco está correto
# 4. Teste a conexão com: npm run test:db
# ===============================================`,
  },

  ".env.staging": {
    description: "Configuração de Staging",
    emoji: "🟡",
    content: `# ===============================================
# 🟡 NEONDB CONFIGURATION - STAGING
# ===============================================
# ⚠️  NUNCA commite este arquivo no Git!
# ⚠️  Use variáveis de ambiente do servidor de staging

# NeonDB Connection Strings
DATABASE_URL="postgresql://app_user_staging:SENHA_STAGING@ep-XXXXXXX.us-east-1.aws.neon.tech/lista_porteiros_staging?sslmode=require"
DATABASE_URL_POOLED="postgresql://app_user_staging:SENHA_STAGING@ep-XXXXXXX-pooler.us-east-1.aws.neon.tech/lista_porteiros_staging?sslmode=require"

# Environment Configuration
NODE_ENV="production"
NEXT_PUBLIC_ENV="staging"

# Database Configuration (componentes separados)
DB_HOST="ep-XXXXXXX.us-east-1.aws.neon.tech"
DB_NAME="lista_porteiros_staging"
DB_USER="app_user_staging"
DB_PASSWORD="SENHA_STAGING"
DB_PORT="5432"
DB_SSL_MODE="require"

# Connection Pool Settings
DB_POOL_MIN=5
DB_POOL_MAX=25
DB_POOL_IDLE_TIMEOUT=30000
DB_POOL_CONNECTION_TIMEOUT=10000

# Application Settings
APP_DEBUG=false
LOG_LEVEL="info"

# Security Settings
ENABLE_QUERY_LOGGING=true
ENABLE_PERFORMANCE_MONITORING=true

# ===============================================
# 📝 INSTRUÇÕES DE CONFIGURAÇÃO:
# ===============================================
# 1. Configure estas variáveis no seu provedor de hospedagem
# 2. Use secrets/environment variables, não arquivos .env
# 3. Substitua XXXXXXX pelo identificador real do projeto
# 4. Use senhas fortes e únicas para staging
# ===============================================`,
  },

  ".env.production": {
    description: "Configuração de Produção",
    emoji: "🔴",
    content: `# ===============================================
# 🔴 NEONDB CONFIGURATION - PRODUCTION
# ===============================================
# ⚠️  NUNCA commite este arquivo no Git!
# ⚠️  Use APENAS secrets managers em produção!

# NeonDB Connection Strings
DATABASE_URL="postgresql://app_user_prod:SENHA_SUPER_SEGURA@ep-XXXXXXX.us-east-1.aws.neon.tech/lista_porteiros_prod?sslmode=require"
DATABASE_URL_POOLED="postgresql://app_user_prod:SENHA_SUPER_SEGURA@ep-XXXXXXX-pooler.us-east-1.aws.neon.tech/lista_porteiros_prod?sslmode=require"

# Environment Configuration
NODE_ENV="production"
NEXT_PUBLIC_ENV="production"

# Database Configuration (componentes separados)
DB_HOST="ep-XXXXXXX.us-east-1.aws.neon.tech"
DB_NAME="lista_porteiros_prod"
DB_USER="app_user_prod"
DB_PASSWORD="SENHA_SUPER_SEGURA"
DB_PORT="5432"
DB_SSL_MODE="require"

# Connection Pool Settings (otimizado para produção)
DB_POOL_MIN=10
DB_POOL_MAX=50
DB_POOL_IDLE_TIMEOUT=60000
DB_POOL_CONNECTION_TIMEOUT=15000

# Application Settings
APP_DEBUG=false
LOG_LEVEL="warn"

# Security Settings
ENABLE_QUERY_LOGGING=true
ENABLE_PERFORMANCE_MONITORING=true
ENABLE_AUDIT_LOGGING=true

# Monitoring & Alerts
ENABLE_HEALTH_CHECKS=true
HEALTH_CHECK_INTERVAL=30000

# ===============================================
# 🚨 CONFIGURAÇÃO DE PRODUÇÃO - IMPORTANTE!
# ===============================================
# 1. Use AWS Secrets Manager, Azure Key Vault ou similar
# 2. Configure rotação automática de senhas
# 3. Monitore logs de acesso e performance
# 4. Configure alertas para falhas de conexão
# 5. Implemente circuit breakers para resiliência
# ===============================================`,
  },

  ".env.example": {
    description: "Exemplo de Configuração (pode ser commitado)",
    emoji: "📝",
    content: `# ===============================================
# 📝 EXEMPLO DE CONFIGURAÇÃO NEONDB
# ===============================================
# Este arquivo pode ser commitado no Git como exemplo
# Copie para .env.local e configure com valores reais

# NeonDB Connection Strings (EXEMPLO - substitua pelos valores reais)
DATABASE_URL="postgresql://usuario:senha@ep-exemplo-123456.us-east-1.aws.neon.tech/nome_banco?sslmode=require"
DATABASE_URL_POOLED="postgresql://usuario:senha@ep-exemplo-123456-pooler.us-east-1.aws.neon.tech/nome_banco?sslmode=require"

# Environment Configuration
NODE_ENV="development"
NEXT_PUBLIC_ENV="development"

# Database Configuration
DB_HOST="ep-exemplo-123456.us-east-1.aws.neon.tech"
DB_NAME="nome_do_banco"
DB_USER="nome_usuario"
DB_PASSWORD="senha_segura"
DB_PORT="5432"
DB_SSL_MODE="require"

# Connection Pool Settings
DB_POOL_MIN=2
DB_POOL_MAX=10
DB_POOL_IDLE_TIMEOUT=30000
DB_POOL_CONNECTION_TIMEOUT=10000

# Application Settings
APP_DEBUG=true
LOG_LEVEL="debug"

# ===============================================
# 🔧 COMO CONFIGURAR:
# ===============================================
# 1. Copie este arquivo para .env.local
# 2. Substitua os valores de exemplo pelos reais
# 3. Nunca commite arquivos .env com dados reais
# 4. Use diferentes arquivos para cada ambiente
# ===============================================`,
  },
};

function createEnvFiles() {
  console.log("🚀 Gerando templates de configuração NeonDB...\n");

  const projectRoot = process.cwd();
  let filesCreated = 0;
  let filesSkipped = 0;

  for (const [filename, config] of Object.entries(envTemplates)) {
    const filePath = path.join(projectRoot, filename);

    console.log(`${config.emoji} Criando: ${filename}`);
    console.log(`   Descrição: ${config.description}`);

    // Verificar se arquivo já existe
    if (fs.existsSync(filePath)) {
      console.log(`   ⚠️  Arquivo já existe - pulando...`);
      filesSkipped++;
    } else {
      try {
        fs.writeFileSync(filePath, config.content, "utf8");
        console.log(`   ✅ Criado com sucesso!`);
        filesCreated++;
      } catch (error) {
        console.error(`   ❌ Erro ao criar arquivo: ${error.message}`);
      }
    }

    console.log(""); // Linha em branco
  }

  // Resumo
  console.log("📊 Resumo da Operação:");
  console.log(`   ✅ Arquivos criados: ${filesCreated}`);
  console.log(`   ⚠️  Arquivos pulados: ${filesSkipped}`);
  console.log(`   📁 Total de templates: ${Object.keys(envTemplates).length}`);

  // Instruções finais
  console.log("\n🔧 Próximos Passos:");
  console.log("1. Configure seu projeto NeonDB no console.neon.tech");
  console.log("2. Copie .env.example para .env.local");
  console.log("3. Substitua os valores de exemplo pelos reais");
  console.log("4. Teste a conexão: node scripts/neon/test-connection.js");
  console.log("5. Nunca commite arquivos .env com dados reais!");

  // Avisos de segurança
  console.log("\n🚨 Avisos de Segurança:");
  console.log("• Adicione .env.* ao .gitignore (exceto .env.example)");
  console.log("• Use senhas fortes e únicas para cada ambiente");
  console.log("• Configure secrets managers para produção");
  console.log("• Rotacione senhas regularmente");
}

function updateGitignore() {
  const gitignorePath = path.join(process.cwd(), ".gitignore");

  const envPatterns = [
    "# Environment variables",
    ".env",
    ".env.local",
    ".env.development",
    ".env.staging",
    ".env.production",
    "!.env.example",
    "",
  ];

  try {
    let gitignoreContent = "";

    if (fs.existsSync(gitignorePath)) {
      gitignoreContent = fs.readFileSync(gitignorePath, "utf8");
    }

    // Verificar se já contém as regras
    if (!gitignoreContent.includes(".env.local")) {
      gitignoreContent += "\n" + envPatterns.join("\n");
      fs.writeFileSync(gitignorePath, gitignoreContent, "utf8");
      console.log("\n✅ .gitignore atualizado com regras de .env");
    } else {
      console.log("\n✅ .gitignore já contém regras de .env");
    }
  } catch (error) {
    console.error("\n❌ Erro ao atualizar .gitignore:", error.message);
  }
}

function createPackageScripts() {
  const packagePath = path.join(process.cwd(), "package.json");

  try {
    if (fs.existsSync(packagePath)) {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));

      // Scripts recomendados
      const recommendedScripts = {
        "db:test": "node scripts/neon/test-connection.js",
        "db:test:all": "node scripts/neon/test-connection.js --all",
        "db:test:dev": "node scripts/neon/test-connection.js dev",
        "db:test:staging": "node scripts/neon/test-connection.js staging",
        "db:test:prod": "node scripts/neon/test-connection.js prod",
      };

      let scriptsAdded = 0;
      packageJson.scripts = packageJson.scripts || {};

      for (const [scriptName, scriptCommand] of Object.entries(
        recommendedScripts
      )) {
        if (!packageJson.scripts[scriptName]) {
          packageJson.scripts[scriptName] = scriptCommand;
          scriptsAdded++;
        }
      }

      if (scriptsAdded > 0) {
        fs.writeFileSync(
          packagePath,
          JSON.stringify(packageJson, null, 2),
          "utf8"
        );
        console.log(`\n✅ Adicionados ${scriptsAdded} scripts ao package.json`);
        console.log("   Novos comandos disponíveis:");
        for (const scriptName of Object.keys(recommendedScripts)) {
          if (
            packageJson.scripts[scriptName] === recommendedScripts[scriptName]
          ) {
            console.log(`   • npm run ${scriptName}`);
          }
        }
      } else {
        console.log("\n✅ Scripts já existem no package.json");
      }
    }
  } catch (error) {
    console.error("\n❌ Erro ao atualizar package.json:", error.message);
  }
}

// Executar script principal
function main() {
  console.log("🐘 Setup de Templates NeonDB - Lista de Porteiros\n");

  createEnvFiles();
  updateGitignore();
  createPackageScripts();

  console.log("\n🎉 Setup concluído com sucesso!");
  console.log(
    "\n📚 Consulte a documentação em: docs/markdown/NEONDB_SETUP_GUIDE.md"
  );
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = {
  createEnvFiles,
  updateGitignore,
  createPackageScripts,
  envTemplates,
};
