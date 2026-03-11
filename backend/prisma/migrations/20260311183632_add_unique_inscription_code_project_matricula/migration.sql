-- CreateIndex (idempotent - index may already exist in dev db)
CREATE UNIQUE INDEX IF NOT EXISTS "InscriptionCode_projectId_matricula_key" ON "InscriptionCode"("projectId", "matricula");
