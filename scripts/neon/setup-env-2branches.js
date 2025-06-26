#!/usr/bin/env node

/**
 * Script para Configuração de 2 Branches - Economia de Custos
 *
 * Este script configura apenas 2 ambientes (production e development)
 * para manter o projeto no plano gratuito do NeonDB.
 *
 * Uso:
 *   node scripts/neon/setup-env-2branches.js
 */

const fs = require("fs");
const path = require("path");

// Templates otimizados para 2 branches apenas
const envTemplates = {
  ".env.local": {
    description: "Desenvolvimento Local (Branch: development)",
    emoji: "🟢",
    content: `# ===============================================
# 🟢 NEONDB - DEVELOPMENT BRANCH (CUSTO ZERO)
# ===============================================
# ⚠️  NUNCA commite este arquivo no Git!
# 💰 Configuração otimizada para plano gratuito

# NeonDB Connection Strings - Development Branch
DATABASE_URL="postgresql://username:password@ep-seu-projeto-123456.us-east-1.aws.neon.tech/neondb?sslmode=require"
DATABASE_URL_POOLED="postgresql://username:password@ep-seu-projeto-123456-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Environment Configuration
NODE_ENV="development"
NEXT_PUBLIC_ENV="development"

# Database Configuration
DB_HOST="ep-seu-projeto-123456.us-east-1.aws.neon.tech"
DB_NAME="neondb"
DB_USER="username"
DB_PASSWORD="password"
DB_PORT="5432"
DB_SSL_MODE="require"
DB_BRANCH="development"

# Connection Pool Settings (otimizado para desenvolvimento)
DB_POOL_MIN=1
DB_POOL_MAX=5
DB_POOL_IDLE_TIMEOUT=30000
DB_POOL_CONNECTION_TIMEOUT=10000

# Application Settings
APP_DEBUG=true
LOG_LEVEL="debug"

# Economia de Custos
AUTO_SUSPEND="1 minute"
COMPUTE_SIZE="0.25 vCPU"

# ===============================================
# 💰 CONFIGURAÇÃO DE ECONOMIA:
# ===============================================
# ✅ Auto-suspend: 1 minuto (máxima economia)
# ✅ Compute: 0.25 vCPU (mínimo possível)
# ✅ Branch: development (dados isolados)
# ✅ Pool mínimo: 1 conexão apenas
# ===============================================`,
  },

  ".env.production": {
    description: "Produção (Branch: production)",
    emoji: "🔴",
    content: `# ===============================================
# 🔴 NEONDB - PRODUCTION BRANCH (CUSTO MÍNIMO)
# ===============================================
# ⚠️  NUNCA commite este arquivo no Git!
# 🚨 Use secrets managers em produção!

# NeonDB Connection Strings - Production Branch
DATABASE_URL="postgresql://username:password@ep-seu-projeto.us-east-1.aws.neon.tech/neondb?sslmode=require"
DATABASE_URL_POOLED="postgresql://username:password@ep-seu-projeto-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Environment Configuration
NODE_ENV="production"
NEXT_PUBLIC_ENV="production"

# Database Configuration
DB_HOST="ep-seu-projeto.us-east-1.aws.neon.tech"
DB_NAME="neondb"
DB_USER="username"
DB_PASSWORD="password_super_segura"
DB_PORT="5432"
DB_SSL_MODE="require"
DB_BRANCH="production"

# Connection Pool Settings (otimizado para produção leve)
DB_POOL_MIN=2
DB_POOL_MAX=10
DB_POOL_IDLE_TIMEOUT=60000
DB_POOL_CONNECTION_TIMEOUT=15000

# Application Settings
APP_DEBUG=false
LOG_LEVEL="warn"

# Security Settings
ENABLE_QUERY_LOGGING=true
ENABLE_PERFORMANCE_MONITORING=true

# Economia de Custos
AUTO_SUSPEND="5 minutes"
COMPUTE_SIZE="0.25 vCPU"

# ===============================================
# 💰 CONFIGURAÇÃO DE ECONOMIA:
# ===============================================
# ✅ Auto-suspend: 5 minutos (balance economia/disponibilidade)
# ✅ Compute: 0.25 vCPU (mínimo possível)
# ✅ Branch: production (branch principal)
# ✅ Pool otimizado: mínimo necessário
# ===============================================`,
  },

  ".env.example": {
    description: "Exemplo para 2 Branches (pode ser commitado)",
    emoji: "📝",
    content: `# ===============================================
# 📝 EXEMPLO - CONFIGURAÇÃO 2 BRANCHES NEONDB
# ===============================================
# Configuração otimizada para CUSTO ZERO/MÍNIMO
# Copie para .env.local e configure com valores reais

# ===============================================
# 🟢 DEVELOPMENT BRANCH
# ===============================================
# DATABASE_URL="postgresql://usuario:senha@ep-projeto-123456.us-east-1.aws.neon.tech/neondb?sslmode=require"

# ===============================================  
# 🔴 PRODUCTION BRANCH
# ===============================================
# DATABASE_URL="postgresql://usuario:senha@ep-projeto.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Environment Configuration
NODE_ENV="development"
NEXT_PUBLIC_ENV="development"

# Database Configuration
DB_HOST="ep-projeto.us-east-1.aws.neon.tech"
DB_NAME="neondb"
DB_USER="usuario"
DB_PASSWORD="senha_segura"
DB_PORT="5432"
DB_SSL_MODE="require"

# Connection Pool Settings (economia)
DB_POOL_MIN=1
DB_POOL_MAX=5
DB_POOL_IDLE_TIMEOUT=30000
DB_POOL_CONNECTION_TIMEOUT=10000

# ===============================================
# 💰 PLANO GRATUITO NEON - LIMITES:
# ===============================================
# ✅ Armazenamento: 512 MB
# ✅ Compute: 0.25 vCPU
# ✅ Transferência: 3 GB/mês
# ✅ Branches: Ilimitadas
# ✅ Auto-suspend: Incluído
# ===============================================

# ===============================================
# 🔧 COMO CONFIGURAR:
# ===============================================
# 1. Copie este arquivo para .env.local
# 2. Substitua "ep-projeto" pelo ID real do seu projeto
# 3. Configure usuário e senha reais
# 4. Teste: npm run db:test
# ===============================================`,
  },
};

