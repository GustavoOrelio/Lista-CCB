-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "uid" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "igrejaId" TEXT,
    "cargo" TEXT,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "igrejas" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cultoDomingoRDJ" BOOLEAN NOT NULL DEFAULT false,
    "cultoDomingo" BOOLEAN NOT NULL DEFAULT false,
    "cultoSegunda" BOOLEAN NOT NULL DEFAULT false,
    "cultoTerca" BOOLEAN NOT NULL DEFAULT false,
    "cultoQuarta" BOOLEAN NOT NULL DEFAULT false,
    "cultoQuinta" BOOLEAN NOT NULL DEFAULT false,
    "cultoSexta" BOOLEAN NOT NULL DEFAULT false,
    "cultoSabado" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "igrejas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cargos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cargos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voluntarios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "igrejaId" TEXT NOT NULL,
    "cargoId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "domingoRDJ" BOOLEAN NOT NULL DEFAULT false,
    "domingo" BOOLEAN NOT NULL DEFAULT false,
    "segunda" BOOLEAN NOT NULL DEFAULT false,
    "terca" BOOLEAN NOT NULL DEFAULT false,
    "quarta" BOOLEAN NOT NULL DEFAULT false,
    "quinta" BOOLEAN NOT NULL DEFAULT false,
    "sexta" BOOLEAN NOT NULL DEFAULT false,
    "sabado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "voluntarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "escala_itens" (
    "id" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "igrejaId" TEXT NOT NULL,
    "cargoId" TEXT NOT NULL,
    "tipoCulto" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "escala_itens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voluntario_escalas" (
    "id" TEXT NOT NULL,
    "voluntarioId" TEXT NOT NULL,
    "escalaItemId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "voluntario_escalas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_uid_key" ON "usuarios"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "voluntario_escalas_voluntarioId_escalaItemId_key" ON "voluntario_escalas"("voluntarioId", "escalaItemId");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_igrejaId_fkey" FOREIGN KEY ("igrejaId") REFERENCES "igrejas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voluntarios" ADD CONSTRAINT "voluntarios_igrejaId_fkey" FOREIGN KEY ("igrejaId") REFERENCES "igrejas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voluntarios" ADD CONSTRAINT "voluntarios_cargoId_fkey" FOREIGN KEY ("cargoId") REFERENCES "cargos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escala_itens" ADD CONSTRAINT "escala_itens_igrejaId_fkey" FOREIGN KEY ("igrejaId") REFERENCES "igrejas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escala_itens" ADD CONSTRAINT "escala_itens_cargoId_fkey" FOREIGN KEY ("cargoId") REFERENCES "cargos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voluntario_escalas" ADD CONSTRAINT "voluntario_escalas_voluntarioId_fkey" FOREIGN KEY ("voluntarioId") REFERENCES "voluntarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voluntario_escalas" ADD CONSTRAINT "voluntario_escalas_escalaItemId_fkey" FOREIGN KEY ("escalaItemId") REFERENCES "escala_itens"("id") ON DELETE CASCADE ON UPDATE CASCADE;
