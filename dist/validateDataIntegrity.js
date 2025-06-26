"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDataIntegrity = main;
var client_1 = require("@prisma/client");
var fs = require("fs");
var path = require("path");
// ===============================================
// CONFIGURAÇÃO E UTILITÁRIOS
// ===============================================
var prisma = new client_1.PrismaClient();
/**
 * Carrega os dados transformados do arquivo JSON
 */
function loadTransformedData() {
    return __awaiter(this, void 0, void 0, function () {
        var inputFile, data;
        return __generator(this, function (_a) {
            inputFile = path.join(process.cwd(), "transformed-data.json");
            if (!fs.existsSync(inputFile)) {
                throw new Error("Arquivo transformed-data.json n\u00E3o encontrado em: ".concat(inputFile));
            }
            data = JSON.parse(fs.readFileSync(inputFile, "utf-8"));
            console.log("📄 Dados transformados carregados com sucesso");
            return [2 /*return*/, data];
        });
    });
}
/**
 * Adiciona resultado de validação ao relatório
 */
function addValidationResult(results, test, passed, expected, actual, details) {
    results.push({
        test: test,
        passed: passed,
        expected: expected,
        actual: actual,
        details: details,
    });
}
// ===============================================
// VALIDAÇÕES - CONTAGEM DE REGISTROS
// ===============================================
/**
 * Valida a contagem de registros em cada tabela
 */
function validateRecordCounts(transformedData, results) {
    return __awaiter(this, void 0, void 0, function () {
        var usuariosCount, igrejasCount, cargosCount, voluntariosCount, disponibilidadesCount, escalasCount, escalaDiasCount, escalaVoluntariosCount;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("🔢 Validando contagem de registros...");
                    return [4 /*yield*/, prisma.usuario.count()];
                case 1:
                    usuariosCount = _a.sent();
                    addValidationResult(results, "Contagem de Usuários", usuariosCount === transformedData.usuarios.length, transformedData.usuarios.length, usuariosCount);
                    return [4 /*yield*/, prisma.igreja.count()];
                case 2:
                    igrejasCount = _a.sent();
                    addValidationResult(results, "Contagem de Igrejas", igrejasCount === transformedData.igrejas.length, transformedData.igrejas.length, igrejasCount);
                    return [4 /*yield*/, prisma.cargo.count()];
                case 3:
                    cargosCount = _a.sent();
                    addValidationResult(results, "Contagem de Cargos", cargosCount === transformedData.cargos.length, transformedData.cargos.length, cargosCount);
                    return [4 /*yield*/, prisma.voluntario.count()];
                case 4:
                    voluntariosCount = _a.sent();
                    addValidationResult(results, "Contagem de Voluntários", voluntariosCount === transformedData.voluntarios.length, transformedData.voluntarios.length, voluntariosCount);
                    return [4 /*yield*/, prisma.disponibilidade.count()];
                case 5:
                    disponibilidadesCount = _a.sent();
                    addValidationResult(results, "Contagem de Disponibilidades", disponibilidadesCount === transformedData.disponibilidades.length, transformedData.disponibilidades.length, disponibilidadesCount);
                    return [4 /*yield*/, prisma.escala.count()];
                case 6:
                    escalasCount = _a.sent();
                    addValidationResult(results, "Contagem de Escalas", escalasCount === transformedData.escalas.length, transformedData.escalas.length, escalasCount);
                    return [4 /*yield*/, prisma.escalaDia.count()];
                case 7:
                    escalaDiasCount = _a.sent();
                    addValidationResult(results, "Contagem de Escala Dias", escalaDiasCount === transformedData.escalaDias.length, transformedData.escalaDias.length, escalaDiasCount);
                    return [4 /*yield*/, prisma.escalaVoluntario.count()];
                case 8:
                    escalaVoluntariosCount = _a.sent();
                    addValidationResult(results, "Contagem de Escala Voluntários", escalaVoluntariosCount === transformedData.escalaVoluntarios.length, transformedData.escalaVoluntarios.length, escalaVoluntariosCount);
                    return [2 /*return*/];
            }
        });
    });
}
// ===============================================
// VALIDAÇÕES - CAMPOS OBRIGATÓRIOS
// ===============================================
/**
 * Valida campos obrigatórios (não nulos)
 */
