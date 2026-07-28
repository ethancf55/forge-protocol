-- CreateTable
CREATE TABLE "UserStackEducation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "substancesHash" TEXT NOT NULL,
    "substancesJson" TEXT NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'generating',
    "contentJson" TEXT NOT NULL DEFAULT '{}',
    "model" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserStackEducation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserStackEducation_userId_updatedAt_idx" ON "UserStackEducation"("userId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserStackEducation_userId_substancesHash_key" ON "UserStackEducation"("userId", "substancesHash");

-- AddForeignKey
ALTER TABLE "UserStackEducation" ADD CONSTRAINT "UserStackEducation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
