"use client";

import type React from "react";

import { cn } from "@/lib/utils";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  ShoppingCart,
  CreditCard,
  ArrowRight,
  Loader2,
  RefreshCw,
  Plus
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  type Transaction,
  getTransactions,
  deleteTransaction,
} from "@/services/transaction-service";
import { format } from "date-fns";
import { DeleteTransactionModal } from "./delete-transaction";
import AddTransaction from "./add-transaction";

interface TransactionWithIcon extends Transaction {
  icon: React.ElementType;
}

interface List02Props {
  className?: string;
  refreshTrigger?: number;
  onSuccess: () => void
  accounts : []
}

const categoryIcons: Record<string, React.ElementType> = {
  shopping: ShoppingCart,
  food: ShoppingCart,
  transport: Wallet,
  entertainment: CreditCard,
  income: Wallet,
  housing: CreditCard,
  default: CreditCard,
};

export default function List02({ className, refreshTrigger = 0 , onSuccess, accounts}: List02Props) {
  const [transactions, setTransactions] = useState<TransactionWithIcon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(
    null
  );
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false)

  // Combine external and internal refresh triggers
  const combinedRefreshKey = refreshTrigger + refreshKey;

  useEffect(() => {
    async function loadTransactions() {
      setIsLoading(true);
      try {
        const data = await getTransactions();
        const transactionsWithIcons = data.map((transaction) => ({
          ...transaction,
          icon: categoryIcons[transaction.category] || categoryIcons.default,
        }));
        setTransactions(transactionsWithIcons);
      } catch (error) {
        console.error("Failed to load transactions:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadTransactions();
  }, [combinedRefreshKey]);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleDelete = (id: string) => {
    setTransactionToDelete(id);
    setIsModalOpen(true);
  };
  const handleModalClose = () => {
    setIsModalOpen(false);
    setTransactionToDelete(null);
  };


  return (
    <>
    <AddTransaction
      accounts={accounts}
      open={isAddTransactionOpen}
      onOpenChange={setIsAddTransactionOpen}
      onSuccess={() => {
        setIsAddTransactionOpen(false)
        setRefreshKey((prev) => prev + 1)
      }}
    />
        <button
            type="button"
           className={cn(
                         "flex items-center justify-center gap-2",
                         "py-2 px-3 rounded-lg",
                         "text-xs font-medium",
                         "bg-zinc-900 dark:bg-zinc-50",
                         "text-zinc-50 dark:text-zinc-900",
                         "hover:bg-zinc-800 dark:hover:bg-zinc-200",
                         "shadow-sm hover:shadow",
                         "transition-all duration-200",
                         "mb-2"
            )}
            onClick={() => setIsAddTransactionOpen(true)}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
    <div
      className={cn(
        "w-full max-w-xl mx-auto",
        "bg-white dark:bg-zinc-900/70",
        "border border-zinc-100 dark:border-zinc-800",
        "rounded-xl shadow-sm backdrop-blur-xl",
        className
      )}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Recent Activity
            <span className="text-xs font-normal text-zinc-600 dark:text-zinc-400 ml-1">
              ({transactions.length} transactions)
            </span>
          </h2>
          <button
            onClick={handleRefresh}
            className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            disabled={isLoading}
            aria-label="Refresh transactions"
          >
            <RefreshCw
              className={`w-4 h-4 text-zinc-500 dark:text-zinc-400 ${
                isLoading ? "animate-spin" : ""
              }`}
            />
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="w-6 h-6 text-zinc-400 animate-spin" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
            <p>No transactions found</p>
            <p className="text-xs mt-1">
              Add your first transaction to get started
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {transactions.map((transaction) => {
              const Icon = transaction.icon;
              return (
                <div
                  key={transaction.id}
                  className={cn(
                    "group flex items-center gap-3",
                    "p-2 rounded-lg",
                    "hover:bg-zinc-100 dark:hover:bg-zinc-800/50",
                    "transition-all duration-200"
                  )}
                >
                  <div
                    className={cn(
                      "p-2 rounded-lg",
                      "bg-zinc-100 dark:bg-zinc-800",
                      "border border-zinc-200 dark:border-zinc-700"
                    )}
                  >
                    <Icon className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
                  </div>

                  <div className="flex-1 flex items-center justify-between min-w-0">
                    <div className="space-y-0.5">
                      <h3 className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                        {transaction.title}
                      </h3>
                      {transaction.description && (
                        <p className="text-[11px] text-zinc-600 dark:text-zinc-400 line-clamp-1">
                          {transaction.description}
                        </p>
                      )}
                       {transaction.account && (
                        <p className="text-[11px] text-zinc-600 dark:text-zinc-400 line-clamp-1 w-60">
                          {transaction.account}
                        </p>
                      )}
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                        {format(new Date(transaction.timestamp), "PPP")}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 pl-3">
                      <span
                        className={cn(
                          "text-xs font-medium",
                          transaction.type === "incoming"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-red-600 dark:text-red-400"
                        )}
                      >
                        {transaction.type === "incoming" ? "+" : "-"}$
                        {Math.abs(Number(transaction.amount)).toFixed(2)}
                      </span>
                      {transaction.type === "incoming" ? (
                        <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <ArrowUpRight className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                      )}
                    </div>

                    <button
                      onClick={() => handleDelete(transaction.id)}
                      className="ml-2 p-1 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700"
                      aria-label="Delete transaction"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-zinc-500 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400"
                      >
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
            {isModalOpen && transactionToDelete && (
              <DeleteTransactionModal
                transactionId={transactionToDelete}
                onClose={handleModalClose}
                onSuccess={() => {
                  setTransactions((prev) =>
                    prev.filter((t) => t.id !== transactionToDelete)
                  );
                  handleRefresh(); 
                  handleModalClose();
                  if (onSuccess) onSuccess()
                }}
              />
            )}
          </div>
        )}
      </div>

      {/* <div className="p-2 border-t border-zinc-100 dark:border-zinc-800">
        <button
          type="button"
          className={cn(
            "w-full flex items-center justify-center gap-2",
            "py-2 px-3 rounded-lg",
            "text-xs font-medium",
            "bg-gradient-to-r from-zinc-900 to-zinc-800",
            "dark:from-zinc-50 dark:to-zinc-200",
            "text-zinc-50 dark:text-zinc-900",
            "hover:from-zinc-800 hover:to-zinc-700",
            "dark:hover:from-zinc-200 dark:hover:to-zinc-300",
            "shadow-sm hover:shadow",
            "transform transition-all duration-200",
            "hover:-translate-y-0.5",
            "active:translate-y-0",
            "focus:outline-none focus:ring-2",
            "focus:ring-zinc-500 dark:focus:ring-zinc-400",
            "focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
          )}
        >
          <span>View All Transactions</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div> */}
    </div>
    </>
  );
}
