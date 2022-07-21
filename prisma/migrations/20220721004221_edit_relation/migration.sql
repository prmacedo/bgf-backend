/*
  Warnings:

  - You are about to drop the column `adminId` on the `Assignee` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[assigneeId]` on the table `Administrator` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `assigneeId` to the `Administrator` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Assignee" DROP CONSTRAINT "Assignee_adminId_fkey";

-- AlterTable
ALTER TABLE "Administrator" ADD COLUMN     "assigneeId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Assignee" DROP COLUMN "adminId";

-- CreateIndex
CREATE UNIQUE INDEX "Administrator_assigneeId_key" ON "Administrator"("assigneeId");

-- AddForeignKey
ALTER TABLE "Administrator" ADD CONSTRAINT "Administrator_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "Assignee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
