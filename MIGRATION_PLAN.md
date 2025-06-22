# Plano de Migração: Firebase → Prisma + NeonDB

## 📋 Visão Geral

- **Projeto**: Sistema de Gestão de Porteiros/Voluntários
- **Migração**: Firebase Firestore → PostgreSQL com Prisma ORM
- **Banco**: NeonDB (PostgreSQL Serverless)
- **Duração estimada**: 4-6 semanas
- **Complexidade**: Média-Alta

---

## 🎯 FASE 1: Preparação e Setup (Semana 1)

### 1.1 Análise e Documentação

- [ ] **Mapear todas as coleções do Firebase** (2h)
  - Documentar estrutura atual de dados
  - Identificar relacionamentos implícitos
  - Catalogar queries mais utilizadas
- [ ] **Definir modelo de dados SQL** (4h)
  - Criar ERD (Entity Relationship Diagram)
  - Definir chaves primárias/estrangeiras
  - Planejar índices para performance
- [ ] **Estratégia de autenticação** (2h)
  - Escolher entre NextAuth.js, Supabase Auth, ou implementação própria
  - Planejar migração de usuários existentes
  - Definir fluxo de recuperação de senha

### 1.2 Setup do Ambiente

- [ ] **Configurar NeonDB** (1h)

  - Criar conta no Neon
  - Configurar database de desenvolvimento
  - Configurar database de produção
  - Configurar variáveis de ambiente

- [ ] **Setup do Prisma** (2h)

  - Instalar dependências (`prisma`, `@prisma/client`)
  - Configurar `prisma/schema.prisma`
  - Setup do Prisma Client
  - Configurar scripts no package.json

- [ ] **Setup da autenticação** (4h)
  - Instalar NextAuth.js (ou alternativa escolhida)
  - Configurar providers
  - Criar middleware de autenticação
  - Setup de sessões

---

## 🏗️ FASE 2: Modelagem e Schema (Semana 2)

### 2.1 Schema do Banco

- [ ] **Criar schema Prisma** (6h)

  ```prisma
  // Exemplo das principais entidades
  model Usuario {
    id        String   @id @default(cuid())
    uid       String   @unique // Para compatibilidade com Firebase
    email     String   @unique
    nome      String
    igrejaId  String?
    cargo     String?
    isAdmin   Boolean  @default(false)
    criadoEm  DateTime @default(now())

    igreja    Igreja?  @relation(fields: [igrejaId], references: [id])

    @@map("usuarios")
  }

  model Igreja {
    id              String   @id @default(cuid())
    nome            String
    cultoDomingoRDJ Boolean  @default(false)
    cultoDomingo    Boolean  @default(false)
    cultoSegunda    Boolean  @default(false)
    cultoTerca      Boolean  @default(false)
    cultoQuarta     Boolean  @default(false)
    cultoQuinta     Boolean  @default(false)
    cultoSexta      Boolean  @default(false)
    cultoSabado     Boolean  @default(false)
    criadoEm        DateTime @default(now())

    usuarios        Usuario[]
    voluntarios     Voluntario[]
    escalas         Escala[]

    @@map("igrejas")
  }

  // ... outros models
  ```

- [ ] **Executar primeira migration** (1h)
  - `npx prisma migrate dev --name init`
  - Verificar tabelas criadas
  - Testar conexão

### 2.2 Tipos TypeScript

- [ ] **Atualizar types existentes** (3h)

  - Remover types Firebase-específicos
  - Usar tipos gerados pelo Prisma
  - Criar types customizados se necessário

- [ ] **Criar types para DTOs** (2h)
  - Input types para APIs
  - Output types para responses
  - Validation schemas (Zod)

---

## 🔄 FASE 3: Migração de Dados (Semana 2-3)

### 3.1 Scripts de Migração

- [ ] **Criar script de export do Firebase** (6h)

  ```typescript
  // scripts/exportFirebaseData.ts
  import { db } from "../app/config/firebase";
  import { collection, getDocs } from "firebase/firestore";

  async function exportCollection(collectionName: string) {
    const snapshot = await getDocs(collection(db, collectionName));
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  async function exportAllData() {
    const data = {
      usuarios: await exportCollection("usuarios"),
      igrejas: await exportCollection("igrejas"),
      cargos: await exportCollection("cargos"),
      voluntarios: await exportCollection("voluntarios"),
      escalas: await exportCollection("escalas"),
    };

    // Salvar em JSON para análise
    fs.writeFileSync("firebase-export.json", JSON.stringify(data, null, 2));
  }
  ```

