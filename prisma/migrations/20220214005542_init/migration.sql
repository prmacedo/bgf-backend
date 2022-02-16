-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "telephone" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT,
    "nationality" TEXT NOT NULL,
    "gender" CHAR(1) NOT NULL,
    "rg" VARCHAR(13) NOT NULL,
    "cpf" VARCHAR(14) NOT NULL,
    "profession" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,
    "telephone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cep" VARCHAR(10) NOT NULL,
    "city" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "uf" CHAR(2) NOT NULL,
    "district" TEXT NOT NULL,
    "complement" TEXT,
    "maritalStatus" TEXT NOT NULL,
    "partnerId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Partner" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "nationality" TEXT NOT NULL,
    "gender" CHAR(1) NOT NULL,
    "rg" VARCHAR(13) NOT NULL,
    "cpf" VARCHAR(14) NOT NULL,
    "profession" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cep" VARCHAR(10) NOT NULL,
    "city" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "uf" CHAR(2) NOT NULL,
    "district" TEXT NOT NULL,
    "complement" TEXT,
    "marriageRegime" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Partner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assignee" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "cnpj" VARCHAR(18) NOT NULL,
    "email" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "cep" VARCHAR(10) NOT NULL,
    "city" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "uf" CHAR(2) NOT NULL,
    "district" TEXT NOT NULL,
    "complement" TEXT,
    "adminId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assignee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Administrator" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "cep" VARCHAR(10) NOT NULL,
    "city" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "uf" CHAR(2) NOT NULL,
    "district" TEXT NOT NULL,
    "complement" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Administrator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "precatory" TEXT NOT NULL,
    "process" TEXT NOT NULL,
    "court" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "correction" DOUBLE PRECISION NOT NULL,
    "fee" DOUBLE PRECISION NOT NULL,
    "preference" DOUBLE PRECISION NOT NULL,
    "taxes" DOUBLE PRECISION NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,
    "updatedValue" DOUBLE PRECISION NOT NULL,
    "liquidValue" DOUBLE PRECISION NOT NULL,
    "proposalValue" DOUBLE PRECISION NOT NULL,
    "entity" TEXT,
    "farmCourt" TEXT,
    "precatoryValue" DOUBLE PRECISION,
    "attorneyFee" DOUBLE PRECISION,
    "place" TEXT,
    "proposalDate" TIMESTAMP(3),
    "contractDate" TIMESTAMP(3),
    "clientId" INTEGER NOT NULL,
    "assigneeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Client_email_key" ON "Client"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Client_partnerId_key" ON "Client"("partnerId");

-- CreateIndex
CREATE UNIQUE INDEX "Partner_email_key" ON "Partner"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Document_precatory_key" ON "Document"("precatory");

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignee" ADD CONSTRAINT "Assignee_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Administrator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "Assignee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
