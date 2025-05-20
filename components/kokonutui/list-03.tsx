"use client";

import { cn } from "@/lib/utils";
import {
  Calendar,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Receipt,
  CreditCard,
  Car,
  Home,
  Banknote,
  Plus,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  type Payment,
  getPayments,
  updatePayment,
} from "@/services/payment-service";
import { format, isPast, isToday } from "date-fns";
import UpdatePayment from "./update-payment";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import AddPayment from "./add-payment";
import { DeletePaymentModal } from "./delete-payment";

interface List03Props {
  className?: string;
  refreshCount?: number;
}

const statusConfig = {
  pending: {
    icon: Clock,
    class: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-100 dark:bg-amber-900/30",
  },
  paid: {
    icon: CheckCircle2,
    class: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
  },
  overdue: {
    icon: AlertTriangle,
    class: "text-red-600 dark:text-red-400",
    bg: "bg-red-100 dark:bg-red-900/30",
  },
  cancelled: {
    icon: XCircle,
    class: "text-zinc-600 dark:text-zinc-400",
    bg: "bg-zinc-100 dark:bg-zinc-800/50",
  },
};

export default function List03({ className }: List03Props) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [updateCounter, setUpdateCounter] = useState(0);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null);

  useEffect(() => {
    async function loadPayments() {
      setIsLoading(true);
      try {
        const data = await getPayments();
        setPayments(data);
      } catch (error) {
        console.error("Failed to load payments:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadPayments();
  }, [refreshKey, updateCounter]);

  // Function to determine the actual status based on date and current status
  const getEffectiveStatus = (payment: Payment) => {
    const expDate = new Date(payment.expiration_date);

    if (payment.status === "paid" || payment.status === "cancelled") {
      return payment.status;
    }

    if (payment.status === "pending" && isPast(expDate) && !isToday(expDate)) {
      return "overdue";
    }

    return payment.status;
  };

  const handleModalClose = () => {
    setShowModal(false);
    setUpdateCounter((prev) => prev + 1);
  };

  return (
    <>
      <AddPayment
        open={isAddPaymentOpen}
        onOpenChange={setIsAddPaymentOpen}
        onSuccess={() => {
          setIsAddPaymentOpen(false);
          setRefreshKey((prev) => prev + 1);
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
        onClick={() => setIsAddPaymentOpen(true)}
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Add</span>
      </button>
      <div className={cn("w-full overflow-x-auto scrollbar-none", className)}>
        <div className="relative">
          <Carousel
            opts={{
              align: "start",
            }}
            className="w-full max-w-full"
          >
            <CarouselContent className="flex px-10">
              {isLoading ? (
                <div className="flex justify-center items-center w-full py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-800 dark:border-zinc-200"></div>
                </div>
              ) : payments.length === 0 ? (
                <div className="flex justify-center items-center w-full py-8 text-zinc-500 dark:text-zinc-400">
                  No payments found
                </div>
              ) : (
                payments.map((payment) => {
                  const effectiveStatus = getEffectiveStatus(payment);
                  const StatusIcon =
                    statusConfig[effectiveStatus as keyof typeof statusConfig]
                      ?.icon || Clock;

                  return (
                    <CarouselItem key={payment.id} className="basis-1/4 m">
                      <div
                        className={cn(
                          "flex flex-col",
                          "w-full",
                          "bg-white dark:bg-zinc-900/70",
                          "rounded-xl",
                          "border border-zinc-100 dark:border-zinc-800",
                          "hover:border-zinc-200 dark:hover:border-zinc-700",
                          "transition-all duration-200",
                          "shadow-sm backdrop-blur-xl"
                        )}
                      >
                        <div className="p-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <div
                              className={cn(
                                "p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800"
                              )}
                            >
                              {payment.type === "credit-card" && (
                                <CreditCard className="w-6 h-6 text-zinc-900 dark:text-zinc-100" />
                              )}
                              {payment.type === "car" && (
                                <Car className="w-6 h-6 text-zinc-900 dark:text-zinc-100" />
                              )}
                              {payment.type === "home" && (
                                <Home className="w-6 h-6 text-zinc-900 dark:text-zinc-100" />
                              )}
                              {payment.type === "personal" && (
                                <Banknote className="w-6 h-6 text-zinc-900 dark:text-zinc-100" />
                              )}
                            </div>
                            <div
                              className={cn(
                                "px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1.5",
                                statusConfig[
                                  effectiveStatus as keyof typeof statusConfig
                                ]?.bg,
                                statusConfig[
                                  effectiveStatus as keyof typeof statusConfig
                                ]?.class
                              )}
                            >
                              <StatusIcon className="w-3.5 h-3.5" />
                              {effectiveStatus.charAt(0).toUpperCase() +
                                effectiveStatus.slice(1)}
                            </div>
                          </div>

                          <div>
                            <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-1">
                              {payment.name}
                            </h3>
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
                              {payment.description || "-"}
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                              {payment.amount.toLocaleString("es-AR", {
                                style: "currency",
                                currency: "ARS",
                              })}
                            </span>
                            <span className="text-xs text-zinc-600 dark:text-zinc-400">
                              due amount
                            </span>
                          </div>

                          <div className="flex items-center text-xs text-zinc-600 dark:text-zinc-400">
                            <Calendar className="w-3.5 h-3.5 mr-1.5" />
                            <span>Due: {payment.expiration_date}</span>
                          </div>
                          <div className="flex items-center text-xs text-zinc-600 dark:text-zinc-400">
                            <Calendar className="w-3.5 h-3.5 mr-1.5" />
                            <span>Payment Date: {payment.payment_date}</span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end justify-center gap-4 p-2">
                          <button
                            onClick={() => setPaymentToDelete(payment.id)}
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
                        {selectedPaymentId && (
                          <UpdatePayment
                            onClose={() => {
                              setSelectedPaymentId(null);
                              setUpdateCounter((prev) => prev + 1);
                            }}
                            paymentId={selectedPaymentId}
                          />
                        )}
                        <div className="mt-auto border-t border-zinc-100 dark:border-zinc-800">
                          <button
                            className={cn(
                              "w-full flex items-center justify-center gap-2",
                              "py-2.5 px-3",
                              "text-xs font-medium",
                              "text-zinc-600 dark:text-zinc-400",
                              "hover:text-zinc-900 dark:hover:text-zinc-100",
                              "hover:bg-zinc-100 dark:hover:bg-zinc-800/50",
                              "transition-colors duration-200"
                            )}
                            onClick={() => {
                              setSelectedPaymentId(payment.id);
                            }}
                          >
                            Update
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      {paymentToDelete && (
                        <DeletePaymentModal
                          paymentId={paymentToDelete}
                          onClose={() => setPaymentToDelete(null)}
                          onSuccess={() => {
                            setPaymentToDelete(null);
                            setRefreshKey((prev) => prev + 1);
                          }}
                        />
                      )}
                    </CarouselItem>
                  );
                })
              )}
            </CarouselContent>

            {/* Position the carousel buttons with z-index so they stay on top */}
            <CarouselPrevious className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10" />
            <CarouselNext className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10" />
          </Carousel>
        </div>
      </div>
    </>
  );
}
