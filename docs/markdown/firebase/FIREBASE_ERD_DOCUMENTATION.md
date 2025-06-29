# Diagrama de Entidade-Relacionamento (ERD) - Firebase Schema

## 📋 Informações Gerais

**Ferramenta Utilizada:** [dbdiagram.io](https://dbdiagram.io)  
**Notação:** Crow's Foot (Pé de Galinha)  
**Projeto:** Sistema de Gestão de Voluntários para Igrejas  
**Versão:** 1.0  
**Data:** ${new Date().toLocaleDateString('pt-BR')}

---

## 🎯 Justificativa da Ferramenta

### Por que dbdiagram.io?

1. **✅ Gratuita e Acessível** - Não requer licença paga
2. **✅ Sintaxe Simples** - DBML (Database Markup Language) intuitiva
3. **✅ Versionamento** - Código pode ser versionado no Git
4. **✅ Exportação Múltipla** - PNG, PDF, SQL DDL
5. **✅ Compartilhamento Fácil** - Link direto para stakeholders
6. **✅ Notação Padrão** - Crow's Foot amplamente reconhecida
7. **✅ Documentação Embarcada** - Notas e comentários no código

---

## 🏗️ Estrutura das Entidades

### 1. **usuarios** 👥

**Descrição:** Usuários do sistema (administradores e usuários regulares)

| Atributo     | Tipo      | Restrições               | Descrição                       |
| ------------ | --------- | ------------------------ | ------------------------------- |
| `uid`        | varchar   | PK, Unique               | Firebase Auth UID (document ID) |
| `nome`       | varchar   | NOT NULL                 | Nome completo do usuário        |
| `email`      | varchar   | NOT NULL, Unique         | Email único do usuário          |
| `isAdmin`    | boolean   | NOT NULL, Default: false | Indica se é administrador       |
| `created_at` | timestamp | Default: now()           | Data de criação                 |

### 2. **igrejas** ⛪

**Descrição:** Igrejas e seus horários de culto

| Atributo          | Tipo      | Restrições               | Descrição                        |
| ----------------- | --------- | ------------------------ | -------------------------------- |
| `id`              | varchar   | PK, Unique               | ID único da igreja (document ID) |
| `nome`            | varchar   | NOT NULL                 | Nome da igreja                   |
| `cultoDomingoRDJ` | boolean   | NOT NULL, Default: false | Culto domingo RDJ                |
| `cultoDomingo`    | boolean   | NOT NULL, Default: false | Culto domingo regular            |
| `cultoSegunda`    | boolean   | NOT NULL, Default: false | Culto segunda-feira              |
| `cultoTerca`      | boolean   | NOT NULL, Default: false | Culto terça-feira                |
| `cultoQuarta`     | boolean   | NOT NULL, Default: false | Culto quarta-feira               |
| `cultoQuinta`     | boolean   | NOT NULL, Default: false | Culto quinta-feira               |
| `cultoSexta`      | boolean   | NOT NULL, Default: false | Culto sexta-feira                |
| `cultoSabado`     | boolean   | NOT NULL, Default: false | Culto sábado                     |
| `created_at`      | timestamp | Default: now()           | Data de criação                  |

### 3. **cargos** 💼

**Descrição:** Tipos de cargo/função que voluntários exercem

| Atributo     | Tipo      | Restrições              | Descrição                       |
| ------------ | --------- | ----------------------- | ------------------------------- |
| `id`         | varchar   | PK, Unique              | ID único do cargo (document ID) |
| `nome`       | varchar   | NOT NULL                | Nome do cargo                   |
| `descricao`  | text      | NOT NULL                | Descrição detalhada do cargo    |
| `ativo`      | boolean   | NOT NULL, Default: true | Indica se o cargo está ativo    |
| `created_at` | timestamp | Default: now()          | Data de criação                 |

### 4. **voluntarios** 🙋‍♀️

**Descrição:** Voluntários e suas informações básicas

| Atributo          | Tipo      | Restrições     | Descrição                            |
| ----------------- | --------- | -------------- | ------------------------------------ |
| `id`              | varchar   | PK, Unique     | ID único do voluntário (document ID) |
| `nome`            | varchar   | NOT NULL       | Nome completo do voluntário          |
| `telefone`        | varchar   | NOT NULL       | Telefone formatado (11) 99999-9999   |
| `igrejaId`        | varchar   | NOT NULL, FK   | FK: Igreja do voluntário             |
| `igrejaNome`      | varchar   | NOT NULL       | Nome da igreja (desnormalizado)      |
| `cargoId`         | varchar   | NOT NULL, FK   | FK: Cargo do voluntário              |
| `cargoNome`       | varchar   | NOT NULL       | Nome do cargo (desnormalizado)       |
| `diasTrabalhados` | integer   | Default: 0     | Contador de dias trabalhados         |
| `ultimaEscala`    | timestamp | NULL           | Data da última escala                |
| `created_at`      | timestamp | Default: now() | Data de criação                      |

### 5. **disponibilidades** 📅

**Descrição:** Disponibilidades dos voluntários por dia da semana

| Atributo       | Tipo    | Restrições               | Descrição                   |
| -------------- | ------- | ------------------------ | --------------------------- |
| `id`           | varchar | PK, Unique               | ID único da disponibilidade |
| `voluntarioId` | varchar | NOT NULL, FK             | FK: Voluntário              |
| `domingoRDJ`   | boolean | NOT NULL, Default: false | Disponível domingo RDJ      |
| `domingo`      | boolean | NOT NULL, Default: false | Disponível domingo          |
| `segunda`      | boolean | NOT NULL, Default: false | Disponível segunda-feira    |
| `terca`        | boolean | NOT NULL, Default: false | Disponível terça-feira      |
| `quarta`       | boolean | NOT NULL, Default: false | Disponível quarta-feira     |
| `quinta`       | boolean | NOT NULL, Default: false | Disponível quinta-feira     |
| `sexta`        | boolean | NOT NULL, Default: false | Disponível sexta-feira      |
| `sabado`       | boolean | NOT NULL, Default: false | Disponível sábado           |

### 6. **escalas** 📊

**Descrição:** Escalas mensais por igreja e cargo

| Atributo   | Tipo      | Restrições               | Descrição                        |
| ---------- | --------- | ------------------------ | -------------------------------- |
| `id`       | varchar   | PK, Unique               | ID único da escala (document ID) |
| `mes`      | integer   | NOT NULL                 | Mês da escala (1-12)             |
| `ano`      | integer   | NOT NULL                 | Ano da escala                    |
| `igrejaId` | varchar   | NOT NULL, FK             | FK: Igreja da escala             |
| `cargoId`  | varchar   | NOT NULL, FK             | FK: Cargo da escala              |
| `criadoEm` | timestamp | NOT NULL, Default: now() | Data/hora de criação             |

**Índices:**

- `idx_escala_unica`: (mes, ano, igrejaId, cargoId) - UNIQUE
- `idx_escala_igreja_cargo`: (igrejaId, cargoId)

### 7. **escala_dias** 📋

**Descrição:** Dias específicos dentro de uma escala mensal

| Atributo    | Tipo      | Restrições   | Descrição                             |
| ----------- | --------- | ------------ | ------------------------------------- |
| `id`        | varchar   | PK, Unique   | ID único do dia de escala             |
| `escalaId`  | varchar   | NOT NULL, FK | FK: Escala                            |
| `data`      | timestamp | NOT NULL     | Data específica do dia                |
| `tipoCulto` | varchar   | NOT NULL     | Tipo de culto: domingo, segunda, etc. |

**Índices:**

- `idx_escala_dia_unico`: (escalaId, data) - UNIQUE

### 8. **escala_voluntarios** 👷‍♀️

**Descrição:** Voluntários escalados para dias específicos

| Atributo         | Tipo    | Restrições   | Descrição                           |
| ---------------- | ------- | ------------ | ----------------------------------- |
| `id`             | varchar | PK, Unique   | ID único da escalação               |
| `escalaDiaId`    | varchar | NOT NULL, FK | FK: Dia da escala                   |
| `voluntarioId`   | varchar | NOT NULL, FK | FK: Voluntário                      |
| `voluntarioNome` | varchar | NOT NULL     | Nome do voluntário (desnormalizado) |

**Índices:**

- `idx_escala_voluntario_unico`: (escalaDiaId, voluntarioId) - UNIQUE

---

## 🔗 Relacionamentos e Cardinalidade

### **1. usuarios ↔ igrejas** (Many-to-Many)

- **Tabela Intermediária:** `usuario_igrejas`
- **Cardinalidade:** M:N
- **Regra de Negócio:** Um usuário pode gerenciar múltiplas igrejas, e uma igreja pode ser gerenciada por múltiplos usuários
- **Opcionalidade:**
  - Igreja: DEVE ter pelo menos 1 usuário administrador
  - Usuário: PODE gerenciar 0 ou mais igrejas

### **2. usuarios ↔ cargos** (Many-to-Many)

- **Tabela Intermediária:** `usuario_cargos`
- **Cardinalidade:** M:N
- **Regra de Negócio:** Um usuário pode gerenciar múltiplos cargos, e um cargo pode ser gerenciado por múltiplos usuários
- **Opcionalidade:**
  - Cargo: DEVE ter pelo menos 1 usuário que pode gerenciá-lo
  - Usuário: PODE gerenciar 0 ou mais cargos

### **3. voluntarios → igrejas** (Many-to-One)

- **Campo de Ligação:** `voluntarios.igrejaId`
- **Cardinalidade:** N:1
- **Regra de Negócio:** Cada voluntário pertence a UMA igreja específica
- **Opcionalidade:**
  - Igreja: PODE ter 0 ou mais voluntários
  - Voluntário: DEVE pertencer a 1 igreja (obrigatório)

### **4. voluntarios → cargos** (Many-to-One)

- **Campo de Ligação:** `voluntarios.cargoId`
- **Cardinalidade:** N:1
- **Regra de Negócio:** Cada voluntário exerce UM cargo específico
- **Opcionalidade:**
  - Cargo: PODE ter 0 ou mais voluntários
  - Voluntário: DEVE ter 1 cargo (obrigatório)

### **5. voluntarios ← disponibilidades** (One-to-One)

- **Campo de Ligação:** `disponibilidades.voluntarioId`
- **Cardinalidade:** 1:1
- **Regra de Negócio:** Cada voluntário tem UMA configuração de disponibilidade
- **Opcionalidade:**
  - Voluntário: PODE ter disponibilidade (opcional para novos voluntários)
  - Disponibilidade: DEVE pertencer a 1 voluntário

### **6. escalas → igrejas** (Many-to-One)

- **Campo de Ligação:** `escalas.igrejaId`
- **Cardinalidade:** N:1
- **Regra de Negócio:** Cada escala pertence a UMA igreja específica
- **Opcionalidade:**
  - Igreja: PODE ter 0 ou mais escalas
  - Escala: DEVE pertencer a 1 igreja (obrigatório)

### **7. escalas → cargos** (Many-to-One)

- **Campo de Ligação:** `escalas.cargoId`
- **Cardinalidade:** N:1
- **Regra de Negócio:** Cada escala é específica para UM cargo
- **Opcionalidade:**
  - Cargo: PODE ter 0 ou mais escalas
  - Escala: DEVE ser para 1 cargo (obrigatório)

### **8. escalas ← escala_dias** (One-to-Many)

- **Campo de Ligação:** `escala_dias.escalaId`
- **Cardinalidade:** 1:N
- **Regra de Negócio:** Uma escala mensal tem múltiplos dias
- **Opcionalidade:**
  - Escala: DEVE ter pelo menos 1 dia
  - Dia: DEVE pertencer a 1 escala

### **9. escala_dias ↔ voluntarios** (Many-to-Many)

- **Tabela Intermediária:** `escala_voluntarios`
- **Cardinalidade:** M:N
- **Regra de Negócio:** Um dia pode ter múltiplos voluntários, um voluntário pode estar em múltiplos dias
- **Opcionalidade:**
  - Dia: PODE ter 0 ou mais voluntários
  - Voluntário: PODE estar em 0 ou mais dias

---

## 📐 Notação Utilizada (Crow's Foot)

| Símbolo | Significado             | Exemplo                         |
| ------- | ----------------------- | ------------------------------- |
| `\|\|`  | Um (1)                  | Lado "Um" do relacionamento     |
| `}o`    | Muitos (N)              | Lado "Muitos" do relacionamento |
| `--`    | Linha de relacionamento | Conecta entidades               |
| `o`     | Opcional (0)            | Pode ser zero                   |
| `\|`    | Obrigatório (1)         | Deve ser pelo menos um          |

### Exemplos de Leitura:

- `usuarios \|\|--o{ igrejas` = "Um usuário pode gerenciar zero ou muitas igrejas"
- `voluntarios }o--\|\| igrejas` = "Muitos voluntários pertencem a uma igreja obrigatoriamente"

---

## 🔍 Processo de Validação do ERD

### **Fase 1: Validação Técnica** ✅

**Responsáveis:** Equipe de Desenvolvimento  
**Prazo:** 3 dias úteis

**Checklist:**

- [ ] Verificar se todas as entidades do Firebase estão representadas
- [ ] Confirmar que os tipos de dados estão corretos
- [ ] Validar cardinalidades dos relacionamentos
- [ ] Verificar se as chaves primárias e estrangeiras estão definidas
- [ ] Confirmar índices para performance
- [ ] Testar se o ERD atende aos requisitos funcionais

### **Fase 2: Validação de Negócio** 📋

**Responsáveis:** Product Owner, Líderes de Igreja, Coordenadores  
**Prazo:** 5 dias úteis

**Metodologia:**

1. **Apresentação do ERD** (60 min)

   - Explicação das entidades e relacionamentos
   - Demonstração de cenários de uso
   - Q&A com stakeholders

2. **Workshop de Validação** (120 min)

   - Cenários práticos de uso
   - Simulação de processos de negócio
   - Identificação de lacunas ou inconsistências

3. **Revisão de Regras de Negócio** (90 min)
   - Verificação de cardinalidades
   - Confirmação de campos obrigatórios/opcionais
   - Validação de restrições e constraints

**Stakeholders:**

- 👨‍💼 **Product Owner** - Validação geral do produto
- ⛪ **Líderes de Igreja** - Regras de negócio eclesiásticas
- 👥 **Coordenadores de Voluntários** - Processos operacionais
- 💻 **Equipe de Desenvolvimento** - Viabilidade técnica

### **Fase 3: Coleta de Feedback** 📝

**Ferramenta:** GitHub Issues / Jira  
**Template de Feedback:**

```markdown
## Feedback ERD - [Nome do Stakeholder]

### Entidade: [Nome da Entidade]

**Problema/Sugestão:**
**Impacto:** Alto/Médio/Baixo
**Justificativa:**
**Proposta de Solução:**

### Relacionamento: [Entidade A] ↔ [Entidade B]

**Problema/Sugestão:**
**Cardinalidade Atual:**
**Cardinalidade Proposta:**
**Justificativa:**
```

---

## 📋 Sub-Issue: Registro de Feedback e Ajustes

### **Issue Principal:** `ERD-001: Validação do Diagrama de Entidade-Relacionamento`

**Sub-Issues:**

#### **ERD-001.1: Validação Técnica**

- **Assignee:** Tech Lead
- **Labels:** `validation`, `technical`, `high-priority`
- **Due Date:** +3 dias
- **Tasks:**
  - [ ] Revisar mapeamento Firebase → ERD
  - [ ] Validar tipos de dados
  - [ ] Confirmar relacionamentos
  - [ ] Testar consultas complexas
  - [ ] Documentar findings técnicos

#### **ERD-001.2: Workshop de Validação com Stakeholders**

- **Assignee:** Product Owner
- **Labels:** `validation`, `business`, `workshop`
- **Due Date:** +5 dias
- **Tasks:**
  - [ ] Agendar workshop (2h)
  - [ ] Preparar apresentação do ERD
  - [ ] Conduzir sessão de validação
  - [ ] Documentar feedback recebido
  - [ ] Priorizar mudanças solicitadas

#### **ERD-001.3: Implementação de Ajustes**

- **Assignee:** Database Designer
- **Labels:** `implementation`, `adjustments`
- **Due Date:** +2 dias após feedback
- **Tasks:**
  - [ ] Analisar feedback coletado
  - [ ] Implementar ajustes no ERD
  - [ ] Atualizar documentação
  - [ ] Regenerar diagramas
  - [ ] Comunicar mudanças para equipe

#### **ERD-001.4: Validação Final**

- **Assignee:** Product Owner + Tech Lead
- **Labels:** `validation`, `final-review`
- **Due Date:** +1 dia após ajustes
- **Tasks:**
  - [ ] Revisar ERD atualizado
  - [ ] Confirmar atendimento aos requisitos
  - [ ] Aprovar para implementação
  - [ ] Fechar processo de validação

### **Template de Documentação de Feedback:**

```markdown
# Feedback ERD - Sessão [Data]

## Participantes

- [ ] Product Owner
- [ ] Tech Lead
- [ ] Líder Igreja A
- [ ] Líder Igreja B
- [ ] Coordenador Voluntários

## Feedback Coletado

### ✅ Pontos Aprovados

1. Estrutura geral das entidades
2. Relacionamentos principais
3. Campos obrigatórios identificados

### ⚠️ Pontos de Atenção

1. **Entidade X:** Necessita campo Y para processo Z
2. **Relacionamento A-B:** Cardinalidade precisa ser revista
3. **Performance:** Índices adicionais podem ser necessários

### 🔄 Mudanças Solicitadas

| Item                                         | Prioridade | Responsável | Prazo |
| -------------------------------------------- | ---------- | ----------- | ----- |
| Adicionar campo `observacoes` em voluntarios | Alta       | Tech Lead   | 2d    |
| Revisar cardinalidade escalas-voluntarios    | Média      | Designer    | 1d    |
| Criar índice composto para consultas         | Baixa      | DBA         | 3d    |

## Próximos Passos

1. [ ] Implementar mudanças prioritárias
2. [ ] Agendar revisão final (data)
3. [ ] Comunicar aprovação para desenvolvimento
```

---

## 🔗 Links e Recursos

### **Diagrama Online:**

- **dbdiagram.io:** [Link do diagrama](https://dbdiagram.io/d) _(substituir pelo link real)_
- **Código DBML:** `firebase-erd-schema.dbml` (neste repositório)

### **Exports Disponíveis:**

- 🖼️ **PNG:** `docs/images/firebase-erd-diagram.png`
- 📄 **PDF:** `docs/firebase-erd-diagram.pdf`
- 💾 **SQL DDL:** `docs/firebase-erd-schema.sql`

### **Documentação Relacionada:**

- 📋 **Schema Firebase:** `FIREBASE_SCHEMA_DOCUMENTATION.md`
- 🔧 **Guia de Implementação:** `IMPLEMENTATION_GUIDE.md`
- 📚 **Manual do Usuário:** `USER_MANUAL.md`

---

## 📊 Métricas de Validação

### **KPIs do Processo:**

- ✅ **Taxa de Participação:** 100% dos stakeholders críticos
- ⏱️ **Tempo de Validação:** ≤ 10 dias úteis
- 🔄 **Ciclos de Revisão:** ≤ 3 iterações
- 📝 **Issues Resolvidas:** 100% das críticas e 80% das melhorias
- 👍 **Aprovação Final:** Consenso de todos os stakeholders

### **Critérios de Sucesso:**

1. **Completude:** ERD representa 100% das entidades do sistema
2. **Precisão:** Relacionamentos refletem regras de negócio reais
3. **Performance:** Índices atendem consultas mais frequentes
4. **Manutenibilidade:** Estrutura permite evolução futura
5. **Aprovação:** Sign-off de todos os stakeholders críticos

---

_Documentação gerada automaticamente em: ${new Date().toLocaleDateString('pt-BR')}_  
_Versão: 1.0_  
_Autor: Sistema de Documentação Automática_
