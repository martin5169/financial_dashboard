"use client";

import { Calendar, CreditCard, Wallet } from "lucide-react";
import List01 from "./list-01";
import List02 from "./list-02";
import List03 from "./list-03";
import DebugPanel from "../debug-panel";
import SupabaseDebug from "../supabase-debug";
import { useState, useEffect } from "react";
import { getTotalAmount, getAccounts } from "@/services/account-service";
import AddPayment from "./add-payment";
import { getPayments } from "@/services/payment-service";

export default function Content() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [paymentAdded, setPaymentAdded] = useState(0);
  const [accountAdded,setAccountAdded] = useState(0);
  const [showDebug, setShowDebug] = useState(false);
  const [totalBalance, setTotalBalance] = useState(0);
  const [paymentList, setPaymentList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [accounts,setAccounts] = useState([]);

  const handleTransactionAdded = () => {
    setRefreshKey((prev) => prev + 1);
  };
  const handleAccountAdded = () => {
    setRefreshKey((prev) => prev + 1);
  };

  useEffect(() => {
    async function getTotal() {
      try {
        const data = await getTotalAmount();
        setTotalBalance(data);
        console.log(">>>>>>>>>>",data)
      } catch (error) {
        console.error("Failed to load transactions:", error);
      } finally {
        setIsLoading(false);
      }
    }
    getTotal();
  }, [refreshKey]);


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
  

  
  useEffect(() => {
    async function geyPaymentData() {
      try {
        const data = await getPayments();
        setPaymentList(data);
      } catch (error) {
        console.error("Failed to load transactions:", error);
      } finally {
        setIsLoading(false);
      }
    }
    geyPaymentData();
  }, [paymentAdded]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Financial Dashboard
          </h1>
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="text-xs text-gray-500 dark:text-gray-400 mt-1 underline"
          >
            {showDebug ? "Hide Debug" : "Show Debug"}
          </button>
        </div>
      </div>

      {showDebug && (
        <div className="space-y-4">
          <DebugPanel />
          <SupabaseDebug />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 flex flex-col border border-gray-200 dark:border-[#1F1F23]">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 text-left flex items-center gap-2 ">
            <Wallet className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-50" />
            Accounts
          </h2>
          <div className="flex-1">
            <List01
              totalBalanceArs={totalBalance.totalAmountArs}
              totalBalanceUsd={totalBalance.totalAmountUsd}
              refreshKey={refreshKey}
              onSuccess={handleAccountAdded}
            />
          </div>
        </div>
        <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 flex flex-col border border-gray-200 dark:border-[#1F1F23]">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 text-left flex items-center gap-2">
            <CreditCard className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-50" />
            Recent Transactions
          </h2>
          <div className="flex-1">
            <List02
              refreshTrigger={refreshKey}
              onSuccess={handleTransactionAdded}
              accounts={accounts}
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 flex flex-col items-start justify-start border border-gray-200 dark:border-[#1F1F23]">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 text-left flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-50" />
          Upcoming Payments
        </h2>
        <List03/>
      </div>
    </div>
  );
}
