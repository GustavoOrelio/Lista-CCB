import * as fs from "fs";
import { v4 as uuidv4 } from "uuid";

// ===============================================
// INTERFACES - Firebase Export Structure
// ===============================================

interface FirebaseExport {
  usuarios: FirebaseUsuario[];
  igrejas: FirebaseIgreja[];
  cargos: FirebaseCargo[];
  voluntarios: FirebaseVoluntario[];
  escalas: FirebaseEscala[];
}

interface FirebaseUsuario {
  id: string;
  uid: string;
  email: string;
  nome: string;
  igreja?: string;
  igrejaId?: string;
  cargo?: string;
  isAdmin?: boolean;
  criadoEm?: string;
}

interface FirebaseIgreja {
  id: string;
  nome: string;
  cultoDomingoRDJ?: boolean;
  cultoDomingo?: boolean;
  cultoSegunda?: boolean;
  cultoTerca?: boolean;
  cultoQuarta?: boolean;
  cultoQuinta?: boolean;
  cultoSexta?: boolean;
  cultoSabado?: boolean;
  criadoEm?: string;
}

interface FirebaseCargo {
  id: string;
  nome: string;
  descricao?: string;
  ativo?: boolean;
  criadoEm?: string;
}

interface FirebaseVoluntario {
  id: string;
  nome: string;
  telefone: string;
  igrejaId: string;
  igrejaNome?: string;
  cargoId: string;
  cargoNome?: string;
  diasTrabalhados?: number;
  ultimaEscala?: string;
  criadoEm?: string;
  disponibilidades?: {
    domingoRDJ?: boolean;
    domingo?: boolean;
    segunda?: boolean;
    terca?: boolean;
    quarta?: boolean;
    quinta?: boolean;
    sexta?: boolean;
    sabado?: boolean;
  };
}

interface FirebaseEscala {
  id: string;
  mes: number;
  ano: number;
  igrejaId: string;
  cargoId: string;
  criadoEm?: string;
  dias?: Array<{
    data: string;
    tipoCulto: string;
    voluntarios?: Array<{
      id: string;
      nome: string;
    }>;
  }>;
}

// ===============================================
// INTERFACES - Prisma Target Structure
// ===============================================

interface TransformedData {
  usuarios: PrismaUsuario[];
  igrejas: PrismaIgreja[];
  cargos: PrismaCargo[];
  voluntarios: PrismaVoluntario[];
  disponibilidades: PrismaDisponibilidade[];
  escalas: PrismaEscala[];
  escalaDias: PrismaEscalaDia[];
  escalaVoluntarios: PrismaEscalaVoluntario[];
}

interface PrismaUsuario {
  id: string;
  uid: string;
  email: string;
  nome: string;
  igrejaId: string | null;
  cargo: string | null;
  isAdmin: boolean;
  criadoEm: Date;
}

interface PrismaIgreja {
  id: string;
  nome: string;
  cultoDomingoRDJ: boolean;
  cultoDomingo: boolean;
  cultoSegunda: boolean;
  cultoTerca: boolean;
  cultoQuarta: boolean;
  cultoQuinta: boolean;
  cultoSexta: boolean;
  cultoSabado: boolean;
  criadoEm: Date;
}

interface PrismaCargo {
  id: string;
  nome: string;
  descricao: string | null;
  criadoEm: Date;
}

interface PrismaVoluntario {
  id: string;
  nome: string;
  telefone: string;
  igrejaId: string;
  cargoId: string;
  diasTrabalhados: number;
  ultimaEscala: Date | null;
  criadoEm: Date;
}

interface PrismaDisponibilidade {
  id: string;
  voluntarioId: string;
  diaSemana: string;
  disponivel: boolean;
}

interface PrismaEscala {
  id: string;
  mes: number;
  ano: number;
  igrejaId: string;
  cargoId: string;
  criadoEm: Date;
}

interface PrismaEscalaDia {
  id: string;
  escalaId: string;
  data: Date;
  tipoCulto: string;
}

interface PrismaEscalaVoluntario {
  id: string;
  escalaDiaId: string;
  voluntarioId: string;
}

// ===============================================
// TRANSFORMATION FUNCTIONS
// ===============================================

/**
 * Transforma dados de usuários do Firebase para Prisma
 */
