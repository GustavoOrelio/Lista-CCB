#!/usr/bin/env node

/**
 * Script de Export do Firebase para PostgreSQL
 * Exporta todas as coleções do Firebase para arquivos JSON
 */

require("dotenv").config();
const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  getDocs,
  Timestamp,
} = require("firebase/firestore");
const fs = require("fs");
const path = require("path");

// Firebase configuration - Load from environment or config file
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate Firebase configuration
function validateFirebaseConfig() {
  const requiredFields = ["projectId", "apiKey", "authDomain"];
  const missingFields = requiredFields.filter(
    (field) => !firebaseConfig[field]
  );

  if (missingFields.length > 0) {
    console.error(
      "❌ Configuração Firebase incompleta. Campos obrigatórios faltando:",
      missingFields
    );
    console.log(
      "💡 Verifique se as variáveis de ambiente estão configuradas ou configure diretamente no script."
    );
    process.exit(1);
  }
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Helper function to convert Firebase Timestamps to ISO strings
function convertTimestamps(data) {
  if (data === null || data === undefined) return data;

  if (data instanceof Timestamp) {
    return data.toDate().toISOString();
  }

  if (Array.isArray(data)) {
    return data.map(convertTimestamps);
  }

  if (typeof data === "object") {
    const converted = {};
    for (const [key, value] of Object.entries(data)) {
      converted[key] = convertTimestamps(value);
    }
    return converted;
  }

  return data;
}

// Enhanced export function with error handling and progress tracking
async function exportCollection(collectionName) {
  console.log(`📦 Exportando coleção: ${collectionName}...`);

  try {
    const snapshot = await getDocs(collection(db, collectionName));

    if (snapshot.empty) {
      console.log(`⚠️  Coleção ${collectionName} está vazia`);
      return [];
    }

    const data = snapshot.docs.map((doc) => {
      const docData = doc.data();

      // Convert all timestamps in the document
      const convertedData = convertTimestamps(docData);

      return {
        id: doc.id,
        ...convertedData,
      };
    });

    console.log(`✅ ${collectionName}: ${data.length} documentos exportados`);
    return data;
  } catch (error) {
    console.error(`❌ Erro ao exportar ${collectionName}:`, error);
    throw error;
  }
}

// Generate export statistics
function generateStatistics(exportData) {
  console.log("\n📊 Estatísticas do Export:");
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

// Create backup directory if it doesn't exist
function ensureBackupDirectory() {
  const backupDir = path.join(process.cwd(), "backups");
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
    console.log("📁 Diretório de backup criado: ./backups");
  }
  return backupDir;
}

// Generate filename with timestamp
function generateFilename() {
  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, "-")
    .split("T")[0];
  const timeString = new Date()
    .toISOString()
    .split("T")[1]
    .split(".")[0]
    .replace(/:/g, "-");
  return `firebase-export-${timestamp}-${timeString}.json`;
}

// Validate exported data
function validateExportData(exportData) {
  console.log("\n🔍 Validando dados exportados...");

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

// Main export function
async function main() {
  console.log("🚀 Iniciando export do Firebase...\n");

  try {
    // Validate Firebase configuration
    validateFirebaseConfig();

    // Create backup directory
    const backupDir = ensureBackupDirectory();

    // Export all collections
    console.log("📦 Exportando coleções...\n");

    const exportData = {
      usuarios: await exportCollection("usuarios"),
      igrejas: await exportCollection("igrejas"),
      cargos: await exportCollection("cargos"),
      voluntarios: await exportCollection("voluntarios"),
      escalas: await exportCollection("escalas"),
      exportedAt: new Date().toISOString(),
      exportVersion: "1.0.0",
      source: "Firebase Firestore",
    };

    // Validate exported data
    const validationIssues = validateExportData(exportData);

    // Generate filename and save
    const filename = generateFilename();
    const filepath = path.join(backupDir, filename);

    console.log(`\n💾 Salvando arquivo: ${filepath}`);
    fs.writeFileSync(filepath, JSON.stringify(exportData, null, 2), "utf8");

    // Also save a copy with simple name for easy access
    const simpleFilepath = path.join(backupDir, "firebase-export-latest.json");
    fs.writeFileSync(
      simpleFilepath,
      JSON.stringify(exportData, null, 2),
      "utf8"
    );

    // Generate statistics
    const { stats, totalRecords } = generateStatistics(exportData);

    // Save statistics to separate file
    const statsFilepath = path.join(
      backupDir,
      `export-stats-${filename.replace(".json", ".json")}`
    );
    const statsData = {
      filename,
      filepath,
      exportedAt: exportData.exportedAt,
      statistics: stats,
      totalRecords,
      validationIssues,
      fileSize: fs.statSync(filepath).size,
    };

    fs.writeFileSync(statsFilepath, JSON.stringify(statsData, null, 2), "utf8");

    console.log("\n🎉 Export completado com sucesso!");
    console.log(`📁 Arquivo principal: ${filename}`);
    console.log(`📁 Arquivo de acesso rápido: firebase-export-latest.json`);
    console.log(`📊 Estatísticas: export-stats-${filename}`);
    console.log(
      `💾 Tamanho do arquivo: ${(statsData.fileSize / 1024).toFixed(2)} KB`
    );

    if (validationIssues.length > 0) {
      console.log(
        `\n⚠️  ${validationIssues.length} problema(s) de validação encontrado(s)`
      );
      console.log(
        "📋 Verifique os detalhes acima antes de prosseguir com a migração"
      );
    }
  } catch (error) {
    console.error("\n❌ Erro durante o export:", error);

    if (error instanceof Error) {
      console.error("Detalhes do erro:", error.message);
      if (error.stack) {
        console.error("Stack trace:", error.stack);
      }
    }

    process.exit(1);
  }
}

// Execute only if run directly
if (require.main === module) {
  main();
}

module.exports = { exportCollection, convertTimestamps, validateExportData };
