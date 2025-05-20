/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: "https://hocxsogjtcewdukfwycg.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvY3hzb2dqdGNld2R1a2Z3eWNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2OTU0MzgsImV4cCI6MjA1OTI3MTQzOH0.5O5Gcn5zlU3pfu22Aqpv1Wj6g7ZvqDu4URnUy42AGHU",
  },
  // This is important for Next.js middleware
  experimental: {
    serverComponentsExternalPackages: ["@supabase/auth-helpers-nextjs"],
  },
}

module.exports = nextConfig

