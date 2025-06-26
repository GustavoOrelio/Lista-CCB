# 📚 Documentação Técnica - Sistema de Gestão de Voluntários

Esta pasta contém toda a documentação técnica do sistema de gestão de voluntários para igrejas, **organizada por categoria** para facilitar navegação e manutenção.

---

## 📁 Estrutura da Documentação

### 🔥 **Firebase & ERD** [`./firebase/`](./firebase/)

Documentação completa do schema Firebase e diagramas de relacionamento de entidades.

| Arquivo                                                                              | Descrição                                                                                 | Tamanho | Última Atualização |
| ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- | ------- | ------------------ |
| 📋 [`FIREBASE_SCHEMA_DOCUMENTATION.md`](./firebase/FIREBASE_SCHEMA_DOCUMENTATION.md) | **Documentação completa do schema** - Estrutura detalhada de todas as 5 coleções Firebase | 18KB    | 25/06/2025         |
| 🔧 [`firebase-erd-schema.dbml`](./firebase/firebase-erd-schema.dbml)                 | **Código DBML do ERD** - Schema técnico para dbdiagram.io                                 | 7.5KB   | 25/06/2025         |
| 🎯 [`ERD_EXECUTIVE_SUMMARY.md`](./firebase/ERD_EXECUTIVE_SUMMARY.md)                 | **Resumo executivo do ERD** - Visão geral para stakeholders                               | 7.6KB   | 25/06/2025         |
| 📐 [`FIREBASE_ERD_DOCUMENTATION.md`](./firebase/FIREBASE_ERD_DOCUMENTATION.md)       | **Documentação técnica do ERD** - Relacionamentos, cardinalidades e processo de validação | 18KB    | 25/06/2025         |

### 📦 **Migração & Atividades** [`./migration/`](./migration/)

Documentação de processos de migração e regras de negócio do sistema.

| Arquivo                                                                     | Descrição                                                          | Tamanho | Última Atualização |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------- | ------------------ |
| 📋 [`MIGRATION_PLAN.md`](./migration/MIGRATION_PLAN.md)                     | **Plano de migração** - Estratégia completa de migração do sistema | ~13KB   | _(anterior)_       |
| ✅ [`MIGRATION_CHECKLIST.md`](./migration/MIGRATION_CHECKLIST.md)           | **Checklist de migração** - Lista de verificação detalhada         | ~11KB   | _(anterior)_       |
| 📝 [`MIGRATION_TASKS.md`](./migration/MIGRATION_TASKS.md)                   | **Tarefas de migração** - Detalhamento técnico das tarefas         | ~18KB   | _(anterior)_       |
| ⚡ [`ATIVIDADES_REGRAS_ESCALA.md`](./migration/ATIVIDADES_REGRAS_ESCALA.md) | **Regras de escala** - Atividades e regras de negócio              | ~12KB   | _(anterior)_       |

### 🐘 **Configuração NeonDB**

Guia completo de configuração do banco de dados PostgreSQL na nuvem.

| Arquivo                                               | Descrição                                                                            | Tamanho | Última Atualização |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------ | ------- | ------------------ |
| 🐘 [`NEONDB_SETUP_GUIDE.md`](./NEONDB_SETUP_GUIDE.md) | **Guia completo NeonDB** - Configuração de ambientes, connection strings e segurança | ~25KB   | 25/06/2025         |

---

## 🎯 **Guia de Leitura por Perfil**

### 👨‍💼 **Para Gestores e Product Owners**

1. 🎯 **Comece por:** [`firebase/ERD_EXECUTIVE_SUMMARY.md`](./firebase/ERD_EXECUTIVE_SUMMARY.md)
2. 📋 **Aprofunde:** [`firebase/FIREBASE_SCHEMA_DOCUMENTATION.md`](./firebase/FIREBASE_SCHEMA_DOCUMENTATION.md) (seções de relacionamentos)

### 💻 **Para Desenvolvedores**

1. 📋 **Base técnica:** [`firebase/FIREBASE_SCHEMA_DOCUMENTATION.md`](./firebase/FIREBASE_SCHEMA_DOCUMENTATION.md)
2. 📐 **Modelagem:** [`firebase/FIREBASE_ERD_DOCUMENTATION.md`](./firebase/FIREBASE_ERD_DOCUMENTATION.md)
3. 🔧 **Implementação:** [`firebase/firebase-erd-schema.dbml`](./firebase/firebase-erd-schema.dbml)