function transformUsuarios(
  usuarios: FirebaseUsuario[],
  igrejas: FirebaseIgreja[]
): PrismaUsuario[] {
  const churchIdMap = new Set(igrejas.map((i) => i.id));

  return usuarios.map((usuario) => {
    // Validar se igrejaId existe no dataset
    const igrejaId = usuario.igreja || usuario.igrejaId;
    if (igrejaId && !churchIdMap.has(igrejaId)) {
      console.warn(
        `⚠️  Usuário ${usuario.nome} tem igrejaId inválido: ${igrejaId}`
      );
    }

    return {
      id: usuario.id,
      uid: usuario.uid,
      email: usuario.email,
      nome: usuario.nome,
      igrejaId: igrejaId && churchIdMap.has(igrejaId) ? igrejaId : null,
      cargo: usuario.cargo || null,
      isAdmin: Boolean(usuario.isAdmin),
      criadoEm: usuario.criadoEm ? new Date(usuario.criadoEm) : new Date(),
    };
  });
}

/**
 * Transforma dados de igrejas do Firebase para Prisma
 */
function transformIgrejas(igrejas: FirebaseIgreja[]): PrismaIgreja[] {
  return igrejas.map((igreja) => ({
    id: igreja.id,
    nome: igreja.nome,
    cultoDomingoRDJ: Boolean(igreja.cultoDomingoRDJ),
    cultoDomingo: Boolean(igreja.cultoDomingo),
    cultoSegunda: Boolean(igreja.cultoSegunda),
    cultoTerca: Boolean(igreja.cultoTerca),
    cultoQuarta: Boolean(igreja.cultoQuarta),
    cultoQuinta: Boolean(igreja.cultoQuinta),
    cultoSexta: Boolean(igreja.cultoSexta),
    cultoSabado: Boolean(igreja.cultoSabado),
    criadoEm: igreja.criadoEm ? new Date(igreja.criadoEm) : new Date(),
  }));
}

/**
 * Transforma dados de cargos do Firebase para Prisma
 */
function transformCargos(cargos: FirebaseCargo[]): PrismaCargo[] {
  return cargos.map((cargo) => ({
    id: cargo.id,
    nome: cargo.nome,
    descricao: cargo.descricao || null,
    criadoEm: cargo.criadoEm ? new Date(cargo.criadoEm) : new Date(),
  }));
}

/**
 * Transforma dados de voluntários e cria disponibilidades
 */
function transformVoluntarios(
  voluntarios: FirebaseVoluntario[],
  igrejas: FirebaseIgreja[],
  cargos: FirebaseCargo[]
): {
  voluntarios: PrismaVoluntario[];
  disponibilidades: PrismaDisponibilidade[];
} {
  const transformedVoluntarios: PrismaVoluntario[] = [];
  const disponibilidades: PrismaDisponibilidade[] = [];

  // Mapas para validação de referências
  const igrejaIdMap = new Set(igrejas.map((i) => i.id));
  const cargoIdMap = new Set(cargos.map((c) => c.id));

  // Mapeamento de dias da semana do Firebase para Prisma Enum
  const diasSemanaMap: Record<string, string> = {
    domingoRDJ: "DOMINGO_RDJ",
    domingo: "DOMINGO",
    segunda: "SEGUNDA",
    terca: "TERCA",
    quarta: "QUARTA",
    quinta: "QUINTA",
    sexta: "SEXTA",
    sabado: "SABADO",
  };

  for (const voluntario of voluntarios) {
    // Validar referências obrigatórias
    if (!igrejaIdMap.has(voluntario.igrejaId)) {
      console.error(
        `❌ Voluntário ${voluntario.nome} tem igrejaId inválido: ${voluntario.igrejaId}`
      );
      continue;
    }

    if (!cargoIdMap.has(voluntario.cargoId)) {
      console.error(
        `❌ Voluntário ${voluntario.nome} tem cargoId inválido: ${voluntario.cargoId}`
      );
      continue;
    }

    // Transformar dados básicos do voluntário
    const ultimaEscalaDate = voluntario.ultimaEscala
      ? new Date(voluntario.ultimaEscala)
      : null;

    // Validar se a data é válida
    if (
      voluntario.ultimaEscala &&
      (!ultimaEscalaDate || isNaN(ultimaEscalaDate.getTime()))
    ) {
      console.warn(
        `⚠️  Voluntário ${voluntario.nome} tem ultimaEscala inválida: ${voluntario.ultimaEscala}`
      );
    }

    transformedVoluntarios.push({
      id: voluntario.id,
      nome: voluntario.nome,
      telefone: voluntario.telefone,
      igrejaId: voluntario.igrejaId,
      cargoId: voluntario.cargoId,
      diasTrabalhados: voluntario.diasTrabalhados || 0,
      ultimaEscala:
        ultimaEscalaDate && !isNaN(ultimaEscalaDate.getTime())
          ? ultimaEscalaDate
          : null,
      criadoEm: voluntario.criadoEm
        ? new Date(voluntario.criadoEm)
        : new Date(),
    });

    // Transformar disponibilidades
    if (voluntario.disponibilidades) {
      Object.entries(diasSemanaMap).forEach(([firebaseKey, prismaEnum]) => {
        const disponivel = Boolean(
          voluntario.disponibilidades?.[
            firebaseKey as keyof typeof voluntario.disponibilidades
          ]
        );

        disponibilidades.push({
          id: uuidv4(),
          voluntarioId: voluntario.id,
          diaSemana: prismaEnum,
          disponivel,
        });
      });
    } else {
      // Se não tem disponibilidades, criar todas como false
      Object.values(diasSemanaMap).forEach((prismaEnum) => {
        disponibilidades.push({
          id: uuidv4(),
          voluntarioId: voluntario.id,
          diaSemana: prismaEnum,
          disponivel: false,
        });
      });
    }
  }

  return { voluntarios: transformedVoluntarios, disponibilidades };
}