function validateRequiredFields(results) {
    return __awaiter(this, void 0, void 0, function () {
        var usuariosWithNullRequired, igrejasWithNullRequired, cargosWithNullRequired, voluntariosWithNullRequired, disponibilidadesWithNullRequired, escalasWithNullRequired, escalaDiasWithNullRequired, escalaVoluntariosWithNullRequired;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("✅ Validando campos obrigatórios...");
                    return [4 /*yield*/, prisma.usuario.count({
                            where: {
                                OR: [
                                    { uid: null },
                                    { email: null },
                                    { nome: null },
                                    { isAdmin: null },
                                    { criadoEm: null },
                                ],
                            },
                        })];
                case 1:
                    usuariosWithNullRequired = _a.sent();
                    addValidationResult(results, "Usuários - Campos Obrigatórios", usuariosWithNullRequired === 0, 0, usuariosWithNullRequired, "Usuários com campos obrigatórios nulos");
                    return [4 /*yield*/, prisma.igreja.count({
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
                        })];
                case 2:
                    igrejasWithNullRequired = _a.sent();
                    addValidationResult(results, "Igrejas - Campos Obrigatórios", igrejasWithNullRequired === 0, 0, igrejasWithNullRequired, "Igrejas com campos obrigatórios nulos");
                    return [4 /*yield*/, prisma.cargo.count({
                            where: {
                                OR: [{ nome: null }, { criadoEm: null }],
                            },
                        })];
                case 3:
                    cargosWithNullRequired = _a.sent();
                    addValidationResult(results, "Cargos - Campos Obrigatórios", cargosWithNullRequired === 0, 0, cargosWithNullRequired, "Cargos com campos obrigatórios nulos");
                    return [4 /*yield*/, prisma.voluntario.count({
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
                        })];
                case 4:
                    voluntariosWithNullRequired = _a.sent();
                    addValidationResult(results, "Voluntários - Campos Obrigatórios", voluntariosWithNullRequired === 0, 0, voluntariosWithNullRequired, "Voluntários com campos obrigatórios nulos");
                    return [4 /*yield*/, prisma.disponibilidade.count({
                            where: {
                                OR: [{ voluntarioId: null }, { diaSemana: null }, { disponivel: null }],
                            },
                        })];
                case 5:
                    disponibilidadesWithNullRequired = _a.sent();
                    addValidationResult(results, "Disponibilidades - Campos Obrigatórios", disponibilidadesWithNullRequired === 0, 0, disponibilidadesWithNullRequired, "Disponibilidades com campos obrigatórios nulos");
                    return [4 /*yield*/, prisma.escala.count({
                            where: {
                                OR: [
                                    { mes: null },
                                    { ano: null },
                                    { igrejaId: null },
                                    { cargoId: null },
                                    { criadoEm: null },
                                ],
                            },
                        })];
                case 6:
                    escalasWithNullRequired = _a.sent();
                    addValidationResult(results, "Escalas - Campos Obrigatórios", escalasWithNullRequired === 0, 0, escalasWithNullRequired, "Escalas com campos obrigatórios nulos");
                    return [4 /*yield*/, prisma.escalaDia.count({
                            where: {
                                OR: [{ escalaId: null }, { data: null }, { tipoCulto: null }],
                            },
                        })];
                case 7:
                    escalaDiasWithNullRequired = _a.sent();
                    addValidationResult(results, "Escala Dias - Campos Obrigatórios", escalaDiasWithNullRequired === 0, 0, escalaDiasWithNullRequired, "Escala Dias com campos obrigatórios nulos");
                    return [4 /*yield*/, prisma.escalaVoluntario.count({
                            where: {
                                OR: [{ escalaDiaId: null }, { voluntarioId: null }],
                            },
                        })];
                case 8:
                    escalaVoluntariosWithNullRequired = _a.sent();
                    addValidationResult(results, "Escala Voluntários - Campos Obrigatórios", escalaVoluntariosWithNullRequired === 0, 0, escalaVoluntariosWithNullRequired, "Escala Voluntários com campos obrigatórios nulos");
                    return [2 /*return*/];
            }
        });
    });
}
// ===============================================
// VALIDAÇÕES - CHAVES ESTRANGEIRAS
// ===============================================
/**
 * Valida integridade referencial (chaves estrangeiras)
 */
