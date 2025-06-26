# 📋 Atividades: Sistema de Regras de Escala

## 🎯 Objetivo

Implementar um sistema flexível de regras de negócio para geração automática de escalas, permitindo configurar:

- Regras por tipo de culto/reunião
- Regras por função (abrir igreja, pedido de oração)
- Regras por voluntário (disponibilidades específicas)
- Sistema de intercalamento automático

---

## 🔧 **FASE 1: Modelagem das Regras** (8h)

### 1.1 Análise das Regras Identificadas

**Tipos de Culto/Reunião:**

- Reunião de Jovens/Menores
- Terça-feira (Culto regular)
- Ensaio Local
- Sábado (Culto regular)

**Funções:**

- Abrir Igreja
- Pedido de Oração

**Regras Específicas Mapeadas:**

1. **Reunião Jovens/Menores**: Fábio + Antônio (abrir + pedido)
2. **Terça-feira**: Joel + Paulo (abrir + pedido)
3. **Ensaio Local**: Joel + Paulo (abrir + pedido)
4. **Sábado**: Reginaldo + Nelson + Marcelo P. (abrir)
5. **Intercalamento**: Grupo específico entre sábado/terça
6. **Restrições**: Fábio (só jovens), Joel/Paulo (só terça/ensaio), Silvano (só sábado/pedido)

### 1.2 Extensão do Schema Prisma (4h)

- [ ] **A1.1** Criar tabelas para regras de escala

  ```prisma
  model TipoCulto {
    id          String   @id @default(cuid())
    nome        String   @unique // "Reunião Jovens", "Terça-feira", "Ensaio", "Sábado"
    descricao   String?
    diaSemana   DiaSemana
    horario     String?
    ativo       Boolean  @default(true)
    criadoEm    DateTime @default(now())

    regras      RegraEscala[]
    escalas     Escala[]

    @@map("tipos_culto")
  }

  model Funcao {
    id          String   @id @default(cuid())
    nome        String   @unique // "Abrir Igreja", "Pedido Oração"
    descricao   String?
    obrigatoria Boolean  @default(true)
    maxPessoas  Int      @default(1)
    criadoEm    DateTime @default(now())

    regras      RegraEscala[]

    @@map("funcoes")
  }

  model RegraEscala {
    id            String   @id @default(cuid())
    nome          String   // "Regra Jovens", "Regra Terça"
    descricao     String?
    tipoCultoId   String
    funcaoId      String
    prioridade    Int      @default(0) // Ordem de aplicação
    ativo         Boolean  @default(true)
    criadoEm      DateTime @default(now())

    tipoCulto     TipoCulto @relation(fields: [tipoCultoId], references: [id])
    funcao        Funcao    @relation(fields: [funcaoId], references: [id])
    voluntarios   RegraVoluntario[]

    @@unique([tipoCultoId, funcaoId])
    @@map("regras_escala")
  }

  model RegraVoluntario {
    id            String   @id @default(cuid())
    regraId       String
    voluntarioId  String
    tipoRegra     TipoRegraVoluntario // FIXO, INTERCALA, RESTRITO
    ordem         Int?     // Para intercalamento
    obrigatorio   Boolean  @default(false)

    regra         RegraEscala @relation(fields: [regraId], references: [id], onDelete: Cascade)
    voluntario    Voluntario  @relation(fields: [voluntarioId], references: [id])

    @@unique([regraId, voluntarioId])
    @@map("regras_voluntarios")
  }

  enum TipoRegraVoluntario {
    FIXO        // Sempre escalado
    INTERCALA   // Intercala com outros
    RESTRITO    // Só neste tipo de culto
    EXCLUIDO    // Nunca escalado
  }
  ```

### 1.3 Atualizar Models Existentes (2h)

- [ ] **A1.2** Adicionar relacionamentos ao Voluntario

  ```prisma
  model Voluntario {
    // ... campos existentes
    regrasVoluntario RegraVoluntario[]
  }

  model Escala {
    // ... campos existentes
    tipoCultoId String
    tipoCulto   TipoCulto @relation(fields: [tipoCultoId], references: [id])
  }
  ```

### 1.4 Migration e Seed (2h)

- [ ] **A1.3** Criar migration para novas tabelas
- [ ] **A1.4** Criar seed com dados iniciais das regras

---

## 🏗️ **FASE 2: Interface de Configuração** (12h)

### 2.1 Páginas de Administração (6h)

- [ ] **A2.1** Página de Tipos de Culto (`/admin/tipos-culto`)

  - CRUD completo
  - Associar com dias da semana
  - Configurar horários

- [ ] **A2.2** Página de Funções (`/admin/funcoes`)
  - CRUD de funções
  - Configurar número máximo de pessoas por função

