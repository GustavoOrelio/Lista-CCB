#!/usr/bin/env node

/**
 * Script de Teste do Firebase Export
 * Demonstra o funcionamento do script de export sem precisar de credenciais reais
 */

const fs = require("fs");
const path = require("path");

function createMockFirebaseData() {
  return {
    usuarios: [
      {
        id: "user1",
        uid: "firebase-uid-123",
        email: "admin@igreja.com",
        nome: "Administrador",
        igrejaId: "igreja1",
        cargo: "admin",
        isAdmin: true,
        criadoEm: "2024-01-15T10:30:00.000Z",
      },
      {
        id: "user2",
        uid: "firebase-uid-456",
        email: "pastor@igreja.com",
        nome: "Pastor João",
        igrejaId: "igreja1",
        cargo: "pastor",
        isAdmin: false,
        criadoEm: "2024-01-16T14:20:00.000Z",
      },
    ],
    igrejas: [
      {
        id: "igreja1",
        nome: "Igreja Central",
        cultoDomingoRDJ: true,
        cultoDomingo: true,
        cultoSegunda: false,
        cultoTerca: false,
        cultoQuarta: true,
        cultoQuinta: false,
        cultoSexta: false,
        cultoSabado: false,
        criadoEm: "2024-01-01T08:00:00.000Z",
      },
    ],
    cargos: [
      {
        id: "cargo1",
        nome: "Porteiro",
        descricao: "Responsável pela recepção e segurança",
        criadoEm: "2024-01-01T08:00:00.000Z",
      },
      {
        id: "cargo2",
        nome: "Diácono",
        descricao: "Auxiliar nos serviços da igreja",
        criadoEm: "2024-01-01T08:00:00.000Z",
      },
    ],
    voluntarios: [
      {
        id: "vol1",
        nome: "José Silva",
        telefone: "(11) 99999-1111",
        igrejaId: "igreja1",
        cargoId: "cargo1",
        diasTrabalhados: 15,
        ultimaEscala: "2024-01-14T19:00:00.000Z",
        criadoEm: "2024-01-05T10:00:00.000Z",
      },
      {
        id: "vol2",
        nome: "Maria Santos",
        telefone: "(11) 99999-2222",
        igrejaId: "igreja1",
        cargoId: "cargo1",
        diasTrabalhados: 12,
        ultimaEscala: "2024-01-13T19:00:00.000Z",
        criadoEm: "2024-01-06T11:00:00.000Z",
      },
    ],
    escalas: [
      {
        id: "escala1",
        mes: 1,
        ano: 2024,
        igrejaId: "igreja1",
        cargoId: "cargo1",
        criadoEm: "2024-01-01T12:00:00.000Z",
      },
    ],
    exportedAt: new Date().toISOString(),
    exportVersion: "1.0.0",
    source: "Mock Data for Testing",
  };
}

function ensureBackupDirectory() {
  const backupDir = path.join(process.cwd(), "backups");
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
    console.log("📁 Diretório de backup criado: ./backups");
  }
  return backupDir;
}

function generateStatistics(exportData) {
  console.log("\n📊 Estatísticas do Export (Mock):");
  console.log("═".repeat(50));

  let totalRecords = 0;
  const stats = {};

  Object.entries(exportData).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      stats[key] = value.length;
      totalRecords += value.length;
      console.log(
        `📋 ${key.padEnd(15)}: ${value.length.toString().padStart(5)} registros`
      );
    }
  });

  console.log("─".repeat(50));
  console.log(`📈 Total de registros: ${totalRecords}`);
  console.log(`📅 Exportado em: ${exportData.exportedAt}`);

  return { stats, totalRecords };
}

function validateMockData(exportData) {
  console.log("\n🔍 Validando dados mock...");

  const issues = [];

  // Check for required collections
  const requiredCollections = [
    "usuarios",
    "igrejas",
    "cargos",
    "voluntarios",
    "escalas",
  ];
  requiredCollections.forEach((collection) => {
    if (!exportData[collection]) {
      issues.push(`Coleção ${collection} não encontrada`);
    } else if (!Array.isArray(exportData[collection])) {
      issues.push(`Coleção ${collection} não é um array`);
    }
  });

  // Check data integrity
  if (exportData.voluntarios && exportData.voluntarios.length > 0) {
    const voluntariosWithoutIgreja = exportData.voluntarios.filter(
      (v) => !v.igrejaId
    );
    if (voluntariosWithoutIgreja.length > 0) {
      issues.push(
        `${voluntariosWithoutIgreja.length} voluntários sem igrejaId`
      );
    }

    const voluntariosWithoutCargo = exportData.voluntarios.filter(
      (v) => !v.cargoId
    );
    if (voluntariosWithoutCargo.length > 0) {
      issues.push(`${voluntariosWithoutCargo.length} voluntários sem cargoId`);
    }
  }

  if (issues.length > 0) {
    console.log("⚠️  Problemas encontrados:");
    issues.forEach((issue) => console.log(`   • ${issue}`));
  } else {
    console.log("✅ Validação concluída sem problemas");
  }

  return issues;
}

function main() {
  console.log("🧪 Teste do Firebase Export Script (Mock Data)\n");

  try {
    // Create backup directory
    const backupDir = ensureBackupDirectory();

    // Generate mock data
    console.log("📦 Gerando dados mock...\n");
    const exportData = createMockFirebaseData();

    // Validate mock data
    const validationIssues = validateMockData(exportData);

    // Generate filename and save
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .split("T")[0];
    const timeString = new Date()
      .toISOString()
      .split("T")[1]
      .split(".")[0]
      .replace(/:/g, "-");
    const filename = `firebase-export-mock-${timestamp}-${timeString}.json`;
    const filepath = path.join(backupDir, filename);

    console.log(`\n💾 Salvando arquivo mock: ${filepath}`);
    fs.writeFileSync(filepath, JSON.stringify(exportData, null, 2), "utf8");

    // Also save a copy with simple name for easy access
    const simpleFilepath = path.join(
      backupDir,
      "firebase-export-mock-latest.json"
    );
    fs.writeFileSync(
      simpleFilepath,
      JSON.stringify(exportData, null, 2),
      "utf8"
    );

    // Generate statistics
    const { stats, totalRecords } = generateStatistics(exportData);

    // Save statistics to separate file
    const statsFilepath = path.join(backupDir, `export-stats-mock-${filename}`);
    const statsData = {
      filename,
      filepath,
      exportedAt: exportData.exportedAt,
      statistics: stats,
      totalRecords,
      validationIssues,
      fileSize: fs.statSync(filepath).size,
      isMockData: true,
    };

    fs.writeFileSync(statsFilepath, JSON.stringify(statsData, null, 2), "utf8");

    console.log("\n🎉 Teste de export completado com sucesso!");
    console.log(`📁 Arquivo principal: ${filename}`);
    console.log(
      `📁 Arquivo de acesso rápido: firebase-export-mock-latest.json`
    );
    console.log(`📊 Estatísticas: export-stats-mock-${filename}`);
    console.log(
      `💾 Tamanho do arquivo: ${(statsData.fileSize / 1024).toFixed(2)} KB`
    );

    if (validationIssues.length > 0) {
      console.log(
        `\n⚠️  ${validationIssues.length} problema(s) de validação encontrado(s)`
      );
    }

    console.log("\n💡 Este é um teste com dados mock.");
    console.log("📋 Para usar dados reais:");
    console.log("   1. Configure as variáveis de ambiente do Firebase");
    console.log("   2. Execute: npm run firebase:export");
  } catch (error) {
    console.error("\n❌ Erro durante o teste:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
