-- RedefineTables
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Inscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "alumnoId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Inscrito',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Inscription_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Inscription_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Inscription_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "Period" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO "new_Inscription" ("id", "alumnoId", "projectId", "periodId", "status", "createdAt")
SELECT i."id", i."alumnoId", i."projectId", p."periodId", i."status", i."createdAt"
FROM "Inscription" i
JOIN "Project" p ON p."id" = i."projectId";

DROP TABLE "Inscription";
ALTER TABLE "new_Inscription" RENAME TO "Inscription";

PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "Inscription_alumnoId_periodId_key" ON "Inscription"("alumnoId", "periodId");
