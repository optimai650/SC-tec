-- AlterTable
ALTER TABLE "Inscription" ADD COLUMN "certificateHash" TEXT;
ALTER TABLE "Inscription" ADD COLUMN "certificatePayload" TEXT;
ALTER TABLE "Inscription" ADD COLUMN "certificateSignature" TEXT;
ALTER TABLE "Inscription" ADD COLUMN "certificateSignedAt" DATETIME;
ALTER TABLE "Inscription" ADD COLUMN "revokedAt" DATETIME;
ALTER TABLE "Inscription" ADD COLUMN "revokedReason" TEXT;
