import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

// ===============================================
// INTERFACES - Dados Transformados
// ===============================================

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

interface ValidationResult {
  test: string;
  passed: boolean;
  expected?: number | string;
  actual?: number | string;
  details?: string;
}

interface ValidationReport {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  results: ValidationResult[];
  summary: string;
}

// ===============================================
// CONFIGURAÇÃO E UTILITÁRIOS
// ===============================================

const prisma = new PrismaClient();

/**
 * Carrega os dados transformados do arquivo JSON
 */
async function loadTransformedData(): Promise<TransformedData> {
  const inputFile = path.join(process.cwd(), "transformed-data.json");

  if (!fs.existsSync(inputFile)) {
    throw new Error(
      `Arquivo transformed-data.json não encontrado em: ${inputFile}`
    );
  }

  const data = JSON.parse(fs.readFileSync(inputFile, "utf-8"));
  console.log("📄 Dados transformados carregados com sucesso");
  return data;
}

/**
 * Adiciona resultado de validação ao relatório
 */
function addValidationResult(
  results: ValidationResult[],
  test: string,
  passed: boolean,
  expected?: number | string,
  actual?: number | string,
  details?: string
): void {
  results.push({
    test,
    passed,
    expected,
    actual,
    details,
  });
}

// ===============================================
// VALIDAÇÕES - CONTAGEM DE REGISTROS
// ===============================================

/**
 * Valida a contagem de registros em cada tabela
 */
async function validateRecordCounts(
  transformedData: TransformedData,
  results: ValidationResult[]
): Promise<void> {
  console.log("🔢 Validando contagem de registros...");

  // Usuários
  const usuariosCount = await prisma.usuario.count();
  addValidationResult(
    results,
    "Contagem de Usuários",
    usuariosCount === transformedData.usuarios.length,
    transformedData.usuarios.length,
    usuariosCount
  );

  // Igrejas
  const igrejasCount = await prisma.igreja.count();
  addValidationResult(
    results,
    "Contagem de Igrejas",
    igrejasCount === transformedData.igrejas.length,
    transformedData.igrejas.length,
    igrejasCount
  );

  // Cargos
  const cargosCount = await prisma.cargo.count();
  addValidationResult(
    results,
    "Contagem de Cargos",
    cargosCount === transformedData.cargos.length,
    transformedData.cargos.length,
    cargosCount
  );

  // Voluntários
  const voluntariosCount = await prisma.voluntario.count();
  addValidationResult(
    results,
    "Contagem de Voluntários",
    voluntariosCount === transformedData.voluntarios.length,
    transformedData.voluntarios.length,
    voluntariosCount
  );

  // Disponibilidades
  const disponibilidadesCount = await prisma.disponibilidade.count();
  addValidationResult(
    results,
    "Contagem de Disponibilidades",
    disponibilidadesCount === transformedData.disponibilidades.length,
    transformedData.disponibilidades.length,
    disponibilidadesCount
  );

  // Escalas
  const escalasCount = await prisma.escala.count();
  addValidationResult(
    results,
    "Contagem de Escalas",
    escalasCount === transformedData.escalas.length,
    transformedData.escalas.length,
    escalasCount
  );

  // Escala Dias
  const escalaDiasCount = await prisma.escalaDia.count();
  addValidationResult(
    results,
    "Contagem de Escala Dias",
    escalaDiasCount === transformedData.escalaDias.length,
    transformedData.escalaDias.length,
    escalaDiasCount
  );

  // Escala Voluntários
  const escalaVoluntariosCount = await prisma.escalaVoluntario.count();
  addValidationResult(
    results,
    "Contagem de Escala Voluntários",
    escalaVoluntariosCount === transformedData.escalaVoluntarios.length,
    transformedData.escalaVoluntarios.length,
    escalaVoluntariosCount
  );
}

// ===============================================
// VALIDAÇÕES - CAMPOS OBRIGATÓRIOS
// ===============================================

/**
 * Valida campos obrigatórios (não nulos)
 */
