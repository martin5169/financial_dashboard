import { createClient } from "@supabase/supabase-js"

// Use the values directly from the user's input
const supabaseUrl = "https://hocxsogjtcewdukfwycg.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvY3hzb2dqdGNld2R1a2Z3eWNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2OTU0MzgsImV4cCI6MjA1OTI3MTQzOH0.5O5Gcn5zlU3pfu22Aqpv1Wj6g7ZvqDu4URnUy42AGHU"

// Create a Supabase client with debug logging
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Don't persist session since we're not using auth
  },
  global: {
    headers: {
      "x-application-name": "financial-dashboard",
    },
  },
})

// Log that the client has been initialized
console.log("Supabase client initialized with URL:", supabaseUrl)