### 2.2 Configurador de Regras (6h)

- [ ] **A2.3** Página principal de regras (`/admin/regras-escala`)

  ```typescript
  // Componente RegraEscalaForm.tsx
  interface RegraConfig {
    tipoCulto: string;
    funcao: string;
    voluntarios: {
      id: string;
      nome: string;
      tipo: "FIXO" | "INTERCALA" | "RESTRITO";
      ordem?: number;
    }[];
  }
  ```

- [ ] **A2.4** Interface visual de configuração
  - Drag & drop para ordenar voluntários
  - Toggle para tipos de regra
  - Preview da escala gerada
  - Validação de conflitos

---

## 🧠 **FASE 3: Engine de Geração** (16h)

### 3.1 Serviço de Regras (8h)

- [ ] **A3.1** Criar `regraEscalaService.ts`

  ```typescript
  export interface RegraEscalaService {
    // Buscar regras aplicáveis
    buscarRegras(tipoCulto: string, funcao: string): Promise<RegraEscala[]>;

    // Aplicar regras para gerar escala
    aplicarRegras(
      data: Date,
      tipoCulto: string,
      igrejaId: string
    ): Promise<EscalaGerada>;

    // Validar conflitos
    validarRegras(regras: RegraEscala[]): ValidationResult;

    // Intercalamento automático
    calcularIntercalamento(
      voluntarios: Voluntario[],
      ultimasEscalas: Escala[]
    ): Voluntario[];
  }

  interface EscalaGerada {
    data: Date;
    tipoCulto: TipoCulto;
    alocacoes: {
      funcao: Funcao;
      voluntarios: Voluntario[];
      regraAplicada: RegraEscala;
    }[];
  }
  ```

### 3.2 Algoritmo de Intercalamento (4h)

- [ ] **A3.2** Implementar lógica de intercalamento
  ```typescript
  class IntercalamentoEngine {
    calcular(
      voluntariosDisponiveis: Voluntario[],
      historicoEscalas: Escala[],
      dataAlvo: Date
    ): Voluntario[] {
      // 1. Buscar última participação de cada voluntário
      // 2. Calcular "peso" baseado em frequência
      // 3. Priorizar quem participou menos recentemente
      // 4. Respeitar intervalos mínimos entre participações
      // 5. Balancear carga entre voluntários
    }
  }
  ```

### 3.3 Validador de Regras (4h)

- [ ] **A3.3** Sistema de validação
  ```typescript
  class ValidadorRegras {
    validar(regras: RegraEscala[]): ValidationResult {
      // Verificar conflitos:
      // - Voluntário em múltiplas funções simultâneas
      // - Regras contraditórias
      // - Disponibilidade vs restrições
      // - Número mínimo/máximo por função
    }
  }
  ```

---

## 🔄 **FASE 4: Integração com Escala Existente** (8h)

### 4.1 Refatorar EscalaService (6h)

- [ ] **A4.1** Integrar sistema de regras no `escalaService.ts`

  ```typescript
  class EscalaService {
    async gerarEscala(
      periodo: { inicio: Date; fim: Date },
      igrejaId: string,
      cargoId: string
    ): Promise<Escala[]> {
      const diasCulto = await this.buscarDiasCulto(igrejaId);
      const escalasGeradas = [];

      for (const dia of diasCulto) {
        // 1. Identificar tipo de culto para o dia
        const tipoCulto = await this.identificarTipoCulto(dia);

        // 2. Buscar regras aplicáveis
        const regras = await this.regraService.buscarRegras(tipoCulto.id);

        // 3. Aplicar regras para gerar alocações
        const escalaGerada = await this.regraService.aplicarRegras(
          dia.data,
          tipoCulto.id,
          igrejaId
        );

        escalasGeradas.push(escalaGerada);
      }

      return escalasGeradas;
    }
  }
  ```

### 4.2 Componente de Visualização (2h)

- [ ] **A4.2** Atualizar `SchedulePDF.tsx` para mostrar funções
- [ ] **A4.3** Adicionar legenda de cores por função

---

## 🎨 **FASE 5: Interface do Usuário** (8h)

### 5.1 Dashboard de Regras (4h)

- [ ] **A5.1** Card de resumo das regras ativas
- [ ] **A5.2** Indicadores de conflitos/alertas
- [ ] **A5.3** Quick actions para ativar/desativar regras

### 5.2 Gerador com Preview (4h)

- [ ] **A5.4** Botão "Preview Escala" antes de gerar
- [ ] **A5.5** Modal mostrando alocações por função
- [ ] **A5.6** Possibilidade de ajustes manuais antes de confirmar

---

## 🧪 **FASE 6: Testes das Regras** (6h)

