"use client";

import type React from "react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2, CalendarIcon } from "lucide-react";
import { addPayment } from "@/services/payment-service";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { addAccount } from "@/services/account-service";

export default function AddAccount({
  onSuccess,
  open,
  onOpenChange,
}: {
  onSuccess?: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    amount: "",
    type: "ARS",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Validate amount
      const amount = Number.parseFloat(formData.amount);
      if (isNaN(amount)) {
        throw new Error("Invalid amount - please enter a valid number");
      }

      // Add account
      const result = await addAccount({
        title: formData.title,
        description: formData.description,
        amount: amount,
        type: formData.type,
      });

      if (!result) {
        throw new Error("Failed to add account - no result returned");
      }

      console.log("Accountd added successfully:", result);

      // Reset form
      setIsOpen(false);
      setFormData({
        title: "",
        description: "",
        amount: "",
        type: "",
      });
      setDate(new Date());

      // Call success callback
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Failed to add account:", error);
      setError(error.message || "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Account</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 rounded-md">
              <p className="font-bold">Error:</p>
              <p>{error}</p>
            </div>
          )}
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="name">Account Name</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Account name"
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
              placeholder="Account description"
              className="min-h-[80px]"
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
          </div>
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="status">Type</Label>
            <Select
              value={formData.type}
              defaultValue="ARS"
              onValueChange={(value) => handleSelectChange("type", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="ARS" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ARS">ARS - Peso argentino</SelectItem>
                <SelectItem value="USD">USD - Dolar estadounidense</SelectItem>
                <SelectItem value="EUR">EUR - Euro</SelectItem>
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
                "Save Account"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