function createOptimizedEnvFiles() {
  console.log("💰 Configuração NeonDB - 2 Branches para Economia Máxima\n");
  console.log("🎯 Objetivo: Manter no plano gratuito do Neon\n");

  const projectRoot = process.cwd();
  let filesCreated = 0;
  let filesSkipped = 0;

  for (const [filename, config] of Object.entries(envTemplates)) {
    const filePath = path.join(projectRoot, filename);

    console.log(`${config.emoji} Criando: ${filename}`);
    console.log(`   Descrição: ${config.description}`);

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

    console.log("");
  }

  // Resumo da economia
  console.log("💰 Resumo da Configuração de Economia:");
  console.log(`   ✅ Arquivos criados: ${filesCreated}`);
  console.log(`   ⚠️  Arquivos pulados: ${filesSkipped}`);
  console.log(`   🏷️  Branches configuradas: 2 (production + development)`);
  console.log(`   💵 Custo estimado: R$ 0,00/mês (plano gratuito)`);

  // Instruções específicas para economia
  console.log("\n💡 Configurações de Economia Aplicadas:");
  console.log("• Auto-suspend: 1 min (dev) / 5 min (prod)");
  console.log("• Compute: 0.25 vCPU em ambos os ambientes");
  console.log("• Pool de conexões: Mínimo necessário");
  console.log("• Apenas 2 branches (sem staging)");

  // Próximos passos
  console.log("\n🔧 Próximos Passos:");
  console.log("1. Configure seu projeto no console.neon.tech");
  console.log("2. Copie .env.example para .env.local");
  console.log('3. Substitua "ep-projeto" pelo ID real do seu projeto');
  console.log("4. Configure usuário e senha reais");
  console.log("5. Teste: npm run db:test:dev");
  console.log("6. Monitore uso no dashboard do Neon");

  // Alertas de economia
  console.log("\n⚠️  Alertas de Economia:");
  console.log("• Monitore uso mensal (limite: 3 GB transferência)");
  console.log("• Mantenha auto-suspend habilitado");
  console.log("• Evite queries desnecessárias");
  console.log("• Use connection pooling para eficiência");
}

