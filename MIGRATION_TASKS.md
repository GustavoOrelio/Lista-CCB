# Tarefas Detalhadas da Migração

## 🗓️ Cronograma Semanal

### **SEMANA 1** - Preparação (40h)

```
Segunda (8h)    | Terça (8h)      | Quarta (8h)     | Quinta (8h)     | Sexta (8h)
────────────────┼─────────────────┼─────────────────┼─────────────────┼─────────────
Análise Firebase| Schema Design   | Setup NeonDB    | Setup Prisma    | Auth Strategy
Mapear coleções | Criar ERD       | Configurar DBs  | Instalar deps   | Escolher lib
Doc relacionam. | Definir PKs/FKs | Vars ambiente   | Config Prisma   | Planejar migr.
Catalogar quer. | Planejar índices| Testar conexão  | Scripts package | Setup NextAuth
```

### **SEMANA 2** - Schema e Dados (40h)

```
Segunda (8h)    | Terça (8h)      | Quarta (8h)     | Quinta (8h)     | Sexta (8h)
────────────────┼─────────────────┼─────────────────┼─────────────────┼─────────────
Prisma Schema   | Export Firebase | Transform Data  | Import Prisma   | Data Validation
Models Usuario  | Script export   | Converter NoSQL | Script import   | Testes integr.
Models Igreja   | Export todas    | Resolver relac. | Executar import | Comparar dados
Models Escala   | Salvar JSON     | Validar integr. | Verificar erros | Backup/rollback
```

### **SEMANA 3** - Serviços (40h)

```
Segunda (8h)    | Terça (8h)      | Quarta (8h)     | Quinta (8h)     | Sexta (8h)
────────────────┼─────────────────┼─────────────────┼─────────────────┼─────────────
Refactor Basic  | Refactor Basic  | Escala Service  | Escala Service  | Auth Context
voluntarioSrv   | cargoService    | Queries SQL     | Transações      | Nova auth
igrejaService   | porteiroService | Otimizações     | Testes service  | Compatibilid.
Testes básicos  | Testes básicos  | Export Service  | Debug & fix     | usePermissions
```

### **SEMANA 4** - APIs e Frontend (40h)

```
Segunda (8h)    | Terça (8h)      | Quarta (8h)     | Quinta (8h)     | Sexta (8h)
────────────────┼─────────────────┼─────────────────┼─────────────────┼─────────────
API Routes      | Middleware      | Frontend Comp.  | Frontend Forms  | Integration
/api/auth       | JWT validation  | PeopleManager   | VoluntarioForm  | End-to-end
/api/voluntar.  | Permissions     | VoluntariosTab  | NovoUsuario     | Debug fixes
/api/escalas    | Rate limiting   | DashboardStats  | EditarUsuario   | Performance
```

### **SEMANA 5** - Testes (40h)

```
Segunda (8h)    | Terça (8h)      | Quarta (8h)     | Quinta (8h)     | Sexta (8h)
────────────────┼─────────────────┼─────────────────┼─────────────────┼─────────────
Unit Tests      | Integration     | E2E Tests       | Performance     | Optimization
Service tests   | API tests       | Login/logout    | Query analysis  | Índices
Firebase compat | Auth tests      | Geração escalas | Slow queries    | Caching
Mock data       | Frontend tests  | Export dados    | Load testing    | Redis setup
```

### **SEMANA 6** - Deploy (40h)

```
Segunda (8h)    | Terça (8h)      | Quarta (8h)     | Quinta (8h)     | Sexta (8h)
────────────────┼─────────────────┼─────────────────┼─────────────────┼─────────────
Prod Setup      | Feature Flags   | Staging Deploy  | Prod Deploy     | Monitoring
Env variables   | Toggle Firebase | Smoke tests     | Gradual rollout | 24h monitoring
Connection pool | Rollback ready  | Load tests      | User feedback   | Bug fixes
SSL certs       | Backup system   | Final validat.  | Performance mon | Documentation
```

---

## 📋 Checklist de Tarefas por Categoria

### 🗄️ **Database & Schema**

- [ ] **T001** - Exportar schema atual do Firebase (2h)

  - Documentar coleções: `usuarios`, `igrejas`, `cargos`, `voluntarios`, `escalas`
  - Mapear relacionamentos implícitos
  - Identificar campos obrigatórios/opcionais

- [ ] **T002** - Criar ERD (Entity Relationship Diagram) (3h)

  - Usar ferramenta como dbdiagram.io ou Lucidchart
  - Definir relacionamentos 1:N, N:N
  - Validar com stakeholders