function validateForeignKeys(results) {
    return __awaiter(this, void 0, void 0, function () {
        var usuariosInvalidIgreja, voluntariosInvalidIgreja, voluntariosInvalidCargo, disponibilidadesInvalidVoluntario, escalasInvalidIgreja, escalasInvalidCargo, escalaDiasInvalidEscala, escalaVoluntariosInvalidEscalaDia, escalaVoluntariosInvalidVoluntario;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("🔗 Validando chaves estrangeiras...");
                    return [4 /*yield*/, prisma.usuario.count({
                            where: {
                                AND: [{ igrejaId: { not: null } }, { igreja: null }],
                            },
                        })];
                case 1:
                    usuariosInvalidIgreja = _a.sent();
                    addValidationResult(results, "Usuários - igrejaId Válido", usuariosInvalidIgreja === 0, 0, usuariosInvalidIgreja, "Usuários com igrejaId inválido");
                    return [4 /*yield*/, prisma.voluntario.count({
                            where: { igreja: null },
                        })];
                case 2:
                    voluntariosInvalidIgreja = _a.sent();
                    addValidationResult(results, "Voluntários - igrejaId Válido", voluntariosInvalidIgreja === 0, 0, voluntariosInvalidIgreja, "Voluntários com igrejaId inválido");
                    return [4 /*yield*/, prisma.voluntario.count({
                            where: { cargo: null },
                        })];
                case 3:
                    voluntariosInvalidCargo = _a.sent();
                    addValidationResult(results, "Voluntários - cargoId Válido", voluntariosInvalidCargo === 0, 0, voluntariosInvalidCargo, "Voluntários com cargoId inválido");
                    return [4 /*yield*/, prisma.disponibilidade.count({
                            where: { voluntario: null },
                        })];
                case 4:
                    disponibilidadesInvalidVoluntario = _a.sent();
                    addValidationResult(results, "Disponibilidades - voluntarioId Válido", disponibilidadesInvalidVoluntario === 0, 0, disponibilidadesInvalidVoluntario, "Disponibilidades com voluntarioId inválido");
                    return [4 /*yield*/, prisma.escala.count({
                            where: { igreja: null },
                        })];
                case 5:
                    escalasInvalidIgreja = _a.sent();
                    addValidationResult(results, "Escalas - igrejaId Válido", escalasInvalidIgreja === 0, 0, escalasInvalidIgreja, "Escalas com igrejaId inválido");
                    return [4 /*yield*/, prisma.escala.count({
                            where: { cargo: null },
                        })];
                case 6:
                    escalasInvalidCargo = _a.sent();
                    addValidationResult(results, "Escalas - cargoId Válido", escalasInvalidCargo === 0, 0, escalasInvalidCargo, "Escalas com cargoId inválido");
                    return [4 /*yield*/, prisma.escalaDia.count({
                            where: { escala: null },
                        })];
                case 7:
                    escalaDiasInvalidEscala = _a.sent();
                    addValidationResult(results, "Escala Dias - escalaId Válido", escalaDiasInvalidEscala === 0, 0, escalaDiasInvalidEscala, "Escala Dias com escalaId inválido");
                    return [4 /*yield*/, prisma.escalaVoluntario.count({
                            where: { escalaDia: null },
                        })];
                case 8:
                    escalaVoluntariosInvalidEscalaDia = _a.sent();
                    addValidationResult(results, "Escala Voluntários - escalaDiaId Válido", escalaVoluntariosInvalidEscalaDia === 0, 0, escalaVoluntariosInvalidEscalaDia, "Escala Voluntários com escalaDiaId inválido");
                    return [4 /*yield*/, prisma.escalaVoluntario.count({
                            where: { voluntario: null },
                        })];
                case 9:
                    escalaVoluntariosInvalidVoluntario = _a.sent();
                    addValidationResult(results, "Escala Voluntários - voluntarioId Válido", escalaVoluntariosInvalidVoluntario === 0, 0, escalaVoluntariosInvalidVoluntario, "Escala Voluntários com voluntarioId inválido");
                    return [2 /*return*/];
            }
        });
    });
}
// ===============================================
// VALIDAÇÕES - UNICIDADE
// ===============================================
/**
 * Valida restrições de unicidade
 */