/**
 * Transforma dados de escalas e cria escalaDias e escalaVoluntarios
 */
function transformEscalas(
  escalas: FirebaseEscala[],
  igrejas: FirebaseIgreja[],
  cargos: FirebaseCargo[],
  voluntarios: FirebaseVoluntario[]
): {
  escalas: PrismaEscala[];
  escalaDias: PrismaEscalaDia[];
  escalaVoluntarios: PrismaEscalaVoluntario[];
} {
  const transformedEscalas: PrismaEscala[] = [];
  const escalaDias: PrismaEscalaDia[] = [];
  const escalaVoluntarios: PrismaEscalaVoluntario[] = [];

  // Mapas para validação de referências
  const igrejaIdMap = new Set(igrejas.map((i) => i.id));
  const cargoIdMap = new Set(cargos.map((c) => c.id));
  const voluntarioIdMap = new Set(voluntarios.map((v) => v.id));

  for (const escala of escalas) {
    // Validar referências obrigatórias
    if (!igrejaIdMap.has(escala.igrejaId)) {
      console.error(
        `❌ Escala ${escala.id} tem igrejaId inválido: ${escala.igrejaId}`
      );
      continue;
    }

    if (!cargoIdMap.has(escala.cargoId)) {
      console.error(
        `❌ Escala ${escala.id} tem cargoId inválido: ${escala.cargoId}`
      );
      continue;
    }

    // Transformar dados básicos da escala
    transformedEscalas.push({
      id: escala.id,
      mes: escala.mes,
      ano: escala.ano,
      igrejaId: escala.igrejaId,
      cargoId: escala.cargoId,
      criadoEm: escala.criadoEm ? new Date(escala.criadoEm) : new Date(),
    });

    // Transformar dias da escala
    if (escala.dias && Array.isArray(escala.dias)) {
      for (const dia of escala.dias) {
        const dataEscala = new Date(dia.data);

        // Validar se a data é válida
        if (isNaN(dataEscala.getTime())) {
          console.warn(
            `⚠️  Escala ${escala.id} tem data inválida: ${dia.data}`
          );
          continue;
        }

        const escalaDiaId = uuidv4();

        escalaDias.push({
          id: escalaDiaId,
          escalaId: escala.id,
          data: dataEscala,
          tipoCulto: dia.tipoCulto,
        });

        // Transformar voluntários do dia
        if (dia.voluntarios && Array.isArray(dia.voluntarios)) {
          for (const voluntario of dia.voluntarios) {
            // Validar se o voluntário existe
            if (!voluntarioIdMap.has(voluntario.id)) {
              console.warn(
                `⚠️  Escala ${escala.id} referencia voluntário inexistente: ${voluntario.id} (${voluntario.nome})`
              );
              continue;
            }

            escalaVoluntarios.push({
              id: uuidv4(),
              escalaDiaId: escalaDiaId,
              voluntarioId: voluntario.id,
            });
          }
        }
      }
    }
  }

  return { escalas: transformedEscalas, escalaDias, escalaVoluntarios };
}