### ⛪ **Para Líderes de Igreja**

1. 🎯 **Visão geral:** [`firebase/ERD_EXECUTIVE_SUMMARY.md`](./firebase/ERD_EXECUTIVE_SUMMARY.md) (seções de regras de negócio)
2. 📋 **Detalhes:** [`firebase/FIREBASE_SCHEMA_DOCUMENTATION.md`](./firebase/FIREBASE_SCHEMA_DOCUMENTATION.md) (exemplos de dados)

### 🎨 **Para Designers de Sistema**

1. 📐 **ERD completo:** [`firebase/FIREBASE_ERD_DOCUMENTATION.md`](./firebase/FIREBASE_ERD_DOCUMENTATION.md)
2. 🔧 **Schema DBML:** [`firebase/firebase-erd-schema.dbml`](./firebase/firebase-erd-schema.dbml)

### 🚀 **Para Equipe de Migração**

1. 📋 **Plano geral:** [`migration/MIGRATION_PLAN.md`](./migration/MIGRATION_PLAN.md)
2. ✅ **Checklist:** [`migration/MIGRATION_CHECKLIST.md`](./migration/MIGRATION_CHECKLIST.md)
3. 📝 **Tarefas detalhadas:** [`migration/MIGRATION_TASKS.md`](./migration/MIGRATION_TASKS.md)

---

## 🏗️ **Visão Geral do Sistema**

### **📊 Estatísticas do Schema Firebase**

- **🗂️ Coleções:** 5 principais (usuarios, igrejas, cargos, voluntarios, escalas)
- **🔗 Relacionamentos:** 11 tipos mapeados
- **📋 Campos:** 65+ atributos documentados
- **🔑 Estrutura:** PKs, FKs, índices e constraints

### **🔄 Coleções Principais**

```
usuarios ←→ igrejas (M:N)    👥 Controle de acesso
usuarios ←→ cargos (M:N)     💼 Permissões
voluntarios → igrejas (N:1)  ⛪ Organização
voluntarios → cargos (N:1)   🙋‍♀️ Funções
escalas → igrejas/cargos     📊 Planejamento
```

---

## 🛠️ **Ferramentas e Tecnologias**

### **📋 Documentação**

- **Markdown** - Formato de documentação
- **TypeScript Interfaces** - Base para análise do schema
- **Exemplos JSON** - Demonstração de estruturas

### **📐 Modelagem ERD**

