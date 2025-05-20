"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"

export default function DebugPanel() {
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    setError(null)
    try {
      // Test if we can connect to Supabase
      const { data, error } = await supabase.from("transactions").select("count(*)").single()

      if (error) {
        setError(error.message)
        setResult(null)
      } else {
        setResult(data)
        setError(null)
      }
    } catch (err: any) {
      setError(err.message || "Unknown error")
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  const checkTables = async () => {
    setLoading(true)
    setError(null)
    try {
      // List all tables in the public schema
      const { data, error } = await supabase.from("pg_tables").select("tablename").eq("schemaname", "public")

      if (error) {
        setError(error.message)
        setResult(null)
      } else {
        setResult(data)
        setError(null)
      }
    } catch (err: any) {
      setError(err.message || "Unknown error")
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-zinc-900 mt-4">
      <h2 className="text-lg font-bold mb-4">Debug Panel</h2>

      <div className="flex gap-2 mb-4">
        <Button onClick={testConnection} disabled={loading}>
          {loading ? "Testing..." : "Test Connection"}
        </Button>
        <Button onClick={checkTables} disabled={loading}>
          {loading ? "Checking..." : "Check Tables"}
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 rounded-md mb-4">
          <p className="font-bold">Error:</p>
          <p className="font-mono text-sm">{error}</p>
        </div>
      )}

      {result && (
        <div className="p-3 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 rounded-md">
          <p className="font-bold">Result:</p>
          <pre className="font-mono text-sm overflow-auto max-h-40">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}