async function validateRequiredFields(
  results: ValidationResult[]
): Promise<void> {
  console.log("✅ Validando campos obrigatórios...");

  // Usuários - campos obrigatórios: uid, email, nome, isAdmin, criadoEm
  const usuariosWithNullRequired = await prisma.usuario.count({
    where: {
      OR: [
        { uid: null },
        { email: null },
        { nome: null },
        { isAdmin: null },
        { criadoEm: null },
      ],
    },
  });
  addValidationResult(
    results,
    "Usuários - Campos Obrigatórios",
    usuariosWithNullRequired === 0,
    0,
    usuariosWithNullRequired,
    "Usuários com campos obrigatórios nulos"
  );

  // Igrejas - campos obrigatórios: nome, criadoEm, campos de culto
  const igrejasWithNullRequired = await prisma.igreja.count({
    where: {
      OR: [
        { nome: null },
        { criadoEm: null },
        { cultoDomingoRDJ: null },
        { cultoDomingo: null },
        { cultoSegunda: null },
        { cultoTerca: null },
        { cultoQuarta: null },
        { cultoQuinta: null },
        { cultoSexta: null },
        { cultoSabado: null },
      ],
    },
  });
  addValidationResult(
    results,
    "Igrejas - Campos Obrigatórios",
    igrejasWithNullRequired === 0,
    0,
    igrejasWithNullRequired,
    "Igrejas com campos obrigatórios nulos"
  );

  // Cargos - campos obrigatórios: nome, criadoEm
  const cargosWithNullRequired = await prisma.cargo.count({
    where: {
      OR: [{ nome: null }, { criadoEm: null }],
    },
  });
  addValidationResult(
    results,
    "Cargos - Campos Obrigatórios",
    cargosWithNullRequired === 0,
    0,
    cargosWithNullRequired,
    "Cargos com campos obrigatórios nulos"
  );

  // Voluntários - campos obrigatórios: nome, telefone, igrejaId, cargoId, diasTrabalhados, criadoEm
  const voluntariosWithNullRequired = await prisma.voluntario.count({
    where: {
      OR: [
        { nome: null },
        { telefone: null },
        { igrejaId: null },
        { cargoId: null },
        { diasTrabalhados: null },
        { criadoEm: null },
      ],
    },
  });
  addValidationResult(
    results,
    "Voluntários - Campos Obrigatórios",
    voluntariosWithNullRequired === 0,
    0,
    voluntariosWithNullRequired,
    "Voluntários com campos obrigatórios nulos"
  );

  // Disponibilidades - campos obrigatórios: voluntarioId, diaSemana, disponivel
  const disponibilidadesWithNullRequired = await prisma.disponibilidade.count({
    where: {
      OR: [{ voluntarioId: null }, { diaSemana: null }, { disponivel: null }],
    },
  });
  addValidationResult(
    results,
    "Disponibilidades - Campos Obrigatórios",
    disponibilidadesWithNullRequired === 0,
    0,
    disponibilidadesWithNullRequired,
    "Disponibilidades com campos obrigatórios nulos"
  );

  // Escalas - campos obrigatórios: mes, ano, igrejaId, cargoId, criadoEm
  const escalasWithNullRequired = await prisma.escala.count({
    where: {
      OR: [
        { mes: null },
        { ano: null },
        { igrejaId: null },
        { cargoId: null },
        { criadoEm: null },
      ],
    },
  });
  addValidationResult(
    results,
    "Escalas - Campos Obrigatórios",
    escalasWithNullRequired === 0,
    0,
    escalasWithNullRequired,
    "Escalas com campos obrigatórios nulos"
  );

  // Escala Dias - campos obrigatórios: escalaId, data, tipoCulto
  const escalaDiasWithNullRequired = await prisma.escalaDia.count({
    where: {
      OR: [{ escalaId: null }, { data: null }, { tipoCulto: null }],
    },
  });
  addValidationResult(
    results,
    "Escala Dias - Campos Obrigatórios",
    escalaDiasWithNullRequired === 0,
    0,
    escalaDiasWithNullRequired,
    "Escala Dias com campos obrigatórios nulos"
  );

  // Escala Voluntários - campos obrigatórios: escalaDiaId, voluntarioId
  const escalaVoluntariosWithNullRequired = await prisma.escalaVoluntario.count(
    {
      where: {
        OR: [{ escalaDiaId: null }, { voluntarioId: null }],
      },
    }
  );
  addValidationResult(
    results,
    "Escala Voluntários - Campos Obrigatórios",
    escalaVoluntariosWithNullRequired === 0,
    0,
    escalaVoluntariosWithNullRequired,
    "Escala Voluntários com campos obrigatórios nulos"
  );
}

// ===============================================
// VALIDAÇÕES - CHAVES ESTRANGEIRAS
// ===============================================

/**
 * Valida integridade referencial (chaves estrangeiras)
 */
