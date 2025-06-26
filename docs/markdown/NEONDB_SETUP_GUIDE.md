# 🐘 Guia de Configuração NeonDB - Sistema de Gestão de Voluntários

Este documento fornece instruções detalhadas para configurar o **NeonDB** como banco de dados PostgreSQL para o projeto **Lista de Porteiros** (Sistema de Gestão de Voluntários para Igrejas).

---

## 📋 **Índice**

1. [Visão Geral do Projeto](#-visão-geral-do-projeto)
2. [Configuração Inicial](#-configuração-inicial)
3. [Criação dos Ambientes](#-criação-dos-ambientes)
4. [Connection Strings](#-connection-strings)
5. [Configuração de Segurança](#-configuração-de-segurança)
6. [Variáveis de Ambiente](#-variáveis-de-ambiente)
7. [Scripts de Configuração](#-scripts-de-configuração)
8. [Checklist de Configuração](#-checklist-de-configuração)

---

## 🎯 **Visão Geral do Projeto**

### **Contexto**

- **Projeto:** Lista de Porteiros - Sistema de Gestão de Voluntários
- **Tecnologia:** Next.js + TypeScript + Firebase (migração para PostgreSQL)
- **Finalidade:** Gerenciamento de voluntários, escalas e atividades para igrejas
- **Ambientes:** Development, Staging, Production

### **Arquitetura de Dados**

- **Origem:** Firebase Firestore (5 coleções principais)
- **Destino:** PostgreSQL (NeonDB) com estrutura relacional
- **Migração:** Preservação de dados existentes com normalização

---

## 🚀 **Configuração Inicial**

### **Passo 1: Criação do Projeto no Neon**

1. **Acesse o Neon Console:** [https://console.neon.tech](https://console.neon.tech)
2. **Crie um novo projeto:**

   ```
   Nome do Projeto: lista-porteiros-church-management
   Região: us-east-1 (ou mais próxima do seu público)
   PostgreSQL Version: 15 (recomendada)
   ```

3. **Configurações Iniciais:**
   ```yaml
   Project Settings:
     - Auto-suspend: 5 minutes (desenvolvimento)
     - Compute Units: 0.25 vCPU (inicial, escalar conforme necessário)
     - Storage: Auto-scaling habilitado
     - Connection Pooling: Habilitado (PgBouncer)
   ```

### **Passo 2: Configuração de Branches**

O Neon utiliza o conceito de **branches** para diferentes ambientes:

```bash
# Branch Principal (Production)
main → lista-porteiros-prod

# Branch de Staging
staging → lista-porteiros-staging

# Branch de Development
dev → lista-porteiros-dev
```

---

## 🏗️ **Criação dos Ambientes**

### **🔴 Ambiente de Produção (PRODUCTION)**

```yaml
Branch: production (main/default)
Database: neondb (padrão)
Configurações OTIMIZADAS PARA CUSTO MÍNIMO:
  - Auto-suspend: 5 minutes (máximo economia)
  - Compute: 0.25 vCPU (mínimo possível)
  - Backup: Automático (incluído no plano gratuito)
  - Connection Limit: 100 (suficiente para produção pequena)
  - SSL: Obrigatório
  - Scaling: Manual (evita custos inesperados)
```

### **🟢 Ambiente de Desenvolvimento (DEVELOPMENT)**

```yaml
Branch: development
Database: neondb (padrão)
Configurações OTIMIZADAS PARA CUSTO ZERO:
  - Auto-suspend: 1 minute (máxima economia)
  - Compute: 0.25 vCPU (mínimo possível)
  - Backup: Automático (incluído no plano gratuito)
  - Connection Limit: 20 (suficiente para desenvolvimento)
  - SSL: Obrigatório
  - Scaling: Desabilitado
```

> **💡 DICA DE ECONOMIA:** Com essas configurações, você permanece no **plano gratuito** do Neon, que inclui:
>
> - 512 MB de armazenamento
> - 3 GB de transferência de dados por mês
> - Auto-suspend após inatividade

### **💰 Estratégia de Economia de Custos**

**🎯 Objetivo:** Manter o projeto no plano gratuito do Neon

**📊 Limites do Plano Gratuito:**

- ✅ Armazenamento: 512 MB (suficiente para início)
- ✅ Compute: 0.25 vCPU (adequado para projetos pequenos)
- ✅ Transferência: 3 GB/mês (monitorar uso)
- ✅ Branches: Ilimitadas (perfeito para dev/prod)
- ✅ Auto-suspend: Incluído (economia automática)

**⚡ Configurações Recomendadas:**

- **Production:** Auto-suspend em 5 min (balance economia/disponibilidade)
- **Development:** Auto-suspend em 1 min (máxima economia)
- **Monitoramento:** Acompanhar uso mensal no dashboard

---

## 🔗 **Connection Strings**

### **⚠️ IMPORTANTE: Segurança das Connection Strings**

> **NUNCA** commite connection strings diretamente no código!
> Use sempre variáveis de ambiente ou serviços de gerenciamento de segredos.

### **🔴 PRODUÇÃO (Branch: production)**

```bash
# Connection String - Branch Production (substitua pelos valores reais)
DATABASE_URL_PROD="postgresql://username:password@ep-seu-projeto.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Componentes da String:
# - Host: ep-seu-projeto.us-east-1.aws.neon.tech (endpoint da branch production)
# - Database: neondb (nome padrão do Neon)
# - Branch: production (default/main)
# - SSL: Obrigatório (sslmode=require)
# - Port: 5432 (padrão PostgreSQL)
```

### **🟢 DESENVOLVIMENTO (Branch: development)**

```bash
# Connection String - Branch Development (substitua pelos valores reais)
DATABASE_URL_DEV="postgresql://username:password@ep-seu-projeto-123456.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Componentes da String:
# - Host: ep-seu-projeto-123456.us-east-1.aws.neon.tech (endpoint específico da branch)
# - Database: neondb (mesmo nome, dados isolados por branch)
# - Branch: development
# - SSL: Obrigatório (sslmode=require)
```

### **💡 DIFERENÇA ENTRE BRANCHES**

```bash
# Cada branch tem seu próprio endpoint, mas mesmo banco "neondb"
# Production:  ep-seu-projeto.us-east-1.aws.neon.tech
# Development: ep-seu-projeto-123456.us-east-1.aws.neon.tech

# Os dados são completamente isolados entre branches
# Ideal para testar mudanças sem afetar produção
```

### **🔄 Connection Pooling (Recomendado)**

```bash
# Para aplicações com muitas conexões simultâneas
DATABASE_URL_POOLED="postgresql://username:password@ep-cool-lab-123456-pooler.us-east-1.aws.neon.tech/lista_porteiros_prod?sslmode=require"

# Benefícios:
# - Melhor performance
# - Gerenciamento automático de conexões
# - Redução de overhead
```

---

## 🔒 **Configuração de Segurança**

### **1. Usuários e Permissões**

```sql
-- Criar usuários específicos para cada ambiente
CREATE USER app_user_prod WITH PASSWORD 'senha_super_segura_prod';
CREATE USER app_user_staging WITH PASSWORD 'senha_super_segura_staging';
CREATE USER app_user_dev WITH PASSWORD 'senha_super_segura_dev';

-- Permissões mínimas necessárias
GRANT CONNECT ON DATABASE lista_porteiros_prod TO app_user_prod;
GRANT USAGE ON SCHEMA public TO app_user_prod;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user_prod;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user_prod;

-- Repetir para staging e dev
```

### **2. Configurações de Rede**

```yaml
Configurações de Segurança:
  IP Allowlist:
    - Produção: IPs específicos do servidor de produção
    - Staging: IPs da equipe de desenvolvimento
    - Development: Aberto para desenvolvimento (com cuidado)

  SSL/TLS:
    - Versão mínima: TLS 1.2
    - Certificados: Validação obrigatória
    - Modo: require (mínimo)
```

### **3. Auditoria e Logs**

```yaml
Monitoramento:
  - Query Logging: Habilitado para produção
  - Connection Logging: Habilitado
  - Error Logging: Detalhado
  - Performance Insights: Habilitado
```

---

## 🔧 **Variáveis de Ambiente**

### **Arquivo `.env.local` (Development)**

```bash
# NeonDB Configuration - Development
DATABASE_URL="postgresql://app_user_dev:senha_dev@ep-cool-lab-123456.us-east-1.aws.neon.tech/lista_porteiros_dev?sslmode=require"
DATABASE_URL_POOLED="postgresql://app_user_dev:senha_dev@ep-cool-lab-123456-pooler.us-east-1.aws.neon.tech/lista_porteiros_dev?sslmode=require"

# Environment
NODE_ENV="development"
NEXT_PUBLIC_ENV="development"

# Database Configuration
DB_HOST="ep-cool-lab-123456.us-east-1.aws.neon.tech"
DB_NAME="lista_porteiros_dev"
DB_USER="app_user_dev"
DB_PASSWORD="senha_dev"
DB_PORT="5432"
DB_SSL_MODE="require"
```

### **Arquivo `.env.staging` (Staging)**

```bash
# NeonDB Configuration - Staging
DATABASE_URL="postgresql://app_user_staging:senha_staging@ep-cool-lab-123456.us-east-1.aws.neon.tech/lista_porteiros_staging?sslmode=require"
DATABASE_URL_POOLED="postgresql://app_user_staging:senha_staging@ep-cool-lab-123456-pooler.us-east-1.aws.neon.tech/lista_porteiros_staging?sslmode=require"

# Environment
NODE_ENV="production"
NEXT_PUBLIC_ENV="staging"

# Database Configuration
DB_HOST="ep-cool-lab-123456.us-east-1.aws.neon.tech"
DB_NAME="lista_porteiros_staging"
DB_USER="app_user_staging"
DB_PASSWORD="senha_staging"
DB_PORT="5432"
DB_SSL_MODE="require"
```

### **Arquivo `.env.production` (Production)**

```bash
# NeonDB Configuration - Production
DATABASE_URL="postgresql://app_user_prod:senha_prod_super_segura@ep-cool-lab-123456.us-east-1.aws.neon.tech/lista_porteiros_prod?sslmode=require"
DATABASE_URL_POOLED="postgresql://app_user_prod:senha_prod_super_segura@ep-cool-lab-123456-pooler.us-east-1.aws.neon.tech/lista_porteiros_prod?sslmode=require"

# Environment
NODE_ENV="production"
NEXT_PUBLIC_ENV="production"

# Database Configuration
DB_HOST="ep-cool-lab-123456.us-east-1.aws.neon.tech"
DB_NAME="lista_porteiros_prod"
DB_USER="app_user_prod"
DB_PASSWORD="senha_prod_super_segura"
DB_PORT="5432"
DB_SSL_MODE="require"
```

---

## 📜 **Scripts de Configuração**

### **Script de Teste de Conexão**

```javascript
// scripts/test-neon-connection.js
const { Pool } = require("pg");

async function testConnection(env = "dev") {
  const connectionString =
    process.env[`DATABASE_URL_${env.toUpperCase()}`] ||
    process.env.DATABASE_URL;

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    const client = await pool.connect();
    console.log(`✅ Conexão com NeonDB (${env}) estabelecida com sucesso!`);

    // Teste básico
    const result = await client.query(
      "SELECT NOW() as current_time, version() as pg_version"
    );
    console.log("📊 Informações do banco:");
    console.log(`   Hora atual: ${result.rows[0].current_time}`);
    console.log(
      `   Versão PostgreSQL: ${result.rows[0].pg_version.split(" ")[1]}`
    );

    client.release();
  } catch (error) {
    console.error(`❌ Erro na conexão com NeonDB (${env}):`, error.message);
  } finally {
    await pool.end();
  }
}

// Executar teste
const env = process.argv[2] || "dev";
testConnection(env);
```

### **Script de Migração de Schema**

```javascript
// scripts/create-schema.js
const { Pool } = require("pg");
const fs = require("fs");

async function createSchema(env = "dev") {
  const connectionString =
    process.env[`DATABASE_URL_${env.toUpperCase()}`] ||
    process.env.DATABASE_URL;

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    const client = await pool.connect();
    console.log(`🏗️ Criando schema no ambiente: ${env}`);

    // Ler arquivo de schema
    const schemaSQL = fs.readFileSync("./database/schema.sql", "utf8");

    // Executar schema
    await client.query(schemaSQL);
    console.log("✅ Schema criado com sucesso!");

    client.release();
  } catch (error) {
    console.error("❌ Erro ao criar schema:", error.message);
  } finally {
    await pool.end();
  }
}

const env = process.argv[2] || "dev";
createSchema(env);
```

---

## 🚨 **Considerações Importantes**

### **🔒 Segurança**

1. **Nunca** commite connection strings no código
2. Use **variáveis de ambiente** ou **secrets managers**
3. Rotacione **senhas regularmente**
4. Configure **IP allowlists** para produção
5. Monitore **logs de acesso** e **queries suspeitas**

### **⚡ Performance**

1. Use **connection pooling** para aplicações web
2. Configure **auto-suspend** adequadamente para cada ambiente
3. Monitore **query performance** e otimize conforme necessário
4. Implemente **índices** baseados nos padrões de consulta
5. Use **prepared statements** para queries frequentes

### **💰 Custos**

1. **Development**: Auto-suspend agressivo (5 min)
2. **Staging**: Auto-suspend moderado (10 min)
3. **Production**: Auto-suspend desabilitado ou conservador
4. Monitore **usage metrics** mensalmente
5. Configure **alertas de billing** se disponível

---

## 📋 **Checklist de Configuração**

### **✅ Pré-Configuração**

- [ ] Conta NeonDB criada
- [ ] Projeto "lista-porteiros-church-management" criado
- [ ] Branches configuradas (main, staging, dev)
- [ ] Configurações de compute definidas

### **✅ Configuração de Bancos**

- [ ] Database `lista_porteiros_prod` criado
- [ ] Database `lista_porteiros_staging` criado
- [ ] Database `lista_porteiros_dev` criado
- [ ] Usuários específicos criados para cada ambiente
- [ ] Permissões configuradas adequadamente

### **✅ Segurança**

- [ ] SSL/TLS habilitado em todos os ambientes
- [ ] IP allowlist configurado
- [ ] Senhas fortes definidas
- [ ] Connection strings armazenadas com segurança
- [ ] Variáveis de ambiente configuradas

### **✅ Monitoramento**

- [ ] Alertas configurados
- [ ] Backup automático habilitado
- [ ] Logs de auditoria ativados
- [ ] Métricas de performance monitoradas

### **✅ Validação**

- [ ] Testes de conexão executados
- [ ] Schema criado em todos os ambientes
- [ ] Migração de dados testada
- [ ] Performance validada

---

## 📊 **Resumo das Connection Strings**

### **📋 Tabela de Ambientes**

| Ambiente    | Branch        | Database | Connection String Template                                           | Compute   | Auto-Suspend | Custo       |
| ----------- | ------------- | -------- | -------------------------------------------------------------------- | --------- | ------------ | ----------- |
| 🟢 **DEV**  | `development` | `neondb` | `postgresql://user:pass@ep-projeto-123456.../neondb?sslmode=require` | 0.25 vCPU | 1 min        | **R$ 0,00** |
| 🔴 **PROD** | `production`  | `neondb` | `postgresql://user:pass@ep-projeto.../neondb?sslmode=require`        | 0.25 vCPU | 5 min        | **R$ 0,00** |

### **🔄 Connection Pooling**

Para cada ambiente, adicione `-pooler` ao hostname para usar connection pooling:

```bash
# Exemplo para produção
postgresql://app_user_prod:senha_prod@ep-cool-lab-123456-pooler.us-east-1.aws.neon.tech/lista_porteiros_prod?sslmode=require
```

### **🌐 Configuração de Rede**

- **Host padrão:** `ep-[identificador].us-east-1.aws.neon.tech`
- **Host pooling:** `ep-[identificador]-pooler.us-east-1.aws.neon.tech`
- **Porta:** `5432` (padrão PostgreSQL)
- **SSL:** `sslmode=require` (obrigatório)

---

## 🔗 **Recursos Úteis**

### **Documentação Oficial**

- [NeonDB Documentation](https://neon.tech/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Connection Pooling Guide](https://neon.tech/docs/connect/connection-pooling)

### **Ferramentas Recomendadas**

- **pgAdmin**: Interface gráfica para PostgreSQL
- **DBeaver**: Cliente universal de banco de dados
- **Prisma**: ORM para Node.js/TypeScript
- **Drizzle**: ORM leve para TypeScript

---

_📅 Documento criado em: 25/06/2025_  
_👤 Autor: Especialista em Infraestrutura de Banco de Dados_  
_🔄 Última atualização: 25/06/2025_