- [ ] **Criar script de transformação** (8h)

  - Converter dados NoSQL para SQL
  - Resolver relacionamentos
  - Validar integridade referencial
  - Tratar dados inconsistentes

- [ ] **Criar script de import para Prisma** (4h)

  ```typescript
  // scripts/importToPrisma.ts
  import { PrismaClient } from "@prisma/client";

  const prisma = new PrismaClient();

  async function importData(firebaseData: any) {
    // Import em ordem de dependência
    await importIgrejas(firebaseData.igrejas);
    await importCargos(firebaseData.cargos);
    await importUsuarios(firebaseData.usuarios);
    await importVoluntarios(firebaseData.voluntarios);
    await importEscalas(firebaseData.escalas);
  }
  ```

### 3.2 Validação dos Dados

- [ ] **Criar testes de integridade** (4h)

  - Verificar se todos os dados foram migrados
  - Validar relacionamentos
  - Comparar contagens entre Firebase e PostgreSQL

- [ ] **Backup e rollback** (2h)
  - Procedimento de backup do Firebase
  - Script de rollback se necessário
  - Documentar processo de recuperação

---

## 🔧 FASE 4: Refatoração dos Serviços (Semana 3-4)

### 4.1 Serviços Base

- [ ] **Refatorar voluntarioService.ts** (4h)

  ```typescript
  // app/services/voluntarioService.ts
  import { prisma } from "@/lib/prisma";
  import { Prisma } from "@prisma/client";

  export const voluntarioService = {
    async listar(filtros?: { igrejaId?: string; cargoId?: string }) {
      return await prisma.voluntario.findMany({
        where: {
          ...(filtros?.igrejaId && { igrejaId: filtros.igrejaId }),
          ...(filtros?.cargoId && { cargoId: filtros.cargoId }),
        },
        include: {
          igreja: true,
          cargo: true,
        },
      });
    },

    async adicionar(data: Omit<Voluntario, "id">) {
      return await prisma.voluntario.create({
        data,
        include: {
          igreja: true,
          cargo: true,
        },
      });
    },

    // ... outros métodos
  };
  ```

- [ ] **Refatorar cargoService.ts** (2h)
- [ ] **Refatorar igrejaService.ts** (2h)
- [ ] **Refatorar porteiroService.ts** (2h)

### 4.2 Serviços Complexos

- [ ] **Refatorar escalaService.ts** (8h)

  - Converter queries complexas para SQL
  - Otimizar geração de escalas
  - Implementar transações quando necessário

- [ ] **Refatorar exportService.ts** (4h)
  - Usar joins do SQL para relatórios
  - Otimizar queries para exports

### 4.3 Context e Hooks

- [ ] **Refatorar AuthContext.tsx** (6h)

  - Implementar novo sistema de autenticação
  - Manter compatibilidade de interface
  - Implementar recuperação de senha

- [ ] **Atualizar usePermissions.ts** (2h)
  - Adaptar para nova estrutura de usuários
  - Manter lógica de permissões

---

## 🌐 FASE 5: APIs e Frontend (Semana 4-5)

### 5.1 API Routes

- [ ] **Criar/atualizar API routes** (8h)

  - `/api/auth/[...nextauth].ts` (se usando NextAuth)
  - `/api/voluntarios/*`
  - `/api/escalas/*`
  - `/api/igrejas/*`
  - `/api/cargos/*`
  - `/api/usuarios/*`

- [ ] **Middleware de autenticação** (3h)
  - Validar JWT tokens
  - Middleware de permissões
  - Rate limiting

### 5.2 Componentes Frontend

- [ ] **Atualizar componentes que fazem queries** (6h)

  - PeopleManager.tsx
  - VoluntariosTable.tsx
  - DashboardStats.tsx
  - DashboardCharts.tsx