async function validateForeignKeys(results: ValidationResult[]): Promise<void> {
  console.log("🔗 Validando chaves estrangeiras...");

  // Usuários - igrejaId deve existir em Igreja (quando não nulo)
  const usuariosInvalidIgreja = await prisma.usuario.count({
    where: {
      AND: [{ igrejaId: { not: null } }, { igreja: null }],
    },
  });
  addValidationResult(
    results,
    "Usuários - igrejaId Válido",
    usuariosInvalidIgreja === 0,
    0,
    usuariosInvalidIgreja,
    "Usuários com igrejaId inválido"
  );

  // Voluntários - igrejaId deve existir em Igreja
  const voluntariosInvalidIgreja = await prisma.voluntario.count({
    where: { igreja: null },
  });
  addValidationResult(
    results,
    "Voluntários - igrejaId Válido",
    voluntariosInvalidIgreja === 0,
    0,
    voluntariosInvalidIgreja,
    "Voluntários com igrejaId inválido"
  );

  // Voluntários - cargoId deve existir em Cargo
  const voluntariosInvalidCargo = await prisma.voluntario.count({
    where: { cargo: null },
  });
  addValidationResult(
    results,
    "Voluntários - cargoId Válido",
    voluntariosInvalidCargo === 0,
    0,
    voluntariosInvalidCargo,
    "Voluntários com cargoId inválido"
  );

  // Disponibilidades - voluntarioId deve existir em Voluntario
  const disponibilidadesInvalidVoluntario = await prisma.disponibilidade.count({
    where: { voluntario: null },
  });
  addValidationResult(
    results,
    "Disponibilidades - voluntarioId Válido",
    disponibilidadesInvalidVoluntario === 0,
    0,
    disponibilidadesInvalidVoluntario,
    "Disponibilidades com voluntarioId inválido"
  );

  // Escalas - igrejaId deve existir em Igreja
  const escalasInvalidIgreja = await prisma.escala.count({
    where: { igreja: null },
  });
  addValidationResult(
    results,
    "Escalas - igrejaId Válido",
    escalasInvalidIgreja === 0,
    0,
    escalasInvalidIgreja,
    "Escalas com igrejaId inválido"
  );

  // Escalas - cargoId deve existir em Cargo
  const escalasInvalidCargo = await prisma.escala.count({
    where: { cargo: null },
  });
  addValidationResult(
    results,
    "Escalas - cargoId Válido",
    escalasInvalidCargo === 0,
    0,
    escalasInvalidCargo,
    "Escalas com cargoId inválido"
  );

  // Escala Dias - escalaId deve existir em Escala
  const escalaDiasInvalidEscala = await prisma.escalaDia.count({
    where: { escala: null },
  });
  addValidationResult(
    results,
    "Escala Dias - escalaId Válido",
    escalaDiasInvalidEscala === 0,
    0,
    escalaDiasInvalidEscala,
    "Escala Dias com escalaId inválido"
  );

  // Escala Voluntários - escalaDiaId deve existir em EscalaDia
  const escalaVoluntariosInvalidEscalaDia = await prisma.escalaVoluntario.count(
    {
      where: { escalaDia: null },
    }
  );
  addValidationResult(
    results,
    "Escala Voluntários - escalaDiaId Válido",
    escalaVoluntariosInvalidEscalaDia === 0,
    0,
    escalaVoluntariosInvalidEscalaDia,
    "Escala Voluntários com escalaDiaId inválido"
  );

  // Escala Voluntários - voluntarioId deve existir em Voluntario
  const escalaVoluntariosInvalidVoluntario =
    await prisma.escalaVoluntario.count({
      where: { voluntario: null },
    });
  addValidationResult(
    results,
    "Escala Voluntários - voluntarioId Válido",
    escalaVoluntariosInvalidVoluntario === 0,
    0,
    escalaVoluntariosInvalidVoluntario,
    "Escala Voluntários com voluntarioId inválido"
  );
}

// ===============================================
// VALIDAÇÕES - UNICIDADE
// ===============================================

/**
 * Valida restrições de unicidade
 */
