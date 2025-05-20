-- Create a policy to allow anonymous access to transactions
CREATE POLICY "Allow anonymous access to transactions"
ON public.transactions
FOR ALL
USING (true)
WITH CHECK (true);

-- Alternatively, you can disable RLS temporarily for testing
-- ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;

