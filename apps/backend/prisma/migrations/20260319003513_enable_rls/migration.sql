-- This is an empty migration.
-- Enable RLS
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Job" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Document" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "InterviewStage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RefreshToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;

-- Create Policies (Using IF NOT EXISTS or dropping first to prevent CI errors)
DROP POLICY IF EXISTS "Users can manage their own jobs" ON "Job";
CREATE POLICY "Users can manage their own jobs" 
ON "Job" FOR ALL TO authenticated 
USING (auth.uid() = "userId")
WITH CHECK (auth.uid() = "userId");

DROP POLICY IF EXISTS "Users can manage their own profile" ON "User";
CREATE POLICY "Users can manage their own profile" 
ON "User" FOR ALL TO authenticated 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);