- [ ] **T003** - Configurar NeonDB (1h)

  - Criar projeto no Neon
  - Setup databases: `dev`, `staging`, `prod`
  - Configurar connection strings

- [ ] **T004** - Definir schema Prisma completo (6h)

  ```prisma
  // Estrutura completa com todos os models:
  model Usuario {
    id        String   @id @default(cuid())
    uid       String   @unique
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

  model Cargo {
    id          String   @id @default(cuid())
    nome        String
    descricao   String?
    criadoEm    DateTime @default(now())

    voluntarios Voluntario[]
    escalas     Escala[]
    @@map("cargos")
  }

  model Voluntario {
    id              String   @id @default(cuid())
    nome            String
    telefone        String
    igrejaId        String
    cargoId         String
    diasTrabalhados Int      @default(0)
    ultimaEscala    DateTime?
    criadoEm        DateTime @default(now())

    igreja          Igreja   @relation(fields: [igrejaId], references: [id])
    cargo           Cargo    @relation(fields: [cargoId], references: [id])
    disponibilidades Disponibilidade[]
    escalasVolunt   EscalaVoluntario[]

    @@map("voluntarios")
  }

  model Disponibilidade {
    id           String     @id @default(cuid())
    voluntarioId String
    diaSemana    DiaSemana
    disponivel   Boolean    @default(false)

    voluntario   Voluntario @relation(fields: [voluntarioId], references: [id], onDelete: Cascade)

    @@unique([voluntarioId, diaSemana])
    @@map("disponibilidades")
  }

  model Escala {
    id        String   @id @default(cuid())
    mes       Int
    ano       Int
    igrejaId  String
    cargoId   String
    criadoEm  DateTime @default(now())

    igreja    Igreja   @relation(fields: [igrejaId], references: [id])
    cargo     Cargo    @relation(fields: [cargoId], references: [id])
    dias      EscalaDia[]

    @@unique([mes, ano, igrejaId, cargoId])
    @@map("escalas")
  }

  model EscalaDia {
    id        String   @id @default(cuid())
    escalaId  String
    data      DateTime
    tipoCulto String

    escala    Escala   @relation(fields: [escalaId], references: [id], onDelete: Cascade)
    voluntarios EscalaVoluntario[]

    @@map("escala_dias")
  }

  model EscalaVoluntario {
    id          String      @id @default(cuid())
    escalaDiaId String
    voluntarioId String

    escalaDia   EscalaDia   @relation(fields: [escalaDiaId], references: [id], onDelete: Cascade)
    voluntario  Voluntario  @relation(fields: [voluntarioId], references: [id])

    @@unique([escalaDiaId, voluntarioId])
    @@map("escala_voluntarios")
  }

  enum DiaSemana {
    DOMINGO_RDJ
    DOMINGO
    SEGUNDA
    TERCA
    QUARTA
    QUINTA
    SEXTA
    SABADO
  }
  ```

### 🔄 **Data Migration**

- [ ] **T005** - Script de export Firebase (6h)

  ```typescript
  // scripts/exportFirebaseData.ts
  import { initializeApp } from "firebase/app";
  import { getFirestore, collection, getDocs } from "firebase/firestore";
  import * as fs from "fs";

  const firebaseConfig = {
    // config...
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  async function exportCollection(collectionName: string) {
    console.log(`Exportando ${collectionName}...`);
    const snapshot = await getDocs(collection(db, collectionName));
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      // Convert Timestamp to ISO string
      ...(doc.data().criadoEm && {
        criadoEm: doc.data().criadoEm.toDate().toISOString(),
      }),
      ...(doc.data().ultimaEscala && {
        ultimaEscala: doc.data().ultimaEscala.toDate().toISOString(),
      }),
    }));
    console.log(`${collectionName}: ${data.length} documentos`);
    return data;
  }

  async function main() {
    try {
      const exportData = {
        usuarios: await exportCollection("usuarios"),
        igrejas: await exportCollection("igrejas"),
        cargos: await exportCollection("cargos"),
        voluntarios: await exportCollection("voluntarios"),
        escalas: await exportCollection("escalas"),
        exportedAt: new Date().toISOString(),
      };

      fs.writeFileSync(
        "firebase-export.json",
        JSON.stringify(exportData, null, 2)
      );
      console.log("✅ Export completo!");

      // Estatísticas
      Object.entries(exportData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          console.log(`${key}: ${value.length} registros`);
        }
      });
    } catch (error) {
      console.error("❌ Erro no export:", error);
    }
  }

  main();
  ```