### 6.1 Testes Unitários (4h)

- [ ] **A6.1** Testes do RegraEscalaService

  ```typescript
  describe("RegraEscalaService", () => {
    it("deve aplicar regra fixa corretamente", async () => {
      // Setup: Regra "Fábio + Antônio para Jovens"
      // Test: Gerar escala para reunião de jovens
      // Assert: Fábio e Antônio escalados
    });

    it("deve intercalar voluntários corretamente", async () => {
      // Setup: Grupo de intercalamento
      // Test: Gerar múltiplas escalas
      // Assert: Intercalamento balanceado
    });

    it("deve respeitar restrições de voluntários", async () => {
      // Setup: Silvano só sábado
      // Test: Tentar escalar em terça
      // Assert: Silvano não escalado
    });
  });
  ```

### 6.2 Testes de Integração (2h)

- [ ] **A6.2** Teste completo de geração de escala mensal
- [ ] **A6.3** Teste de conflitos e validações

---

## 🚀 **FASE 7: Deploy e Configuração Inicial** (4h)

### 7.1 Configuração das Regras Atuais (3h)

- [ ] **A7.1** Cadastrar tipos de culto

  ```sql
  INSERT INTO tipos_culto (nome, dia_semana) VALUES
  ('Reunião Jovens', 'DOMINGO'),
  ('Terça-feira', 'TERCA'),
  ('Ensaio Local', 'QUINTA'),
  ('Sábado', 'SABADO');
  ```

- [ ] **A7.2** Cadastrar funções

  ```sql
  INSERT INTO funcoes (nome, max_pessoas) VALUES
  ('Abrir Igreja', 2),
  ('Pedido Oração', 1);
  ```

- [ ] **A7.3** Configurar regras específicas baseadas nos requisitos

### 7.2 Documentação (1h)

- [ ] **A7.4** Manual de configuração de regras
- [ ] **A7.5** Troubleshooting de conflitos comuns

---

## 📊 **Resumo de Esforço**

| Fase      | Atividades        | Horas   | Descrição              |
| --------- | ----------------- | ------- | ---------------------- |
| 1         | A1.1 - A1.4       | 8h      | Modelagem e schema     |
| 2         | A2.1 - A2.4       | 12h     | Interface configuração |
| 3         | A3.1 - A3.3       | 16h     | Engine de geração      |
| 4         | A4.1 - A4.3       | 8h      | Integração existente   |
| 5         | A5.1 - A5.6       | 8h      | Interface usuário      |
| 6         | A6.1 - A6.3       | 6h      | Testes                 |
| 7         | A7.1 - A7.5       | 4h      | Deploy e config        |
| **TOTAL** | **25 atividades** | **62h** | **~2 semanas**         |

---

## 🎯 **Exemplos de Configuração**

### Regra 1: Reunião de Jovens

```json
{
  "nome": "Jovens - Abrir Igreja",
  "tipoCulto": "Reunião Jovens",
  "funcao": "Abrir Igreja",
  "voluntarios": [
    { "nome": "Fábio", "tipo": "FIXO" },
    { "nome": "Antônio", "tipo": "FIXO" }
  ]
}
```

### Regra 2: Intercalamento Sábado/Terça

```json
{
  "nome": "Intercalamento Geral",
  "tipoCulto": ["Sábado", "Terça-feira"],
  "funcao": "Pedido Oração",
  "voluntarios": [
    { "nome": "Silvano", "tipo": "RESTRITO", "dias": ["SABADO"] },
    { "nome": "Antônio Ferreira", "tipo": "INTERCALA", "ordem": 1 },
    { "nome": "Reginaldo", "tipo": "INTERCALA", "ordem": 2 },
    { "nome": "Fernando", "tipo": "INTERCALA", "ordem": 3 }
  ]
}
```

---

## ⚠️ **Pontos de Atenção**

### Complexidades Identificadas

1. **Múltiplas regras por culto**: Um culto pode ter regras para "abrir" e "pedido"
2. **Conflitos de voluntários**: Mesmo voluntário em regras diferentes
3. **Intercalamento justo**: Balancear participação ao longo do tempo
4. **Restrições específicas**: Alguns voluntários só em determinados cultos

### Estratégias de Resolução

1. **Prioridade de regras**: Sistema de prioridades para resolver conflitos
2. **Validação prévia**: Alertas antes de aplicar regras conflitantes
3. **Override manual**: Possibilidade de ajuste manual quando necessário
4. **Histórico inteligente**: Considerar participações anteriores no intercalamento

**Esta implementação permitirá configurar as regras de forma flexível, sem hardcoding de nomes, e com possibilidade de ajustes futuros conforme as necessidades da igreja evoluam.**