function validateUniqueness(results) {
    return __awaiter(this, void 0, void 0, function () {
        var duplicateUids, duplicateEmails, duplicateDisponibilidades, duplicateEscalas, duplicateEscalaVoluntarios;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("🔑 Validando restrições de unicidade...");
                    return [4 /*yield*/, prisma.usuario.groupBy({
                            by: ["uid"],
                            having: { uid: { _count: { gt: 1 } } },
                        })];
                case 1:
                    duplicateUids = _a.sent();
                    addValidationResult(results, "Usuários - UID Único", duplicateUids.length === 0, 0, duplicateUids.length, "UIDs duplicados encontrados");
                    return [4 /*yield*/, prisma.usuario.groupBy({
                            by: ["email"],
                            having: { email: { _count: { gt: 1 } } },
                        })];
                case 2:
                    duplicateEmails = _a.sent();
                    addValidationResult(results, "Usuários - Email Único", duplicateEmails.length === 0, 0, duplicateEmails.length, "Emails duplicados encontrados");
                    return [4 /*yield*/, prisma.disponibilidade.groupBy({
                            by: ["voluntarioId", "diaSemana"],
                            having: { voluntarioId: { _count: { gt: 1 } } },
                        })];
                case 3:
                    duplicateDisponibilidades = _a.sent();
                    addValidationResult(results, "Disponibilidades - Combinação Única", duplicateDisponibilidades.length === 0, 0, duplicateDisponibilidades.length, "Combinações (voluntarioId, diaSemana) duplicadas");
                    return [4 /*yield*/, prisma.escala.groupBy({
                            by: ["mes", "ano", "igrejaId", "cargoId"],
                            having: { mes: { _count: { gt: 1 } } },
                        })];
                case 4:
                    duplicateEscalas = _a.sent();
                    addValidationResult(results, "Escalas - Combinação Única", duplicateEscalas.length === 0, 0, duplicateEscalas.length, "Combinações (mes, ano, igrejaId, cargoId) duplicadas");
                    return [4 /*yield*/, prisma.escalaVoluntario.groupBy({
                            by: ["escalaDiaId", "voluntarioId"],
                            having: { escalaDiaId: { _count: { gt: 1 } } },
                        })];
                case 5:
                    duplicateEscalaVoluntarios = _a.sent();
                    addValidationResult(results, "Escala Voluntários - Combinação Única", duplicateEscalaVoluntarios.length === 0, 0, duplicateEscalaVoluntarios.length, "Combinações (escalaDiaId, voluntarioId) duplicadas");
                    return [2 /*return*/];
            }
        });
    });
}
// ===============================================
// VALIDAÇÕES - TIPOS DE DADOS E FORMATO
// ===============================================
/**
 * Valida tipos de dados e formatos básicos
 */
function validateDataTypes(results) {
    return __awaiter(this, void 0, void 0, function () {
        var invalidEmails, emptyPhones, invalidMonths, invalidYears, negativeDaysWorked, currentYear, invalidDates;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("📊 Validando tipos de dados e formatos...");
                    return [4 /*yield*/, prisma.usuario.count({
                            where: {
                                email: {
                                    not: {
                                        contains: "@",
                                    },
                                },
                            },
                        })];
                case 1:
                    invalidEmails = _a.sent();
                    addValidationResult(results, "Usuários - Formato de Email", invalidEmails === 0, 0, invalidEmails, "Emails com formato inválido (sem @)");
                    return [4 /*yield*/, prisma.voluntario.count({
                            where: {
                                telefone: "",
                            },
                        })];
                case 2:
                    emptyPhones = _a.sent();
                    addValidationResult(results, "Voluntários - Telefone Não Vazio", emptyPhones === 0, 0, emptyPhones, "Voluntários com telefone vazio");
                    return [4 /*yield*/, prisma.escala.count({
                            where: {
                                OR: [{ mes: { lt: 1 } }, { mes: { gt: 12 } }],
                            },
                        })];
                case 3:
                    invalidMonths = _a.sent();
                    addValidationResult(results, "Escalas - Mês Válido (1-12)", invalidMonths === 0, 0, invalidMonths, "Escalas com mês inválido");
                    return [4 /*yield*/, prisma.escala.count({
                            where: {
                                OR: [{ ano: { lt: 2020 } }, { ano: { gt: 2030 } }],
                            },
                        })];
                case 4:
                    invalidYears = _a.sent();
                    addValidationResult(results, "Escalas - Ano Válido (2020-2030)", invalidYears === 0, 0, invalidYears, "Escalas com ano fora do intervalo esperado");
                    return [4 /*yield*/, prisma.voluntario.count({
                            where: {
                                diasTrabalhados: { lt: 0 },
                            },
                        })];
                case 5:
                    negativeDaysWorked = _a.sent();
                    addValidationResult(results, "Voluntários - Dias Trabalhados Não Negativo", negativeDaysWorked === 0, 0, negativeDaysWorked, "Voluntários com dias trabalhados negativos");
                    currentYear = new Date().getFullYear();
                    return [4 /*yield*/, prisma.escalaDia.count({
                            where: {
                                OR: [
                                    { data: { lt: new Date("".concat(currentYear - 5, "-01-01")) } },
                                    { data: { gt: new Date("".concat(currentYear + 5, "-12-31")) } },
                                ],
                            },
                        })];
                case 6:
                    invalidDates = _a.sent();
                    addValidationResult(results, "Escala Dias - Data Razoável", invalidDates === 0, 0, invalidDates, "Escala Dias com datas fora do intervalo razoável");
                    return [2 /*return*/];
            }
        });
    });
}
// ===============================================
// FUNÇÃO PRINCIPAL E RELATÓRIO
// ===============================================
/**
 * Gera relatório de validação
 */
