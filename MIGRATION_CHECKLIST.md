# ✅ Checklist Executável de Migração

## 📋 Como usar este checklist

- [ ] = Tarefa pendente
- [⏳] = Em andamento
- [✅] = Completa
- [❌] = Bloqueada/Com problemas

---

## 🎯 **FASE 1: PREPARAÇÃO** (Semana 1)

### 📊 Análise Inicial

- [ ] **1.1** Mapear coleções Firebase existentes

  ```bash
  # Executar script de análise
  node scripts/analyzeFirebase.js > firebase-schema.json
  ```

  - [ ] Documentar coleção `usuarios` (campos, tipos, relacionamentos)
  - [ ] Documentar coleção `igrejas`
  - [ ] Documentar coleção `cargos`
  - [ ] Documentar coleção `voluntarios`
  - [ ] Documentar coleção `escalas`
  - [ ] Identificar relacionamentos implícitos

- [ ] **1.2** Catalogar queries mais utilizadas
  - [ ] Listar voluntários por igreja/cargo
  - [ ] Gerar escalas mensais
  - [ ] Buscar disponibilidades
  - [ ] Relatórios de exportação
  - [ ] Autenticação de usuários

### 🏗️ Design do Schema

- [ ] **1.3** Criar ERD (Entity Relationship Diagram)
  - [ ] Usar ferramenta: [dbdiagram.io](https://dbdiagram.io/)
  - [ ] Definir tabelas principais
  - [ ] Estabelecer relacionamentos (1:1, 1:N, N:N)
  - [ ] Definir índices necessários
  - [ ] Validar com stakeholders

### ⚙️ Setup Ambiente

- [ ] **1.4** Configurar NeonDB

  ```bash
  # 1. Criar conta em https://neon.tech
  # 2. Criar novo projeto
  # 3. Configurar databases
  ```

  - [ ] Database de desenvolvimento
  - [ ] Database de staging
  - [ ] Database de produção
  - [ ] Salvar connection strings seguras

- [ ] **1.5** Setup Prisma
  ```bash
  npm install prisma @prisma/client
  npx prisma init
  ```
  - [ ] Configurar `.env` com DATABASE_URL
  - [ ] Atualizar `package.json` com scripts
  - [ ] Configurar `prisma/schema.prisma` inicial

### 🔐 Estratégia Autenticação

- [ ] **1.6** Escolher solução de auth

  - [ ] NextAuth.js (recomendado)
  - [ ] Supabase Auth
  - [ ] Auth0
  - [ ] Implementação própria

- [ ] **1.7** Planejar migração usuários
  - [ ] Estratégia para senhas (reset forçado?)
  - [ ] Mapeamento UIDs Firebase → IDs Prisma
  - [ ] Preservar sessões existentes (se possível)

---

## 🏗️ **FASE 2: SCHEMA E DADOS** (Semana 2)

### 📝 Schema Prisma

- [ ] **2.1** Definir schema completo

  ```prisma
  // prisma/schema.prisma
  generator client {
    provider = "prisma-client-js"
  }

  datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
  }
  ```

  - [ ] Model Usuario
  - [ ] Model Igreja
  - [ ] Model Cargo
  - [ ] Model Voluntario
  - [ ] Model Disponibilidade
  - [ ] Model Escala
  - [ ] Model EscalaDia
  - [ ] Model EscalaVoluntario
  - [ ] Definir enums (DiaSemana, etc.)

- [ ] **2.2** Executar primeira migração
  ```bash
  npx prisma migrate dev --name init
  npx prisma generate
  ```
  - [ ] Verificar tabelas criadas no NeonDB
  - [ ] Testar conexão com Prisma Client
  - [ ] Validar estrutura do schema

### 📦 Migração de Dados

- [ ] **2.3** Script de export Firebase

  ```bash
  # Criar scripts/exportFirebase.ts
  tsx scripts/exportFirebase.ts
  ```

  - [ ] Exportar todos os usuarios
  - [ ] Exportar todas as igrejas
  - [ ] Exportar todos os cargos
  - [ ] Exportar todos os voluntarios
  - [ ] Exportar todas as escalas
  - [ ] Salvar em `firebase-export.json`

- [ ] **2.4** Script de transformação

  ```bash
  tsx scripts/transformData.ts
  ```

  - [ ] Converter timestamps Firestore → Date
  - [ ] Resolver referências entre entidades
  - [ ] Criar disponibilidades separadas
  - [ ] Normalizar dados de escalas
  - [ ] Validar integridade referencial
  - [ ] Salvar em `transformed-data.json`

- [ ] **2.5** Script de import Prisma
  ```bash
  tsx scripts/importToPrisma.ts
  ```
  - [ ] Import em ordem: Igrejas → Cargos → Usuarios → Voluntarios → Escalas
  - [ ] Usar transações para atomicidade
  - [ ] Log detalhado de progresso
  - [ ] Tratamento de erros robusto

### ✅ Validação

- [ ] **2.6** Verificar integridade dos dados
  ```bash
  tsx scripts/validateMigration.ts
  ```
  - [ ] Comparar contagens Firebase vs PostgreSQL
  - [ ] Validar relacionamentos
  - [ ] Verificar campos obrigatórios
  - [ ] Testar queries básicas

---

## 🔧 **FASE 3: REFATORAÇÃO SERVIÇOS** (Semana 3)

### 🛠️ Serviços Básicos

- [ ] **3.1** Refatorar `voluntarioService.ts`

  ```typescript
  import { prisma } from "@/lib/prisma";

  export const voluntarioService = {
    async listar(filtros?: { igrejaId?: string; cargoId?: string }) {
      return await prisma.voluntario.findMany({
        where: {
          ...(filtros?.igrejaId && { igrejaId: filtros.igrejaId }),
          ...(filtros?.cargoId && { cargoId: filtros.cargoId }),
        },
        include: { igreja: true, cargo: true, disponibilidades: true },
      });
    },
    // ... outros métodos
  };
  ```

  - [ ] Método `listar()` com filtros
  - [ ] Método `adicionar()`
  - [ ] Método `atualizar()`
  - [ ] Método `excluir()`
  - [ ] Incluir relacionamentos necessários

- [ ] **3.2** Refatorar outros serviços básicos
  - [ ] `cargoService.ts` (2h)
  - [ ] `igrejaService.ts` (2h)
  - [ ] `porteiroService.ts` (2h)

### 🔄 Serviços Complexos

- [ ] **3.3** Refatorar `escalaService.ts`

  - [ ] Converter queries Firestore → SQL
  - [ ] Otimizar geração de escalas
  - [ ] Implementar transações
  - [ ] Manter compatibilidade de interface
  - [ ] Testes extensivos

- [ ] **3.4** Refatorar `exportService.ts`
  - [ ] Usar JOINs SQL para performance
  - [ ] Otimizar queries de relatórios
  - [ ] Manter formatos de export existentes

### 🔐 Sistema Autenticação

- [ ] **3.5** Setup NextAuth.js

  ```bash
  npm install next-auth
  ```

  - [ ] Configurar `pages/api/auth/[...nextauth].ts`
  - [ ] Provider de credenciais
  - [ ] Configurar JWT
  - [ ] Session callback customizado

- [ ] **3.6** Migrar AuthContext
  - [ ] Manter interface compatível
  - [ ] Integrar com NextAuth
  - [ ] Preservar lógica de permissões
  - [ ] Testar fluxos de login/logout

---

## 🌐 **FASE 4: APIs E FRONTEND** (Semana 4)

### 🔌 API Routes

- [ ] **4.1** Criar/atualizar rotas API

  - [ ] `/api/auth/[...nextauth].ts`
  - [ ] `/api/voluntarios/route.ts`
  - [ ] `/api/escalas/route.ts`
  - [ ] `/api/igrejas/route.ts`
  - [ ] `/api/cargos/route.ts`
  - [ ] `/api/usuarios/route.ts`

- [ ] **4.2** Middleware de autenticação

  ```typescript
  // middleware.ts
  import { withAuth } from "next-auth/middleware";

  export default withAuth(
    function middleware(req) {
      // Lógica de autorização
    },
    {
      callbacks: {
        authorized: ({ token }) => !!token,
      },
    }
  );
  ```

### 🎨 Frontend Components

- [ ] **4.3** Atualizar componentes principais

  - [ ] `PeopleManager.tsx` - queries via API
  - [ ] `VoluntariosTable.tsx` - nova estrutura dados
  - [ ] `DashboardStats.tsx` - métricas Prisma
  - [ ] `DashboardCharts.tsx` - dados relacionais

- [ ] **4.4** Atualizar formulários
  - [ ] `VoluntarioForm.tsx` - campos disponibilidades
  - [ ] `NovoUsuarioDialog.tsx` - nova validação
  - [ ] `EditarUsuarioDialog.tsx` - relacionamentos

---

## 🧪 **FASE 5: TESTES** (Semana 5)

### 🔬 Testes Unitários

- [ ] **5.1** Services testing
  ```bash
  npm install --save-dev jest @testing-library/react
  ```
  - [ ] Tests para voluntarioService
  - [ ] Tests para escalaService
  - [ ] Tests para authService
  - [ ] Mock do Prisma Client
  - [ ] Coverage > 80%

### 🔗 Testes Integração

- [ ] **5.2** API testing
  - [ ] Testes de rotas autenticadas
  - [ ] Validação de payloads
  - [ ] Error handling
  - [ ] Rate limiting

### 🎭 Testes E2E

- [ ] **5.3** Fluxos críticos
  - [ ] Login/logout completo
  - [ ] Cadastro de voluntário
  - [ ] Geração de escala mensal
  - [ ] Export de dados

### ⚡ Performance

- [ ] **5.4** Otimização
  - [ ] Análise de queries lentas
  - [ ] Adição de índices necessários
  - [ ] Implementação de cache (Redis?)
  - [ ] Load testing

---

## 🚀 **FASE 6: DEPLOY** (Semana 6)

### 🏭 Ambiente Produção

- [ ] **6.1** Configuração infraestrutura
  - [ ] Variáveis ambiente produção
  - [ ] Connection pooling (PgBouncer?)
  - [ ] SSL certificates
  - [ ] Monitoring setup

### 🚦 Deploy Gradual

- [ ] **6.2** Feature flags
  ```typescript
  // lib/featureFlags.ts
  export const useFirebase = process.env.USE_FIREBASE === "true";
  ```
  - [ ] Toggle Firebase ↔ Prisma
  - [ ] Deploy em staging primeiro
  - [ ] Rollout gradual (10% → 50% → 100%)

### 📊 Monitoramento

- [ ] **6.3** Observabilidade
  - [ ] Logs estruturados
  - [ ] Error tracking (Sentry)
  - [ ] Performance monitoring
  - [ ] Alertas automáticos
  - [ ] Dashboard métricas

---

## 🏁 **CHECKLIST FINAL PRÉ-PRODUÇÃO**

### ✅ Validações Críticas

- [ ] Todos os testes unitários passando
- [ ] Todos os testes E2E passando
- [ ] Performance aceitável (< 500ms queries principais)
- [ ] Zero data loss validado
- [ ] Backup completo Firebase realizado
- [ ] Rollback procedure testado e documentado
- [ ] Equipe treinada nos novos procedures

### 📋 Pós-Deploy (Primeiras 48h)

- [ ] Monitorar logs 24/7
- [ ] Verificar métricas performance
- [ ] Validar integridade dados em produção
- [ ] Coletar feedback usuários
- [ ] Documentar issues encontradas
- [ ] Implementar fixes críticos

---

## 🆘 **PLANO DE CONTINGÊNCIA**

### 🔄 Rollback Automático

```bash
# Em caso de emergência
export USE_FIREBASE=true
npm run build && npm run start
```

### 📞 Escalação

1. **Problema crítico**: Ativar rollback imediato
2. **Performance degradada**: Investigar queries + cache
3. **Data inconsistency**: Parar sistema + investigar
4. **Auth não funcionando**: Rollback auth + investigar

### 📝 Comunicação

- [ ] Template email para usuários (downtime)
- [ ] Canal Slack/Teams para equipe técnica
- [ ] Procedure de comunicação stakeholders

---

## 📊 **MÉTRICAS DE SUCESSO**

### KPIs Técnicos

- [ ] **Performance**: Queries < 500ms (vs Firebase atual)
- [ ] **Uptime**: > 99.9% pós-migração
- [ ] **Data Integrity**: 100% dados migrados corretamente
- [ ] **Test Coverage**: > 80% código crítico

### KPIs Negócio

- [ ] **User Experience**: Sem impacto funcionalidades
- [ ] **Downtime**: < 2h durante migração
- [ ] **Bug Reports**: < 5 bugs críticos primeira semana
- [ ] **User Satisfaction**: > 90% usuários satisfeitos
