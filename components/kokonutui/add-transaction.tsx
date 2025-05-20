"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, CalendarIcon } from "lucide-react"
import { addTransaction, getCurrentUserId } from "@/services/transaction-service"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"

export default function AddTransaction({ onSuccess , open,  onOpenChange, accounts }:{
  onSuccess?: () => void
  open: boolean
  onOpenChange: (open: boolean) => void
  accounts : []
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [date, setDate] = useState<Date>(new Date())
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    type: "outgoing",
    category: "shopping",
    account: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
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

      // Prepare transaction data
      const transactionData = {
        title: formData.title,
        amount: formData.type === "outgoing" ? -Math.abs(amount) : Math.abs(amount),
        category: formData.category,
        account: formData.account,
        type: formData.type as "incoming" | "outgoing",
        timestamp: date.toISOString(),
      }

      // Debug info
      const debugData = {
        authStatus,
        userId,
        transactionData,
      }

      console.log("Attempting to add transaction:", debugData)
      setDebugInfo(debugData)

      // Add transaction
      const result = await addTransaction(transactionData)

      if (!result) {
        throw new Error("Failed to add transaction - no result returned")
      }

      console.log("Transaction added successfully:", result)

      // Reset form
      setIsOpen(false)
      setFormData({
        title: "",
        amount: "",
        type: "outgoing",
        category: "shopping",
        account: "",
      })
      setDate(new Date())

      // Call success callback
      if (onSuccess) onSuccess()
    } catch (error: any) {
      console.error("Failed to add transaction:", error)
      setError(error.message || "An unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 rounded-md">
              <p className="font-bold">Error:</p>
              <p>{error}</p>
            </div>
          )}

          <div className="grid w-full items-center gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Transaction title"
              required
            />
          </div>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="type">Type</Label>
              <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="incoming">Incoming</SelectItem>
                  <SelectItem value="outgoing">Outgoing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid w-full items-center gap-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="shopping">Shopping</SelectItem>
                  <SelectItem value="food">Food</SelectItem>
                  <SelectItem value="transport">Transport</SelectItem>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                  <SelectItem value="housing">Housing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid w-full items-center gap-2">
  <Label htmlFor="account">Account</Label>
  <Select
    value={formData.account}
    onValueChange={(value) => handleSelectChange("account", value)}
  >
    <SelectTrigger>
      <SelectValue placeholder="Select account" />
    </SelectTrigger>
    <SelectContent>
      {accounts.map((account: any) => (
        <SelectItem key={account.id} value={account.title + " - " + account.description}>
          {account.title} - {account.description}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>


          {debugInfo && (
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded-md">
              <p className="font-bold">Debug Info:</p>
              <pre className="text-xs overflow-auto max-h-40">{JSON.stringify(debugInfo, null, 2)}</pre>
            </div>
          )}

          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Transaction"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

