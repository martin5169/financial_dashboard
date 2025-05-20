"use client";

import type React from "react";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { updateAccount } from "@/services/account-service"; 

interface UpdateAccountProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  selectedAccount: Account | null;
}

export default function UpdateAccount({
  onSuccess,
  open,
  onOpenChange,
  selectedAccount,
}: UpdateAccountProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    amount: "",
    type: "ARS",
  });

  // 🔄 Set form data when selectedAccount changes
  useEffect(() => {
    if (selectedAccount) {
      setFormData({
        title: selectedAccount.title || "",
        description: selectedAccount.description || "",
        amount: selectedAccount.amount?.toString() || "",
        type: selectedAccount.type || "ARS",
      });
    }
  }, [selectedAccount]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, type: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount)) {
        throw new Error("Amount must be a number.");
      }

      if (!selectedAccount) {
        throw new Error("No account selected for update.");
      }

      const result = await updateAccount(selectedAccount!.id, {
        title: formData.title,
        description: formData.description,
        amount: amount,
        type: formData.type,
      });

      if (!result) throw new Error("Update failed.");

      if (onSuccess) onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Account</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 rounded-md">
              <p className="font-bold">Error:</p>
              <p>{error}</p>
            </div>
          )}

          <div className="grid w-full items-center gap-2">
            <Label htmlFor="title">Account Name</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
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
                required
              />
            </div>
          </div>

          <div className="grid w-full items-center gap-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={formData.type}
              onValueChange={handleSelectChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ARS">ARS - Peso argentino</SelectItem>
                <SelectItem value="USD">USD - Dólar estadounidense</SelectItem>
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
                "Save changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