- **[dbdiagram.io](https://dbdiagram.io)** - Ferramenta principal de ERD
- **DBML** - Database Markup Language
- **Notação Crow's Foot** - Padrão de relacionamentos

### **🖼️ Diagramas Visuais**

- **Mermaid** - Diagramas como código
- **PNG Export** - Imagens para apresentações
- **Alta resolução** - 1600x1200px para clareza

---

## 📈 **Status do Projeto**

### **🎯 Firebase Schema & ERD**

- ✅ **Documentação:** Completa e revisada
- 🔄 **Validação técnica:** Em andamento
- ⏳ **Aprovação stakeholders:** Pendente
- 📝 **Issues:** Estruturadas e prontas

### **📦 Migração**

- ✅ **Planejamento:** Documentado
- 📋 **Checklist:** Preparado
- 📝 **Tarefas:** Detalhadas
- ⚡ **Regras:** Definidas

### **⏱️ Cronograma Geral**

| Área         | Fase              | Duração       | Status          |
| ------------ | ----------------- | ------------- | --------------- |
| **Firebase** | Documentação      | ✅ Concluída  | 100%            |
| **Firebase** | Validação Técnica | 3 dias        | 🔄 Em andamento |
| **Firebase** | Validação Negócio | 5 dias        | ⏳ Aguardando   |
| **Migração** | Execução          | Conforme plan | 📋 Preparado    |

---

## 🔗 **Navegação e Links**

### **📂 Estrutura do Projeto**

```
docs/
├── 🖼️ images/
│   ├── firebase-schema-diagram.png
│   └── firebase-erd-detailed.png
└── 📚 markdown/
    ├── 🔥 firebase/
    │   ├── FIREBASE_SCHEMA_DOCUMENTATION.md
    │   ├── FIREBASE_ERD_DOCUMENTATION.md
    │   ├── ERD_EXECUTIVE_SUMMARY.md
    │   └── firebase-erd-schema.dbml
    └── 📦 migration/
        ├── MIGRATION_PLAN.md
        ├── MIGRATION_CHECKLIST.md
        ├── MIGRATION_TASKS.md
        └── ATIVIDADES_REGRAS_ESCALA.md
```

### **🌐 Links Externos**

- **🖼️ Imagens:** [`../images/`](../images/) - Diagramas em PNG
- **📁 Raiz do Docs:** [`../`](../) - Outros documentos
- **🏠 Projeto:** [`../../`](../../) - Código fonte
- **dbdiagram.io:** [Criar/editar diagramas](https://dbdiagram.io)

---

## 📋 **Como Contribuir**

### **✏️ Atualizações na Documentação**

1. **Escolha a pasta** correta (`firebase/` ou `migration/`)
2. **Edite** os arquivos .md diretamente
3. **Mantenha** a consistência de formato
4. **Atualize** datas e versões no README

### **🔄 Mudanças no Schema Firebase**

1. **Atualize:** [`firebase/FIREBASE_SCHEMA_DOCUMENTATION.md`](./firebase/FIREBASE_SCHEMA_DOCUMENTATION.md)
2. **Revise:** [`firebase/firebase-erd-schema.dbml`](./firebase/firebase-erd-schema.dbml)
3. **Documente:** [`firebase/FIREBASE_ERD_DOCUMENTATION.md`](./firebase/FIREBASE_ERD_DOCUMENTATION.md)
4. **Comunique:** [`firebase/ERD_EXECUTIVE_SUMMARY.md`](./firebase/ERD_EXECUTIVE_SUMMARY.md)

### **📦 Atualizações de Migração**

1. **Planeje:** [`migration/MIGRATION_PLAN.md`](./migration/MIGRATION_PLAN.md)
2. **Verifique:** [`migration/MIGRATION_CHECKLIST.md`](./migration/MIGRATION_CHECKLIST.md)
3. **Execute:** [`migration/MIGRATION_TASKS.md`](./migration/MIGRATION_TASKS.md)
4. **Documente:** [`migration/ATIVIDADES_REGRAS_ESCALA.md`](./migration/ATIVIDADES_REGRAS_ESCALA.md)

---

## 📊 **Métricas de Qualidade**

### **✅ Checklist de Organização**

- [x] Documentação categorizada por tema
- [x] Links atualizados para nova estrutura
- [x] Guias de leitura por perfil
- [x] README abrangente e navegável
- [x] Estrutura escalável para futuras categorias

### **📈 KPIs da Documentação**

- **📁 Organização:** Estrutura clara por categoria
- **📋 Completude:** 100% das áreas documentadas
- **🔍 Precisão:** Baseado em análise de código real
- **📚 Usabilidade:** Múltiplos níveis e perfis
- **🔄 Manutenibilidade:** Estrutura modular

---

## ❓ **FAQ - Perguntas Frequentes**

### **🤔 "Como navegar na documentação?"**

Use a **estrutura de pastas** (`firebase/` ou `migration/`) e o **Guia de Leitura por Perfil** para encontrar o conteúdo relevante.

### **🔧 "Como usar o arquivo DBML?"**

Importe [`firebase/firebase-erd-schema.dbml`](./firebase/firebase-erd-schema.dbml) no [dbdiagram.io](https://dbdiagram.io) para visualizar e editar o ERD.

### **📊 "Onde estão os diagramas visuais?"**

As imagens PNG estão em [`../images/`](../images/) e podem ser usadas em apresentações.

### **📦 "Como acompanhar a migração?"**

Consulte os documentos na pasta [`migration/`](./migration/), começando pelo plano geral.

### **⚡ "Como contribuir com melhorias?"**

Siga o processo descrito na seção **Como Contribuir** e mantenha a organização por categorias.

---

## 🏷️ **Versioning & Changelog**

### **📅 Versão Atual: 1.1**

- **Data:** 25/06/2025
- **Mudanças:**
  - ✅ Reorganização em subpastas (`firebase/`, `migration/`)
  - ✅ README atualizado com nova estrutura
  - ✅ Links corrigidos para nova organização
- **Status:** ✅ Organizada e pronta para uso

### **📝 Histórico de Versões**

- **v1.0:** Documentação inicial completa
- **v1.1:** Reorganização em categorias e subpastas
- **v1.2:** _(próxima)_ Feedback de stakeholders

---

_📅 Última atualização: ${new Date().toLocaleDateString('pt-BR')}_  
_👤 Mantido por: Equipe de Documentação Técnica_  
_📧 Contato: Através das issues do projeto_
