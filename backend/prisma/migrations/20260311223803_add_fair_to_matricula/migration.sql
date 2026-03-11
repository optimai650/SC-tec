/*
  Warnings:

  - Added the required column `fairId` to the `PreregisteredMatricula` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "InscriptionCode_projectId_matricula_key";

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PreregisteredMatricula" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "matricula" TEXT NOT NULL,
    "nombre" TEXT,
    "email" TEXT,
    "fairId" TEXT NOT NULL,
    "importedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PreregisteredMatricula_fairId_fkey" FOREIGN KEY ("fairId") REFERENCES "Fair" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PreregisteredMatricula" ("email", "id", "importedAt", "matricula", "nombre") SELECT "email", "id", "importedAt", "matricula", "nombre" FROM "PreregisteredMatricula";
DROP TABLE "PreregisteredMatricula";
ALTER TABLE "new_PreregisteredMatricula" RENAME TO "PreregisteredMatricula";
CREATE UNIQUE INDEX "PreregisteredMatricula_matricula_fairId_key" ON "PreregisteredMatricula"("matricula", "fairId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
