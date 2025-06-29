# Migração do Firebase para Neon + Prisma

## Resumo da Migração

Este documento contém todas as instruções para migrar do sistema Firebase para Neon (PostgreSQL) usando Prisma como ORM.

## ✅ Alterações Já Realizadas

### 1. Dependências Atualizadas

- ✅ Removido `firebase` do package.json
- ✅ Adicionado `@prisma/client`, `prisma`, `bcryptjs`, `jose`, `@types/bcryptjs`
- ✅ Adicionados scripts do Prisma no package.json

### 2. Schema do Banco de Dados

- ✅ Criado `prisma/schema.prisma` com todos os modelos
- ✅ Modelos criados: Usuario, Igreja, Cargo, Voluntario, EscalaItem, VoluntarioEscala

### 3. Configuração do Prisma

- ✅ Criado `app/lib/prisma.ts` com cliente Prisma global

### 4. Sistema de Autenticação

- ✅ Substituído Firebase Auth por JWT
- ✅ Criado `app/contexts/AuthContext.tsx` com autenticação JWT
- ✅ Criado `app/api/auth/login/route.ts` para login
- ✅ Criado `app/api/auth/me/route.ts` para verificação de token
- ✅ Criado `app/lib/auth.ts` com utilitários JWT

### 5. Serviços Migrados

- ✅ `app/services/voluntarioService.ts` - Migrado para Prisma
- ✅ `app/services/cargoService.ts` - Migrado para Prisma
- ✅ `app/services/igrejaService.ts` - Migrado para Prisma

### 6. Scripts

- ✅ `scripts/createAdminUser.js` - Migrado para Prisma

## 📋 Próximos Passos (Para Você Fazer)

### 1. Configurar o Banco Neon

1. Acesse [Neon](https://neon.tech) e crie uma conta
2. Crie um novo projeto PostgreSQL
3. Copie a string de conexão do banco
4. Crie um arquivo `.env` na raiz do projeto:

```env
# Database
DATABASE_URL="postgresql://username:password@hostname:port/database_name"

# JWT Secret (use uma chave forte em produção)
JWT_SECRET="sua-chave-jwt-super-segura-aqui"

# Next.js
NEXTAUTH_URL="http://localhost:3000"
```

### 2. Executar Migrações

```bash
# Gerar o cliente Prisma
npm run db:generate

# Aplicar o schema no banco (primeira vez)
npm run db:push

# Ou criar uma migração (recomendado para produção)
npm run db:migrate
```

### 3. Criar Usuário Admin

```bash
npm run create-admin
```

### 4. Instalar Dependências

```bash
npm install
```

### 5. Testar a Aplicação

```bash
npm run dev
```

## 🔧 Serviços Que Ainda Precisam Ser Migrados

### Serviços Pendentes:

- [ ] `app/services/escalaService.ts`
- [ ] `app/services/exportService.ts`
- [ ] `app/services/porteiroService.ts`

### Componentes que Podem Precisar Ajuste:

- [ ] Qualquer componente que use `useAuth()` - verificar se está usando os novos campos
- [ ] Componentes que fazem chamadas diretas ao Firebase

## 📊 Estrutura do Banco de Dados

### Tabelas Criadas:

1. **usuarios** - Dados dos usuários do sistema
2. **igrejas** - Cadastro das igrejas
3. **cargos** - Cargos/funções dos voluntários
4. **voluntarios** - Cadastro dos voluntários
5. **escala_itens** - Itens da escala de trabalho
6. **voluntario_escalas** - Relacionamento entre voluntários e escalas

## 🔐 Sistema de Autenticação

### Mudanças na Autenticação:

- **Antes**: Firebase Auth com `onAuthStateChanged`
- **Depois**: JWT armazenado no localStorage
- **Login**: POST `/api/auth/login`
- **Verificação**: GET `/api/auth/me`
- **Token**: Válido por 7 dias

### Hook useAuth:

```typescript
const { user, loading, login, logout, resetPassword } = useAuth();
// user agora contém: { id, nome, email, igreja, cargo, isAdmin }
```

## 🚨 Possíveis Problemas e Soluções

### 1. Erro de Tipos do Prisma

Se houver erros de tipos, execute:

```bash
npm run db:generate
```

### 2. Erro de Conexão com o Banco

Verifique se a `DATABASE_URL` está correta no arquivo `.env`

### 3. Erro no Login

Certifique-se de que o `JWT_SECRET` está definido no `.env`

### 4. Dependências em Conflito

Se houver conflitos, remova `node_modules` e execute:

```bash
rm -rf node_modules package-lock.json
npm install
```

## 📈 Vantagens da Migração

1. **Performance**: PostgreSQL é mais performático para queries complexas
2. **Relacionamentos**: Prisma oferece melhor suporte a relacionamentos
3. **Tipagem**: TypeScript nativo com Prisma
4. **Controle**: Mais controle sobre o banco de dados
5. **Custo**: Neon oferece tier gratuito generoso

## 🔄 Migração de Dados

Se você tiver dados no Firebase que precisa migrar:

1. Exporte os dados do Firebase
2. Crie um script de migração usando o Prisma
3. Importe os dados para o novo banco

## 📞 Suporte

Se encontrar problemas durante a migração, verifique:

1. As configurações do banco Neon
2. As variáveis de ambiente
3. Se todos os serviços foram migrados corretamente
4. Os logs de erro para identificar problemas específicos