function generateReport(results) {
    var passedTests = results.filter(function (r) { return r.passed; }).length;
    var failedTests = results.filter(function (r) { return !r.passed; }).length;
    var totalTests = results.length;
    var summary = "\n\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557\n\u2551         RELAT\u00D3RIO DE VALIDA\u00C7\u00C3O           \u2551\n\u2560\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2563\n\u2551 Total de Testes: ".concat(totalTests.toString().padStart(23), " \u2551\n\u2551 Testes Aprovados: ").concat(passedTests.toString().padStart(21), " \u2551\n\u2551 Testes Falharam: ").concat(failedTests.toString().padStart(22), " \u2551\n\u2551 Taxa de Sucesso: ").concat(((passedTests / totalTests) * 100)
        .toFixed(1)
        .padStart(20), "% \u2551\n\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D");
    return {
        totalTests: totalTests,
        passedTests: passedTests,
        failedTests: failedTests,
        results: results,
        summary: summary,
    };
}
/**
 * Imprime relatório detalhado
 */
function printDetailedReport(report) {
    console.log("\n" + report.summary);
    if (report.failedTests > 0) {
        console.log("\n❌ TESTES QUE FALHARAM:");
        console.log("━".repeat(60));
        report.results
            .filter(function (r) { return !r.passed; })
            .forEach(function (result, index) {
            console.log("".concat(index + 1, ". ").concat(result.test));
            if (result.expected !== undefined && result.actual !== undefined) {
                console.log("   Esperado: ".concat(result.expected));
                console.log("   Encontrado: ".concat(result.actual));
            }
            if (result.details) {
                console.log("   Detalhes: ".concat(result.details));
            }
            console.log("");
        });
    }
    if (report.passedTests > 0) {
        console.log("\n✅ TESTES APROVADOS:");
        console.log("━".repeat(60));
        report.results
            .filter(function (r) { return r.passed; })
            .forEach(function (result, index) {
            console.log("".concat(index + 1, ". ").concat(result.test));
            if (result.expected !== undefined && result.actual !== undefined) {
                console.log("   Valor: ".concat(result.actual));
            }
        });
    }
}
/**
 * Função principal de validação
 */
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var results, transformedData, report, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("🔍 INICIANDO VALIDAÇÃO DE INTEGRIDADE DE DADOS");
                    console.log("=".repeat(50));
                    results = [];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 8, 9, 11]);
                    return [4 /*yield*/, loadTransformedData()];
                case 2:
                    transformedData = _a.sent();
                    // Executar todas as validações
                    return [4 /*yield*/, validateRecordCounts(transformedData, results)];
                case 3:
                    // Executar todas as validações
                    _a.sent();
                    return [4 /*yield*/, validateRequiredFields(results)];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, validateForeignKeys(results)];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, validateUniqueness(results)];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, validateDataTypes(results)];
                case 7:
                    _a.sent();
                    report = generateReport(results);
                    printDetailedReport(report);
                    // Status de saída
                    if (report.failedTests === 0) {
                        console.log("\n🎉 TODAS AS VALIDAÇÕES PASSARAM! Dados íntegros.");
                        process.exit(0);
                    }
                    else {
                        console.log("\n\u26A0\uFE0F  ".concat(report.failedTests, " VALIDA\u00C7\u00C3O(\u00D5ES) FALHARAM. Revisar dados necess\u00E1rio."));
                        process.exit(1);
                    }
                    return [3 /*break*/, 11];
                case 8:
                    error_1 = _a.sent();
                    console.error("❌ Erro durante a validação:", error_1);
                    process.exit(1);
                    return [3 /*break*/, 11];
                case 9: return [4 /*yield*/, prisma.$disconnect()];
                case 10:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 11: return [2 /*return*/];
            }
        });
    });
}
// ===============================================
// EXECUÇÃO
// ===============================================
if (require.main === module) {
    main();
}
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
