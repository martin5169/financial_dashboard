import { supabase } from "@/lib/supabase"

export interface Transaction {
  id: string
  title: string
  description?: string
  amount: number
  type: "incoming" | "outgoing"
  category: string
  timestamp: string
  user_id?: string
  account:string
}

// Use a default user ID for all transactions when not authenticated
const DEFAULT_USER_ID = "de8b95c7-3193-4f80-86d3-9212a60fe79b"

export async function getCurrentUserId(): Promise<string | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    console.log("Current user:", user)
    return user?.id || null
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

export async function getTransactions(): Promise<Transaction[]> {
  try {
    console.log("Fetching transactions from Supabase...")

    // Try to get the current user ID
    const userId = DEFAULT_USER_ID

    let query = supabase.from("transactions").select("*")

    // If we have a user ID, filter by it
    if (userId) {
      console.log("Filtering transactions by user ID:", userId)
      query = query.eq("user_id", userId)
    } else {
      console.log("No user ID available, using default user ID:", DEFAULT_USER_ID)
      query = query.eq("user_id", DEFAULT_USER_ID)
    }

    const { data, error } = await query.order("timestamp", { ascending: false })

    if (error) {
      console.error("Error fetching transactions:", error)
      return []
    }

    console.log(`Successfully fetched ${data?.length || 0} transactions`)
    return data || []
  } catch (error) {
    console.error("Unexpected error in getTransactions:", error)
    return []
  }
}

export async function addTransaction(transaction: Omit<Transaction, "id">): Promise<Transaction | null> {
  try {
    console.log("Adding transaction:", transaction)

    // Try to get the current user ID
    const userId = await getCurrentUserId()

    // Add the user_id to the transaction
    const transactionWithUserId = {
      ...transaction,
      user_id: userId || DEFAULT_USER_ID,
    }

    console.log("Transaction with user_id:", transactionWithUserId)

    // Insert the transaction
    const { data, error } = await supabase.from("transactions").insert([transactionWithUserId]).select().single()

    if (error) {
      console.error("Error adding transaction:", error)
      throw new Error(`Failed to add transaction: ${error.message}`)
    }

    console.log("Successfully added transaction:", data)
    return data
  } catch (error: any) {
    console.error("Unexpected error in addTransaction:", error)
    throw error
  }
}

export async function updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction | null> {
  try {
    const { data, error } = await supabase.from("transactions").update(updates).eq("id", id).select().single()

    if (error) {
      console.error("Error updating transaction:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in updateTransaction:", error)
    return null
  }
}

export async function deleteTransaction(id: string): Promise<boolean> {
  try {
    console.log("Deleting transaction with ID:", id)

    const { error } = await supabase.from("transactions").delete().eq("id", id)

    if (error) {
      console.error("Error deleting transaction:", error)
      return false
    }

    console.log("Successfully deleted transaction")
    return true
  } catch (error) {
    console.error("Error in deleteTransaction:", error)
    return false
  }
}




