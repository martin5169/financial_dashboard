import { cn } from "@/lib/utils";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  SendHorizontal,
  QrCode,
  Plus,
  ArrowRight,
  CreditCard,
  Loader2,
  DollarSign,
} from "lucide-react";
import { useEffect, useState } from "react";
import { type Account, getAccounts } from "@/services/account-service";
import AddAccount from "./add-account";
import UpdateAccount from "./update-account";
import { DeleteAccountModal } from "./delete-account";

interface List01Props {
  totalBalanceArs?: number;
  totalBalanceUsd?: number;
  className?: string;
  refreshKey: number;
  isLoading?: boolean;
  onSuccess: () => void;
}

export default function List01({
  className,
  totalBalanceArs,
  totalBalanceUsd,
  onSuccess,
}: List01Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [accounts, setAccounts] = useState([]);
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isUpdateAccountOpen, setIsUpdateAccountOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);


  useEffect(() => {
    async function loadAccounts() {
      setIsLoading(true);
      try {
        const data = await getAccounts();
        setAccounts(data);
      } catch (error) {
        console.error("Failed to load payments:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadAccounts();
  }, [refreshKey]);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleDelete = (id: string) => {
    setAccountToDelete(id);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setAccountToDelete(null);
  };

  return (
    <>
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
        onClick={() => setIsAddAccountOpen(true)}
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
        {/* Total Balance Section */}
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
          <p className="text-xs text-zinc-600 dark:text-zinc-400 text-center pb-3">
            Total Balance
          </p>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-6 h-6 text-zinc-400 animate-spin" />
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {totalBalanceArs?.toLocaleString("es-AR", {
                  style: "currency",
                  currency: "ARS",
                })}
              </h1>
              <h1 className="text-2xl font-semibold text-zinc-900 dark:text-emerald-400">
                {totalBalanceUsd?.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })}
              </h1>
            </div>
          )}
        </div>
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
              Your Accounts
            </h2>
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-6 h-6 text-zinc-400 animate-spin" />
            </div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
              <p>No accounts found</p>
              <p className="text-xs mt-1">
                Add your first count to get started
              </p>
            </div>
          ) : (
<div className="space-y-1">
  {accounts.map((account) => (
    <button
      key={account.id}
      className="appearance-none border-none bg-transparent p-0 m-0 w-full text-left"
      onClick={() => {
        setSelectedAccount(account);
        setIsUpdateAccountOpen(true);
      }}
    >
      <div
        className={cn(
          "group flex items-center justify-between",
          "p-2 rounded-lg",
          "hover:bg-zinc-100 dark:hover:bg-zinc-800/50",
          "transition-all duration-200"
        )}
      >
        <div className="flex items-center gap-2">
          <div
            className={cn("p-1.5 rounded-lg", {
              "bg-emerald-100 dark:bg-emerald-900/30":
                account.type === "savings",
              "bg-blue-100 dark:bg-blue-900/30":
                account.type === "checking",
              "bg-purple-100 dark:bg-purple-900/30":
                account.type === "investment",
            })}
          >
            {account.type === "ARS" && (
              <DollarSign className="w-6 h-6 text-zinc-900 dark:text-zinc-100" />
            )}
            {account.type === "USD" && (
              <DollarSign className="w-6 h-6 text-zinc-900 dark:text-emerald-400" />
            )}
            {account.type === "checking" && (
              <QrCode className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            )}
            {account.type === "investment" && (
              <ArrowUpRight className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            )}
            {account.type === "debt" && (
              <CreditCard className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
            )}
          </div>
          <div>
            <h3 className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
              {account.title}
            </h3>
            {account.description && (
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                {account.type}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end justify-center gap-2">
          <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
            {account.amount.toLocaleString("es-AR", {
              style: "currency",
              currency: "ARS",
            })}
          </span>
          <button
            onClick={() => handleDelete(account.id)}
            className="p-1 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700"
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
              className="text-zinc-500 dark:text-red-400 hover:text-red-500 dark:hover:text-red-400"
            >
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    </button>
  ))}
</div>

          )}
        </div>

        <AddAccount
          open={isAddAccountOpen}
          onOpenChange={setIsAddAccountOpen}
          onSuccess={() => {
            setIsAddAccountOpen(false);
            setRefreshKey((prev) => prev + 1);
            handleRefresh();
            handleModalClose();
            if (onSuccess) onSuccess();
          }}
        />

<UpdateAccount
  open={isUpdateAccountOpen}
  onOpenChange={setIsUpdateAccountOpen}
  onSuccess={() => {
    setIsUpdateAccountOpen(false);
    setRefreshKey((prev) => prev + 1);
    handleRefresh();
    handleModalClose();
    if (onSuccess) onSuccess();
  }}
  selectedAccount={selectedAccount}
/>



        {isModalOpen && accountToDelete && (
          <DeleteAccountModal
            accountId={accountToDelete}
            onClose={handleModalClose}
            onSuccess={() => {
              setAccounts((prev) =>
                prev.filter((t) => t.id !== accountToDelete)
              );
              handleRefresh();
              handleModalClose();
              if (onSuccess) onSuccess();
            }}
          />
        )}

        {/* Updated footer with four buttons */}
        <div className="p-2 border-t border-zinc-100 dark:border-zinc-800">
          <div className="grid grid-cols-4 gap-2">
            {/* <button
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
            )}
            onClick={() => setIsAddAccountOpen(true)}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button> */}
            {/* <button
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
            )}
          >
            <SendHorizontal className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
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
            )}
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>Top-up</span>
          </button>
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
            )}
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>More</span>
          </button> */}
          </div>
        </div>
      </div>
    </>
  );
}
