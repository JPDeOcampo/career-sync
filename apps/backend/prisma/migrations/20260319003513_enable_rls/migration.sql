-- LOCAL SAFEGUARD: Create the 'authenticated' role if it doesn't exist (Fixes P3006/P1014)
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN 
    CREATE ROLE authenticated; 
  END IF; 
END $$;

-- LOCAL SAFEGUARD: Create the 'auth' schema and 'uid()' function if they don't exist
CREATE SCHEMA IF NOT EXISTS auth;
CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid AS $$ 
  SELECT null::uuid; 
$$ LANGUAGE sql;

-- Enable RLS
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Job" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Document" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "InterviewStage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RefreshToken" ENABLE ROW LEVEL SECURITY;

-- Create Policies
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

-- Policy for RefreshToken to clear those "Sensitive Column" errors
DROP POLICY IF EXISTS "Users can manage their own tokens" ON "RefreshToken";
CREATE POLICY "Users can manage their own tokens" 
ON "RefreshToken" FOR ALL TO authenticated 
USING (auth.uid() = "userId")
WITH CHECK (auth.uid() = "userId");