async function validateUniqueness(results: ValidationResult[]): Promise<void> {
  console.log("🔑 Validando restrições de unicidade...");

  // Usuários - uid único
  const duplicateUids = await prisma.usuario.groupBy({
    by: ["uid"],
    having: { uid: { _count: { gt: 1 } } },
  });
  addValidationResult(
    results,
    "Usuários - UID Único",
    duplicateUids.length === 0,
    0,
    duplicateUids.length,
    "UIDs duplicados encontrados"
  );

  // Usuários - email único
  const duplicateEmails = await prisma.usuario.groupBy({
    by: ["email"],
    having: { email: { _count: { gt: 1 } } },
  });
  addValidationResult(
    results,
    "Usuários - Email Único",
    duplicateEmails.length === 0,
    0,
    duplicateEmails.length,
    "Emails duplicados encontrados"
  );

  // Disponibilidades - combinação (voluntarioId, diaSemana) única
  const duplicateDisponibilidades = await prisma.disponibilidade.groupBy({
    by: ["voluntarioId", "diaSemana"],
    having: { voluntarioId: { _count: { gt: 1 } } },
  });
  addValidationResult(
    results,
    "Disponibilidades - Combinação Única",
    duplicateDisponibilidades.length === 0,
    0,
    duplicateDisponibilidades.length,
    "Combinações (voluntarioId, diaSemana) duplicadas"
  );

  // Escalas - combinação (mes, ano, igrejaId, cargoId) única
  const duplicateEscalas = await prisma.escala.groupBy({
    by: ["mes", "ano", "igrejaId", "cargoId"],
    having: { mes: { _count: { gt: 1 } } },
  });
  addValidationResult(
    results,
    "Escalas - Combinação Única",
    duplicateEscalas.length === 0,
    0,
    duplicateEscalas.length,
    "Combinações (mes, ano, igrejaId, cargoId) duplicadas"
  );

  // Escala Voluntários - combinação (escalaDiaId, voluntarioId) única
  const duplicateEscalaVoluntarios = await prisma.escalaVoluntario.groupBy({
    by: ["escalaDiaId", "voluntarioId"],
    having: { escalaDiaId: { _count: { gt: 1 } } },
  });
  addValidationResult(
    results,
    "Escala Voluntários - Combinação Única",
    duplicateEscalaVoluntarios.length === 0,
    0,
    duplicateEscalaVoluntarios.length,
    "Combinações (escalaDiaId, voluntarioId) duplicadas"
  );
}

// ===============================================
// VALIDAÇÕES - TIPOS DE DADOS E FORMATO
// ===============================================

/**
 * Valida tipos de dados e formatos básicos
 */
async function validateDataTypes(results: ValidationResult[]): Promise<void> {
  console.log("📊 Validando tipos de dados e formatos...");

  // Usuários - validar formato de email (amostra)
  const invalidEmails = await prisma.usuario.count({
    where: {
      email: {
        not: {
          contains: "@",
        },
      },
    },
  });
  addValidationResult(
    results,
    "Usuários - Formato de Email",
    invalidEmails === 0,
    0,
    invalidEmails,
    "Emails com formato inválido (sem @)"
  );

  // Voluntários - validar telefone não vazio
  const emptyPhones = await prisma.voluntario.count({
    where: {
      telefone: "",
    },
  });
  addValidationResult(
    results,
    "Voluntários - Telefone Não Vazio",
    emptyPhones === 0,
    0,
    emptyPhones,
    "Voluntários com telefone vazio"
  );

  // Escalas - validar mês entre 1 e 12
  const invalidMonths = await prisma.escala.count({
    where: {
      OR: [{ mes: { lt: 1 } }, { mes: { gt: 12 } }],
    },
  });
  addValidationResult(
    results,
    "Escalas - Mês Válido (1-12)",
    invalidMonths === 0,
    0,
    invalidMonths,
    "Escalas com mês inválido"
  );

  // Escalas - validar ano razoável (entre 2020 e 2030)
  const invalidYears = await prisma.escala.count({
    where: {
      OR: [{ ano: { lt: 2020 } }, { ano: { gt: 2030 } }],
    },
  });
  addValidationResult(
    results,
    "Escalas - Ano Válido (2020-2030)",
    invalidYears === 0,
    0,
    invalidYears,
    "Escalas com ano fora do intervalo esperado"
  );

  // Voluntários - validar diasTrabalhados não negativo
  const negativeDaysWorked = await prisma.voluntario.count({
    where: {
      diasTrabalhados: { lt: 0 },
    },
  });
  addValidationResult(
    results,
    "Voluntários - Dias Trabalhados Não Negativo",
    negativeDaysWorked === 0,
    0,
    negativeDaysWorked,
    "Voluntários com dias trabalhados negativos"
  );

  // Escala Dias - validar se data não está muito no passado ou futuro
  const currentYear = new Date().getFullYear();
  const invalidDates = await prisma.escalaDia.count({
    where: {
      OR: [
        { data: { lt: new Date(`${currentYear - 5}-01-01`) } },
        { data: { gt: new Date(`${currentYear + 5}-12-31`) } },
      ],
    },
  });
  addValidationResult(
    results,
    "Escala Dias - Data Razoável",
    invalidDates === 0,
    0,
    invalidDates,
    "Escala Dias com datas fora do intervalo razoável"
  );
}

