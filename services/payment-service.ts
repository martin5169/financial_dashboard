import { supabase } from "@/lib/supabase"

export interface Payment {
  id: string
  name: string
  description?: string
  amount: number
  expiration_date: string
  status: "pending" | "paid" | "overdue" | "cancelled" 
  user_id?: string
  created_at?: string
  updated_at?: string
  payment_date?:string
  type?:string
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

export async function getPayments(): Promise<Payment[]> {
  try {
    console.log("Fetching payments from Supabase...")

    // Try to get the current user ID
    const userId = await getCurrentUserId()

    let query = supabase.from("payments").select("*")

    // If we have a user ID, filter by it
    if (userId) {
      console.log("Filtering payments by user ID:", userId)
      query = query.eq("user_id", userId)
    } else {
      console.log("No user ID available, using default user ID:", DEFAULT_USER_ID)
      query = query.eq("user_id", DEFAULT_USER_ID)
    }

    const { data, error } = await query.order("expiration_date", { ascending: true })

    if (error) {
      console.error("Error fetching payments:", error)
      return []
    }

    console.log(`Successfully fetched ${data?.length || 0} payments`)
    return data || []
  } catch (error) {
    console.error("Unexpected error in getPayments:", error)
    return []
  }
}

export async function addPayment(payment: Omit<Payment, "id">): Promise<Payment | null> {
  try {
    console.log("Adding payment:", payment)

    // Try to get the current user ID
    const userId = await getCurrentUserId()

    // Add the user_id to the payment
    const paymentWithUserId = {
      ...payment,
      user_id: userId || DEFAULT_USER_ID,
    }

    console.log("Payment with user_id:", paymentWithUserId)

    // Insert the payment
    const { data, error } = await supabase.from("payments").insert([paymentWithUserId]).select().single()

    if (error) {
      console.error("Error adding payment:", error)
      throw new Error(`Failed to add payment: ${error.message}`)
    }

    console.log("Successfully added payment:", data)
    return data
  } catch (error: any) {
    console.error("Unexpected error in addPayment:", error)
    throw error
  }
}

export async function updatePayment(id: string, updates: Partial<Payment>): Promise<Payment | null> {
  try {

    
    const { data, error } = await supabase.from("payments").update(updates).eq("id", id).select().single()

    if (error) {
      console.error("Error updating payment:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in updatePayment:", error)
    return null
  }
}

export async function deletePayment(id: string): Promise<boolean> {
  try {
    console.log("Deleting payment with ID:", id)

    const { error } = await supabase.from("payments").delete().eq("id", id)

    if (error) {
      console.error("Error deleting payment:", error)
      return false
    }

    console.log("Successfully deleted payment")
    return true
  } catch (error) {
    console.error("Error in deletePayment:", error)
    return false
  }
}

