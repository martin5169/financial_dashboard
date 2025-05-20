"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Loader2, CalendarIcon } from "lucide-react"
import { addPayment } from "@/services/payment-service"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export default function AddPayment({
  onSuccess,
  open,
  onOpenChange,
}: {
  onSuccess?: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [date, setDate] = useState<Date>(new Date())
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    amount: "",
    status: "pending",
    type:""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // Validate amount
      const amount = Number.parseFloat(formData.amount)
      if (isNaN(amount)) {
        throw new Error("Invalid amount - please enter a valid number")
      }

      // Add payment
      const result = await addPayment({
        name: formData.name,
        description: formData.description,
        amount: amount,
        expiration_date: date.toISOString().split("T")[0], // Format as YYYY-MM-DD
        status: formData.status as "pending" | "paid" | "overdue" | "cancelled",
        type:formData.type
      })

      if (!result) {
        throw new Error("Failed to add payment - no result returned")
      }

      console.log("Payment added successfully:", result)

      // Reset form
      setIsOpen(false)
      setFormData({
        name: "",
        description: "",
        amount: "",
        status: "pending",
        type:""
      })
      setDate(new Date())

      // Call success callback
      if (onSuccess) onSuccess()
    } catch (error: any) {
      console.error("Failed to add payment:", error)
      setError(error.message || "An unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Payment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 rounded-md">
              <p className="font-bold">Error:</p>
              <p>{error}</p>
            </div>
          )}

          <div className="grid w-full items-center gap-2">
            <Label htmlFor="name">Payment Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Payment name"
              required
            />
          </div>

          <div className="grid w-full items-center gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Payment description"
              className="min-h-[80px]"
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
              <Label>Expiration Date</Label>
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

          <div className="grid w-full items-center gap-2">
            <Label htmlFor="status">Type</Label>
            <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="credit-card">Credit Card</SelectItem>
                <SelectItem value="home">Home</SelectItem>
                <SelectItem value="car">Car</SelectItem>
                <SelectItem value="personal">Personal expenses</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid w-full items-center gap-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          

          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Payment"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