- [ ] **T006** - Script de transformação de dados (8h)

  ```typescript
  // scripts/transformData.ts
  import * as fs from "fs";
  import { v4 as uuidv4 } from "uuid";

  interface FirebaseExport {
    usuarios: any[];
    igrejas: any[];
    cargos: any[];
    voluntarios: any[];
    escalas: any[];
  }

  interface TransformedData {
    usuarios: any[];
    igrejas: any[];
    cargos: any[];
    voluntarios: any[];
    disponibilidades: any[];
    escalas: any[];
    escalaDias: any[];
    escalaVoluntarios: any[];
  }

  function transformVoluntarios(
    voluntarios: any[],
    igrejas: any[],
    cargos: any[]
  ) {
    const transformedVoluntarios = [];
    const disponibilidades = [];

    for (const vol of voluntarios) {
      // Verificar se igreja e cargo existem
      const igreja = igrejas.find((i) => i.id === vol.igrejaId);
      const cargo = cargos.find((c) => c.id === vol.cargoId);

      if (!igreja || !cargo) {
        console.warn(`Voluntário ${vol.nome} tem referência inválida`);
        continue;
      }

      transformedVoluntarios.push({
        id: vol.id,
        nome: vol.nome,
        telefone: vol.telefone,
        igrejaId: vol.igrejaId,
        cargoId: vol.cargoId,
        diasTrabalhados: vol.diasTrabalhados || 0,
        ultimaEscala: vol.ultimaEscala ? new Date(vol.ultimaEscala) : null,
        criadoEm: vol.criadoEm ? new Date(vol.criadoEm) : new Date(),
      });

      // Converter disponibilidades
      if (vol.disponibilidades) {
        const diasMap = {
          domingoRDJ: "DOMINGO_RDJ",
          domingo: "DOMINGO",
          segunda: "SEGUNDA",
          terca: "TERCA",
          quarta: "QUARTA",
          quinta: "QUINTA",
          sexta: "SEXTA",
          sabado: "SABADO",
        };

        Object.entries(diasMap).forEach(([firebaseKey, prismaEnum]) => {
          disponibilidades.push({
            id: uuidv4(),
            voluntarioId: vol.id,
            diaSemana: prismaEnum,
            disponivel: vol.disponibilidades[firebaseKey] || false,
          });
        });
      }
    }

    return { voluntarios: transformedVoluntarios, disponibilidades };
  }

  function transformEscalas(escalas: any[]) {
    const transformedEscalas = [];
    const escalaDias = [];
    const escalaVoluntarios = [];

    for (const escala of escalas) {
      const escalaId = escala.id;

      transformedEscalas.push({
        id: escalaId,
        mes: escala.mes,
        ano: escala.ano,
        igrejaId: escala.igrejaId,
        cargoId: escala.cargoId,
        criadoEm: new Date(escala.criadoEm),
      });

      if (escala.dias) {
        for (const dia of escala.dias) {
          const escalaDiaId = uuidv4();

          escalaDias.push({
            id: escalaDiaId,
            escalaId: escalaId,
            data: new Date(dia.data),
            tipoCulto: dia.tipoCulto,
          });

          if (dia.voluntarios) {
            for (const vol of dia.voluntarios) {
              escalaVoluntarios.push({
                id: uuidv4(),
                escalaDiaId: escalaDiaId,
                voluntarioId: vol.id,
              });
            }
          }
        }
      }
    }

    return { escalas: transformedEscalas, escalaDias, escalaVoluntarios };
  }

  async function main() {
    const firebaseData: FirebaseExport = JSON.parse(
      fs.readFileSync("firebase-export.json", "utf8")
    );

    // Transform data
    const { voluntarios, disponibilidades } = transformVoluntarios(
      firebaseData.voluntarios,
      firebaseData.igrejas,
      firebaseData.cargos
    );

    const { escalas, escalaDias, escalaVoluntarios } = transformEscalas(
      firebaseData.escalas
    );

    const transformedData: TransformedData = {
      usuarios: firebaseData.usuarios.map((u) => ({
        ...u,
        criadoEm: u.criadoEm ? new Date(u.criadoEm) : new Date(),
      })),
      igrejas: firebaseData.igrejas.map((i) => ({
        ...i,
        criadoEm: i.criadoEm ? new Date(i.criadoEm) : new Date(),
      })),
      cargos: firebaseData.cargos.map((c) => ({
        ...c,
        criadoEm: c.criadoEm ? new Date(c.criadoEm) : new Date(),
      })),
      voluntarios,
      disponibilidades,
      escalas,
      escalaDias,
      escalaVoluntarios,
    };

    fs.writeFileSync(
      "transformed-data.json",
      JSON.stringify(transformedData, null, 2)
    );
    console.log("✅ Transformação completa!");

    // Estatísticas
    Object.entries(transformedData).forEach(([key, value]) => {
      console.log(`${key}: ${value.length} registros`);
    });
  }

  main().catch(console.error);
  ```

