/* eslint-disable @typescript-eslint/no-require-imports */
require("dotenv").config({ path: ".env.local" });
const { initializeApp } = require("firebase/app");
const { getAuth, createUserWithEmailAndPassword } = require("firebase/auth");
const { getFirestore, setDoc, doc } = require("firebase/firestore");

// Configuração do Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createAdminUser() {
  try {
    // Dados do usuário admin
    const email = "admin@admin.com";
    const password = "admin123456";
    const nome = "Administrador";

    // Criar usuário no Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const uid = userCredential.user.uid;

    // Criar documento do usuário no Firestore
    await setDoc(doc(db, "usuarios", uid), {
      uid,
      nome,
      email,
      isAdmin: true,
      igreja: "", // Admin não precisa estar vinculado a uma igreja específica
      cargo: "", // Admin não precisa estar vinculado a um cargo específico
    });

    console.log("Usuário administrador criado com sucesso!");
    console.log("Email:", email);
    console.log("Senha:", password);

    process.exit(0);
  } catch (error) {
    console.error("Erro ao criar usuário administrador:", error);
    process.exit(1);
  }
}

createAdminUser();
