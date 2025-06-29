/* eslint-disable @typescript-eslint/no-require-imports */
require("dotenv").config({ path: ".env.local" });
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    const email = "admin@admin.com";
    const password = "admin123";
    const nome = "Administrador";

    // Verificar se o usuário já existe
    const existingUser = await prisma.usuario.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log("Usuário admin já existe! Atualizando...");

      // Atualizar o usuário existente para garantir que isAdmin seja true
      const updatedUser = await prisma.usuario.update({
        where: { email },
        data: {
          nome,
          senha: await bcrypt.hash(password, 10),
          isAdmin: true,
        },
      });

      console.log("Usuário admin atualizado com sucesso!");
      console.log("Email:", email);
      console.log("Senha:", password);
      console.log("ID:", updatedUser.id);
      console.log("isAdmin:", updatedUser.isAdmin);
      return;
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar o usuário admin
    const user = await prisma.usuario.create({
      data: {
        uid: "admin-uid",
        nome,
        email,
        senha: hashedPassword,
        cargo: "Administrador",
        isAdmin: true,
      },
    });

    console.log("Usuário admin criado com sucesso!");
    console.log("Email:", email);
    console.log("Senha:", password);
    console.log("ID:", user.id);
    console.log("isAdmin:", user.isAdmin);
  } catch (error) {
    console.error("Erro ao criar usuário admin:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