function updatePackageScriptsForTwoBranches() {
  const packagePath = path.join(process.cwd(), "package.json");

  try {
    if (fs.existsSync(packagePath)) {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));

      // Scripts otimizados para 2 branches
      const optimizedScripts = {
        "db:test": "node scripts/neon/test-connection.js dev",
        "db:test:dev": "node scripts/neon/test-connection.js dev",
        "db:test:prod": "node scripts/neon/test-connection.js prod",
        "db:test:all": "node scripts/neon/test-connection.js --all",
        "db:monitor": 'echo "💰 Monitore uso em: https://console.neon.tech"',
      };

      let scriptsAdded = 0;
      packageJson.scripts = packageJson.scripts || {};

      for (const [scriptName, scriptCommand] of Object.entries(
        optimizedScripts
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
        console.log(
          `\n✅ Adicionados ${scriptsAdded} scripts otimizados ao package.json`
        );
        console.log("   Comandos disponíveis:");
        console.log("   • npm run db:test (testa development)");
        console.log("   • npm run db:test:dev (testa development)");
        console.log("   • npm run db:test:prod (testa production)");
        console.log("   • npm run db:test:all (testa ambos)");
        console.log("   • npm run db:monitor (link para monitoramento)");
      }
    }
  } catch (error) {
    console.error("\n❌ Erro ao atualizar package.json:", error.message);
  }
}

function showCostOptimizationTips() {
  console.log("\n💰 DICAS PARA MANTER CUSTO ZERO:");
  console.log("━".repeat(50));

  console.log("\n📊 Limites do Plano Gratuito:");
  console.log("• Armazenamento: 512 MB");
  console.log("• Compute: 0.25 vCPU");
  console.log("• Transferência: 3 GB/mês");
  console.log("• Branches: Ilimitadas");

  console.log("\n⚡ Configurações Aplicadas:");
  console.log("• Auto-suspend agressivo (1-5 min)");
  console.log("• Compute mínimo (0.25 vCPU)");
  console.log("• Pool de conexões otimizado");
  console.log("• Apenas 2 branches essenciais");

  console.log("\n🎯 Monitoramento:");
  console.log("• Acesse: https://console.neon.tech");
  console.log("• Verifique uso mensal de transferência");
  console.log("• Monitore tempo de compute ativo");
  console.log("• Configure alertas se disponível");

  console.log("\n🚨 Evite Custos Extras:");
  console.log("• Não desabilite auto-suspend");
  console.log("• Não aumente compute sem necessidade");
  console.log("• Evite transferências desnecessárias");
  console.log("• Use cache quando possível");
}

// Executar script principal
function main() {
  console.log("🐘 Setup NeonDB - 2 Branches (Economia Máxima)\n");

  createOptimizedEnvFiles();
  updatePackageScriptsForTwoBranches();
  showCostOptimizationTips();

  console.log("\n🎉 Configuração de economia concluída!");
  console.log("📚 Consulte: docs/markdown/NEONDB_SETUP_GUIDE.md");
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = {
  createOptimizedEnvFiles,
  updatePackageScriptsForTwoBranches,
  showCostOptimizationTips,
  envTemplates,
};
