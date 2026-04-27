-- Drop unique constraint on (alumnoId, periodId) to allow re-enrollment after cancellation
-- Uniqueness is now enforced at application level (filtering revokedAt: null)

DROP INDEX IF EXISTS "Inscription_alumnoId_periodId_key";

-- Create a regular index for query performance
CREATE INDEX IF NOT EXISTS "Inscription_alumnoId_periodId_idx" ON "Inscription"("alumnoId", "periodId");
