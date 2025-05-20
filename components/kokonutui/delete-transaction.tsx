import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { deleteTransaction } from "@/services/transaction-service"

interface DeleteTransactionModalProps {
  transactionId: string
  onClose: () => void
  onSuccess: () => void
}

export function DeleteTransactionModal({ transactionId, onClose, onSuccess, }: DeleteTransactionModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      const success = await deleteTransaction(transactionId)
      if (success) {
        onSuccess() // Actualizar las transacciones y cerrar el modal
      } else {
        alert("Error al eliminar la transacción.")
      }
    } catch (error) {
      console.error("Failed to delete transaction:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Delete Transaction</DialogTitle>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleDelete} disabled={isLoading} className=" text-red-400">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
