-- AlterTable
ALTER TABLE "Chapter" ADD COLUMN "stamp" TEXT;

-- AlterTable
ALTER TABLE "ChapterVersion" ADD COLUMN "stamp" TEXT;

-- AlterTable
ALTER TABLE "Job" ADD COLUMN "progress" INTEGER;
ALTER TABLE "Job" ADD COLUMN "progressNote" TEXT;

-- CreateTable
CREATE TABLE "SoutenancePrep" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "thesisId" TEXT NOT NULL,
    "slides" TEXT NOT NULL DEFAULT '[]',
    "speech" TEXT NOT NULL DEFAULT '',
    "speechDurationMin" INTEGER NOT NULL DEFAULT 15,
    "questions" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SoutenancePrep_thesisId_fkey" FOREIGN KEY ("thesisId") REFERENCES "Thesis" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LegalRef" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "domaine" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "joradp" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'à vérifier',
    "textesLies" TEXT,
    "portee" TEXT,
    "questions" TEXT,
    "autorites" TEXT,
    "derniereVerification" DATETIME,
    "niveauConfiance" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "thesisId" TEXT,
    "title" TEXT NOT NULL,
    "articleType" TEXT NOT NULL DEFAULT 'empirique',
    "discipline" TEXT,
    "targetLang" TEXT NOT NULL DEFAULT 'fr',
    "targetWords" INTEGER NOT NULL DEFAULT 6000,
    "biblioStyle" TEXT NOT NULL DEFAULT 'APA',
    "targetJournal" TEXT,
    "journalGuide" TEXT,
    "authors" TEXT,
    "angle" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "plan" TEXT,
    "sections" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ArticleVersion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "articleId" TEXT NOT NULL,
    "label" TEXT,
    "sections" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ArticleVersion_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ImportedDoc" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "thesisId" TEXT,
    "filename" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "data" BLOB,
    "text" TEXT NOT NULL,
    "pages" INTEGER,
    "limits" TEXT NOT NULL DEFAULT '[]',
    "scanned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CustomBookSkill" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "author" TEXT,
    "content" TEXT NOT NULL,
    "tags" TEXT,
    "description" TEXT,
    "source" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_CustomBookSkill" ("author", "content", "createdAt", "id", "tags", "title", "updatedAt") SELECT "author", "content", "createdAt", "id", "tags", "title", "updatedAt" FROM "CustomBookSkill";
DROP TABLE "CustomBookSkill";
ALTER TABLE "new_CustomBookSkill" RENAME TO "CustomBookSkill";
CREATE INDEX "CustomBookSkill_title_idx" ON "CustomBookSkill"("title");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "SoutenancePrep_thesisId_key" ON "SoutenancePrep"("thesisId");

-- CreateIndex
CREATE INDEX "SoutenancePrep_thesisId_idx" ON "SoutenancePrep"("thesisId");

-- CreateIndex
CREATE INDEX "LegalRef_domaine_idx" ON "LegalRef"("domaine");

-- CreateIndex
CREATE INDEX "Article_thesisId_idx" ON "Article"("thesisId");

-- CreateIndex
CREATE INDEX "ArticleVersion_articleId_idx" ON "ArticleVersion"("articleId");

-- CreateIndex
CREATE INDEX "ImportedDoc_thesisId_idx" ON "ImportedDoc"("thesisId");

