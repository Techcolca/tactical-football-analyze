/*
  Warnings:

  - You are about to drop the column `dateOfBirth` on the `players` table. All the data in the column will be lost.
  - You are about to drop the column `height` on the `players` table. All the data in the column will be lost.
  - You are about to drop the column `nationality` on the `players` table. All the data in the column will be lost.
  - You are about to drop the column `preferredFoot` on the `players` table. All the data in the column will be lost.
  - You are about to drop the column `weight` on the `players` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "players" DROP COLUMN "dateOfBirth",
DROP COLUMN "height",
DROP COLUMN "nationality",
DROP COLUMN "preferredFoot",
DROP COLUMN "weight",
ADD COLUMN     "photoUrl" TEXT;