// ===============================================
// FUNÇÃO PRINCIPAL E RELATÓRIO
// ===============================================

/**
 * Gera relatório de validação
 */
function generateReport(results: ValidationResult[]): ValidationReport {
  const passedTests = results.filter((r) => r.passed).length;
  const failedTests = results.filter((r) => !r.passed).length;
  const totalTests = results.length;

  const summary = `
╔══════════════════════════════════════════╗
║         RELATÓRIO DE VALIDAÇÃO           ║
╠══════════════════════════════════════════╣
║ Total de Testes: ${totalTests.toString().padStart(23)} ║
║ Testes Aprovados: ${passedTests.toString().padStart(21)} ║
║ Testes Falharam: ${failedTests.toString().padStart(22)} ║
║ Taxa de Sucesso: ${((passedTests / totalTests) * 100)
    .toFixed(1)
    .padStart(20)}% ║
╚══════════════════════════════════════════╝`;

  return {
    totalTests,
    passedTests,
    failedTests,
    results,
    summary,
  };
}

/**
 * Imprime relatório detalhado
 */
function printDetailedReport(report: ValidationReport): void {
  console.log("\n" + report.summary);

  if (report.failedTests > 0) {
    console.log("\n❌ TESTES QUE FALHARAM:");
    console.log("━".repeat(60));

    report.results
      .filter((r) => !r.passed)
      .forEach((result, index) => {
        console.log(`${index + 1}. ${result.test}`);
        if (result.expected !== undefined && result.actual !== undefined) {
          console.log(`   Esperado: ${result.expected}`);
          console.log(`   Encontrado: ${result.actual}`);
        }
        if (result.details) {
          console.log(`   Detalhes: ${result.details}`);
        }
        console.log("");
      });
  }

  if (report.passedTests > 0) {
    console.log("\n✅ TESTES APROVADOS:");
    console.log("━".repeat(60));

    report.results
      .filter((r) => r.passed)
      .forEach((result, index) => {
        console.log(`${index + 1}. ${result.test}`);
        if (result.expected !== undefined && result.actual !== undefined) {
          console.log(`   Valor: ${result.actual}`);
        }
      });
  }
}

/**
 * Função principal de validação
 */
async function main(): Promise<void> {
  console.log("🔍 INICIANDO VALIDAÇÃO DE INTEGRIDADE DE DADOS");
  console.log("=".repeat(50));

  const results: ValidationResult[] = [];

  try {
    // Carregar dados transformados
    const transformedData = await loadTransformedData();

    // Executar todas as validações
    await validateRecordCounts(transformedData, results);
    await validateRequiredFields(results);
    await validateForeignKeys(results);
    await validateUniqueness(results);
    await validateDataTypes(results);

    // Gerar e imprimir relatório
    const report = generateReport(results);
    printDetailedReport(report);

    // Status de saída
    if (report.failedTests === 0) {
      console.log("\n🎉 TODAS AS VALIDAÇÕES PASSARAM! Dados íntegros.");
      process.exit(0);
    } else {
      console.log(
        `\n⚠️  ${report.failedTests} VALIDAÇÃO(ÕES) FALHARAM. Revisar dados necessário.`
      );
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Erro durante a validação:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// ===============================================
// EXECUÇÃO
// ===============================================

if (require.main === module) {
  main();
}

export { main as validateDataIntegrity };

// ===============================================
// INSTRUÇÕES DE USO
// ===============================================

/*
COMO EXECUTAR ESTE SCRIPT:

1. Certifique-se de que o arquivo 'transformed-data.json' existe na raiz do projeto
2. Certifique-se de que o banco NeonDB está configurado e acessível
3. Execute um dos comandos abaixo:

   # Usando ts-node (recomendado):
   npx ts-node scripts/validateDataIntegrity.ts

   # Ou compilando primeiro:
   npx tsc scripts/validateDataIntegrity.ts --outDir ./dist
   node dist/scripts/validateDataIntegrity.js

   # Ou usando npm script (adicione ao package.json):
   npm run validate-data

SAÍDA ESPERADA:
- O script imprimirá um relatório detalhado no console
- Retornará código 0 se todas as validações passarem
- Retornará código 1 se houver falhas nas validações

VALIDAÇÕES EXECUTADAS:
1. Contagem de registros por tabela vs transformed-data.json
2. Validação de campos obrigatórios (não nulos)
3. Integridade de chaves estrangeiras
4. Restrições de unicidade
5. Tipos de dados e formatos básicos
*/
