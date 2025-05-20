import { supabase } from "@/lib/supabase"

export interface Account {
  id: string
  title: string
  description : string
  amount: number
  type?: string
  user_id?: string
  created_at?: string
  updated_at?: string
}

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

export async function getAccounts(): Promise<Account[]> {
  try {
    console.log("Fetching accounts from Supabase...")

    const userId = await getCurrentUserId()

    let query = supabase.from("accounts").select("*")

    if (userId) {
      console.log("Filtering accounts by user ID:", userId)
      query = query.eq("user_id", userId)
    } else {
      console.log("No user ID available, using default user ID:", DEFAULT_USER_ID)
      query = query.eq("user_id", DEFAULT_USER_ID)
    }

    const { data, error } = await query.order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching accounts:", error)
      return []
    }

    console.log(`Successfully fetched ${data?.length || 0} accounts`)
    return data || []
  } catch (error) {
    console.error("Unexpected error in getAccounts:", error)
    return []
  }
}

export async function addAccount(account: Omit<Account, "id">): Promise<Account | null> {
  try {
    console.log("Adding account:", account)

    const userId = await getCurrentUserId()

    const accountWithUserId = {
      ...account,
      user_id: userId || DEFAULT_USER_ID,
    }

    const { data, error } = await supabase
      .from("accounts")
      .insert([accountWithUserId])
      .select()
      .single()

    if (error) {
      console.error("Error adding account:", error)
      throw new Error(`Failed to add account: ${error.message}`)
    }

    console.log("Successfully added account:", data)
    return data
  } catch (error: any) {
    console.error("Unexpected error in addAccount:", error)
    throw error
  }
}

export async function updateAccount(id: string, updates: Partial<Account>): Promise<Account | null> {
  try {
    const { data, error } = await supabase
      .from("accounts")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating account:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in updateAccount:", error)
    return null
  }
}

export async function deleteAccount(id: string): Promise<boolean> {
  try {
    console.log("Deleting account with ID:", id)

    const { error } = await supabase.from("accounts").delete().eq("id", id)

    if (error) {
      console.error("Error deleting account:", error)
      return false
    }

    console.log("Successfully deleted account")
    return true
  } catch (error) {
    console.error("Error in deleteAccount:", error)
    return false
  }
}

export async function getTotalAmount(): Promise<{ totalAmountArs: number, totalAmountUsd: number }> {
  try {
    console.log("Fetching total amount of ARS and USD accounts")

    const { data, error } = await supabase
      .from("accounts")
      .select("amount, type") // ✅ important

    if (error) {
      console.error("Error fetching accounts:", error)
      return { totalAmountArs: 0, totalAmountUsd: 0 }
    }

    console.log("Fetched data:", data)

    const totalAmountArs = data.reduce(
      (sum, account) => sum + (account.type === 'ARS' ? parseFloat(account.amount) : 0),
      0
    )

    const totalAmountUsd = data.reduce(
      (sum, account) => sum + (account.type === 'USD' ? parseFloat(account.amount) : 0),
      0
    )

    console.log("Total ARS amount:", totalAmountArs)
    console.log("Total USD amount:", totalAmountUsd)

    return { totalAmountArs, totalAmountUsd }
  } catch (error) {
    console.error("Error in getTotalAmount:", error)
    return { totalAmountArs: 0, totalAmountUsd: 0 }
  }
}