- [ ] **Atualizar formulários** (4h)
  - VoluntarioForm.tsx
  - NovoUsuarioDialog.tsx
  - EditarUsuarioDialog.tsx

---

## 🧪 FASE 6: Testes e Otimização (Semana 5-6)

### 6.1 Testes

- [ ] **Testes unitários dos services** (8h)

  ```typescript
  // __tests__/services/voluntarioService.test.ts
  describe("VoluntarioService", () => {
    beforeEach(async () => {
      // Setup test database
      await prisma.voluntario.deleteMany();
    });

    it("deve listar voluntários com filtros", async () => {
      // Criar dados de teste
      // Executar service
      // Verificar resultado
    });
  });
  ```

- [ ] **Testes de integração** (6h)

  - Testar fluxos completos
  - Testar APIs
  - Testar autenticação

- [ ] **Testes E2E críticos** (4h)
  - Login/logout
  - Geração de escalas
  - Exportação de dados

### 6.2 Performance

- [ ] **Otimizar queries** (4h)

  - Analisar slow queries
  - Adicionar índices necessários
  - Implementar pagination

- [ ] **Caching** (3h)
  - Cache de queries frequentes
  - Redis se necessário
  - Cache de sessões

---

## 🚀 FASE 7: Deploy e Monitoramento (Semana 6)

### 7.1 Deploy

- [ ] **Configurar ambiente de produção** (3h)

  - Variáveis de ambiente
  - Connection pooling
  - SSL certificates

- [ ] **Deploy gradual** (4h)
  - Feature flags para alternar entre Firebase/Prisma
  - Deploy em staging
  - Testes em produção

### 7.2 Monitoramento

- [ ] **Setup de logs** (2h)

  - Logs estruturados
  - Error tracking (Sentry)
  - Performance monitoring

- [ ] **Backup automático** (2h)
  - Backup diário do PostgreSQL
  - Procedimento de restore
  - Alertas de falha

---

## 📋 CHECKLIST FINAL

### Antes do Go-Live

- [ ] Todos os testes passando
- [ ] Performance acceptable (< 500ms para queries principais)
- [ ] Backup completo do Firebase realizado
- [ ] Rollback procedure testado
- [ ] Monitoring ativo
- [ ] Equipe treinada nos novos procedures

### Pós Go-Live

- [ ] Monitorar logs por 48h
- [ ] Verificar performance em produção
- [ ] Validar integridade dos dados
- [ ] Coletar feedback dos usuários
- [ ] Documentar lições aprendidas

---

## 🔧 Ferramentas e Dependências

### Novas Dependências

```json
{
  "dependencies": {
    "prisma": "^5.0.0",
    "@prisma/client": "^5.0.0",
    "next-auth": "^4.24.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.0",
    "@types/jsonwebtoken": "^9.0.0",
    "jest": "^29.0.0",
    "@testing-library/react": "^13.0.0"
  }
}
```

### Scripts Úteis

```json
{
  "scripts": {
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:reset": "prisma migrate reset",
    "db:seed": "tsx scripts/seed.ts",
    "migration:export": "tsx scripts/exportFirebaseData.ts",
    "migration:import": "tsx scripts/importToPrisma.ts",
    "test:migration": "jest __tests__/migration/"
  }
}
```

---

## ⚠️ Riscos e Mitigações

### Riscos Principais

1. **Perda de dados durante migração**

   - Mitigação: Backups completos + validação rigorosa

2. **Downtime prolongado**

   - Mitigação: Deploy gradual com feature flags

3. **Performance inferior**

   - Mitigação: Testes de carga + otimização prévia

4. **Bugs em funcionalidades críticas**
   - Mitigação: Testes E2E extensivos

### Plano B

- Manter Firebase funcionando em paralelo por 30 dias
- Rollback automatizado se métricas críticas falharem
- Suporte 24/7 durante primeiras 72h pós-deploy

---

## 📞 Próximos Passos

1. **Revisar e aprovar este plano**
2. **Alocar recursos (desenvolvedores, tempo)**
3. **Começar pela Fase 1**
4. **Setup de reuniões semanais de acompanhamento**
5. **Definir critérios de sucesso mensuráveis**
