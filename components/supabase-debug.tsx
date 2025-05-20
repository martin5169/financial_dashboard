"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function SupabaseDebug() {
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

  const checkAuth = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase.auth.getSession()

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

  const testInsert = async () => {
    setLoading(true)
    setError(null)
    try {
      // Try to insert a test transaction
      const testTransaction = {
        title: "Test Transaction",
        amount: 10.0,
        type: "incoming",
        category: "test",
        timestamp: new Date().toISOString(),
        status: "completed",
        user_id: "00000000-0000-0000-0000-000000000000", // Default user ID
      }

      const { data, error } = await supabase.from("transactions").insert([testTransaction]).select().single()

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

  const checkRLS = async () => {
    setLoading(true)
    setError(null)
    try {
      // Check RLS policies
      const { data, error } = await supabase.from("pg_policies").select("*").eq("tablename", "transactions")

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
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Supabase Debug</CardTitle>
        <CardDescription>Test your Supabase connection and authentication</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          <Button onClick={testConnection} disabled={loading} variant="outline">
            {loading ? "Testing..." : "Test Connection"}
          </Button>
          <Button onClick={checkAuth} disabled={loading} variant="outline">
            {loading ? "Checking..." : "Check Auth"}
          </Button>
          <Button onClick={testInsert} disabled={loading} variant="outline">
            {loading ? "Testing..." : "Test Insert"}
          </Button>
          <Button onClick={checkRLS} disabled={loading} variant="outline">
            {loading ? "Checking..." : "Check RLS"}
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
      </CardContent>
      <CardFooter>
        <p className="text-xs text-gray-500">Check the browser console for more detailed logs.</p>
      </CardFooter>
    </Card>
  )
}