- [ ] **T007** - Script de import para Prisma (4h)
- [ ] **T008** - Validação de integridade de dados (4h)
- [ ] **T009** - Setup de backup e rollback (2h)

### 🔧 **Services Refactoring**

- [ ] **T010** - Refatorar `voluntarioService.ts` (4h)
- [ ] **T011** - Refatorar `cargoService.ts` (2h)
- [ ] **T012** - Refatorar `igrejaService.ts` (2h)
- [ ] **T013** - Refatorar `porteiroService.ts` (2h)
- [ ] **T014** - Refatorar `escalaService.ts` (8h)
- [ ] **T015** - Refatorar `exportService.ts` (4h)

### 🔐 **Authentication**

- [ ] **T016** - Setup NextAuth.js (4h)
- [ ] **T017** - Migrar AuthContext (6h)
- [ ] **T018** - Atualizar usePermissions (2h)
- [ ] **T019** - Implementar recuperação de senha (3h)

### 🌐 **API & Frontend**

- [ ] **T020** - Criar API routes (8h)
- [ ] **T021** - Middleware de autenticação (3h)
- [ ] **T022** - Atualizar componentes (6h)
- [ ] **T023** - Atualizar formulários (4h)

### 🧪 **Testing**

- [ ] **T024** - Testes unitários services (8h)
- [ ] **T025** - Testes de integração (6h)
- [ ] **T026** - Testes E2E críticos (4h)
- [ ] **T027** - Testes de performance (4h)

### 🚀 **Deploy & Monitoring**

- [ ] **T028** - Setup ambiente produção (3h)
- [ ] **T029** - Feature flags (4h)
- [ ] **T030** - Deploy gradual (4h)
- [ ] **T031** - Monitoramento (4h)

---

## 📊 Resumo de Esforço

| Categoria         | Tarefas    | Horas    | % do Total |
| ----------------- | ---------- | -------- | ---------- |
| Database & Schema | T001-T004  | 12h      | 5%         |
| Data Migration    | T005-T009  | 24h      | 10%        |
| Services          | T010-T015  | 22h      | 9%         |
| Authentication    | T016-T019  | 15h      | 6%         |
| API & Frontend    | T020-T023  | 21h      | 9%         |
| Testing           | T024-T027  | 22h      | 9%         |
| Deploy            | T028-T031  | 15h      | 6%         |
| **Buffer/Debug**  | -          | 109h     | 46%        |
| **TOTAL**         | 31 tarefas | **240h** | **100%**   |

---

## 🎯 Milestones Críticos

### **MS1** - Schema Ready (Final Semana 2)

- ✅ NeonDB configurado
- ✅ Schema Prisma completo
- ✅ Primeira migração executada
- ✅ Dados migrados e validados

### **MS2** - Services Working (Final Semana 3)

- ✅ Todos os services refatorados
- ✅ Testes básicos passando
- ✅ AuthContext funcionando

### **MS3** - Frontend Ready (Final Semana 4)

- ✅ APIs funcionando
- ✅ Frontend conectado
- ✅ Funcionalidades principais testadas

### **MS4** - Production Ready (Final Semana 6)

- ✅ Todos os testes passando
- ✅ Deploy em produção
- ✅ Monitoramento ativo
- ✅ Performance validada

---

## 🚨 Pontos de Atenção

### **Críticos**

1. **Backup Firebase** - Fazer antes de qualquer mudança
2. **Validação de dados** - Não pode haver perda de informação
3. **Downtime** - Minimizar ao máximo (< 2h)
4. **Rollback** - Estar sempre pronto para reverter

### **Importante**

1. **Performance** - PostgreSQL deve ser mais rápido que Firebase
2. **Type Safety** - Aproveitar ao máximo o TypeScript
3. **Testes** - Coverage > 80% para código crítico
4. **Documentação** - Atualizar toda documentação técnica
