import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { deleteAccount } from "@/services/account-service"

interface DeleteAccountModalProps {
  accountId: string
  onClose: () => void
  onSuccess: () => void
}

export function DeleteAccountModal({ accountId, onClose, onSuccess, }: DeleteAccountModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      const success = await deleteAccount(accountId)
      if (success) {
        onSuccess() // Actualizar las transacciones y cerrar el modal
      } else {
        alert("Error al eliminar la cuenta.")
      }
    } catch (error) {
      console.error("Failed to delete account:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Delete Account</DialogTitle>
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
