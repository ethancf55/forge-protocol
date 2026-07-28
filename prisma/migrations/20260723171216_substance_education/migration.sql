-- CreateTable
CREATE TABLE "SubstanceEducation" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameNormalized" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'generating',
    "contentJson" TEXT NOT NULL DEFAULT '{}',
    "model" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubstanceEducation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SubstanceEducation_kind_status_idx" ON "SubstanceEducation"("kind", "status");

-- CreateIndex
CREATE UNIQUE INDEX "SubstanceEducation_kind_nameNormalized_key" ON "SubstanceEducation"("kind", "nameNormalized");

-- CreateIndex
CREATE UNIQUE INDEX "SubstanceEducation_kind_slug_key" ON "SubstanceEducation"("kind", "slug");