/**
 * Função principal de transformação
 */
async function main() {
  try {
    console.log("🚀 Iniciando transformação de dados Firebase para Prisma...");

    // Verificar se o arquivo de entrada existe
    const inputFile = "firebase-export.json";
    if (!fs.existsSync(inputFile)) {
      console.error(`❌ Arquivo de entrada não encontrado: ${inputFile}`);
      console.log(
        "📋 Certifique-se de que o arquivo firebase-export.json existe no diretório atual."
      );
      process.exit(1);
    }

    // Carregar dados do Firebase
    console.log("📖 Carregando dados do Firebase...");
    const firebaseData: FirebaseExport = JSON.parse(
      fs.readFileSync(inputFile, "utf8")
    );

    // Validar estrutura básica dos dados
    const requiredCollections = [
      "usuarios",
      "igrejas",
      "cargos",
      "voluntarios",
      "escalas",
    ];
    for (const collection of requiredCollections) {
      if (!firebaseData[collection as keyof FirebaseExport]) {
        console.error(`❌ Coleção obrigatória não encontrada: ${collection}`);
        process.exit(1);
      }
    }

    console.log("📊 Estatísticas dos dados de entrada:");
    console.log(`  📋 Usuários: ${firebaseData.usuarios?.length || 0}`);
    console.log(`  ⛪ Igrejas: ${firebaseData.igrejas?.length || 0}`);
    console.log(`  💼 Cargos: ${firebaseData.cargos?.length || 0}`);
    console.log(`  👥 Voluntários: ${firebaseData.voluntarios?.length || 0}`);
    console.log(`  📅 Escalas: ${firebaseData.escalas?.length || 0}`);

    // Executar transformações
    console.log("\n🔄 Executando transformações...");

    console.log("  🔄 Transformando usuários...");
    const usuarios = transformUsuarios(
      firebaseData.usuarios,
      firebaseData.igrejas
    );

    console.log("  🔄 Transformando igrejas...");
    const igrejas = transformIgrejas(firebaseData.igrejas);

    console.log("  🔄 Transformando cargos...");
    const cargos = transformCargos(firebaseData.cargos);

    console.log("  🔄 Transformando voluntários e disponibilidades...");
    const { voluntarios, disponibilidades } = transformVoluntarios(
      firebaseData.voluntarios,
      firebaseData.igrejas,
      firebaseData.cargos
    );

    console.log("  🔄 Transformando escalas...");
    const { escalas, escalaDias, escalaVoluntarios } = transformEscalas(
      firebaseData.escalas,
      firebaseData.igrejas,
      firebaseData.cargos,
      firebaseData.voluntarios
    );

    // Montar dados finais
    const transformedData: TransformedData = {
      usuarios,
      igrejas,
      cargos,
      voluntarios,
      disponibilidades,
      escalas,
      escalaDias,
      escalaVoluntarios,
    };

    // Salvar arquivo de saída
    const outputFile = "transformed-data.json";
    console.log(`\n💾 Salvando dados transformados em ${outputFile}...`);
    fs.writeFileSync(outputFile, JSON.stringify(transformedData, null, 2));

    console.log("\n✅ Transformação concluída com sucesso!");

    // Estatísticas finais
    console.log("\n📊 Estatísticas dos dados transformados:");
    Object.entries(transformedData).forEach(([key, value]) => {
      const icon =
        {
          usuarios: "👤",
          igrejas: "⛪",
          cargos: "💼",
          voluntarios: "👥",
          disponibilidades: "📋",
          escalas: "📅",
          escalaDias: "📆",
          escalaVoluntarios: "🤝",
        }[key] || "📄";

      console.log(`  ${icon} ${key}: ${value.length} registros`);
    });

    console.log(`\n🎯 Arquivo de saída: ${outputFile}`);
    console.log("🚀 Pronto para importação no Prisma!");
  } catch (error) {
    console.error("❌ Erro durante a transformação:", error);
    process.exit(1);
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}
