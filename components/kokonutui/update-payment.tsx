"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Loader2, CalendarIcon } from "lucide-react"
import { addTransaction, getCurrentUserId } from "@/services/transaction-service"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import { updatePayment } from "@/services/payment-service"

interface UpdatePaymentModalProps {
    paymentId: string
    onClose : () => void
  }

export default function UpdatePayment({ paymentId , onClose }: UpdatePaymentModalProps){
  const [isLoading, setIsLoading] = useState(false)
  const [date, setDate] = useState<Date>(new Date())
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [formData, setFormData] = useState({
    amount: "",
    status: "paid",
  })
  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const checkAuthStatus = async () => {
    try {
      const { data, error } = await supabase.auth.getSession()
      return {
        session: data.session,
        error: error?.message,
      }
    } catch (err: any) {
      return {
        session: null,
        error: err.message,
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setDebugInfo(null)
    setIsLoading(true)

    try {
      // Check auth status first
      const authStatus = await checkAuthStatus()

      // Get user ID
      const userId = await getCurrentUserId()

      // Validate amount
      const amount = Number.parseFloat(formData.amount)
      if (isNaN(amount)) {
        throw new Error("Invalid amount - please enter a valid number")
      }

      const updates = {
        amount: amount,
        payment_date: date.toISOString(), // Ensure date is in ISO format
        status: "paid", // Set status to 'paid'
      }

      const result = await updatePayment(paymentId, updates)
      
      if (!result) {
        throw new Error("Failed to update payment - no result returned")
      }
  
      console.log("Payment updated successfully:", result)
  
      // Reset form
      setFormData({
        amount: "",
        status: "paid",
      })
      setDate(new Date())
  
      // Call success callback
      onClose() // Close the modal after success
    } catch (error: any) {
      console.error("Failed to add transaction:", error)
      setError(error.message || "An unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Payment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 rounded-md">
              <p className="font-bold">Error:</p>
              <p>{error}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                required
              />
            </div>

            <div className="grid w-full items-center gap-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={date} onSelect={(date) => date && setDate(date)} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

