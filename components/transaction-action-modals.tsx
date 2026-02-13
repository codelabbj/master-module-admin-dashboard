"use client"

import { useState } from "react"
import { useApi } from "@/lib/useApi"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"

interface TransactionActionModalsProps {
    isOpen: boolean
    onClose: () => void
    transaction: any
    actionType: "success" | "failed"
    onSuccess: () => void
    baseUrl: string
}

export function TransactionActionModals({
    isOpen,
    onClose,
    transaction,
    actionType,
    onSuccess,
    baseUrl,
}: TransactionActionModalsProps) {
    const [reason, setReason] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const apiFetch = useApi()
    const { toast } = useToast()

    const isSuccess = actionType === "success"
    const title = isSuccess ? "Marquer comme succès" : "Marquer comme échec"
    const description = isSuccess
        ? "Fournir une raison pour marquer cette transaction comme succès."
        : "Fournir une raison pour marquer cette transaction comme échec."

    const defaultReason = isSuccess ? "Mise à jour manuelle : Succès" : "Mise à jour manuelle : Échec"

    const handleSubmit = async () => {
        if (!transaction) return

        setLoading(true)
        setError("")

        try {
            const endpoint = isSuccess
                ? `${baseUrl.replace(/\/$/, "")}/api/payments/transactions/${transaction.uid}/success/`
                : `${baseUrl.replace(/\/$/, "")}/api/payments/transactions/${transaction.uid}/mark-failed/`

            await apiFetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reason: reason.trim() || defaultReason }),
            })

            toast({
                title: isSuccess ? "Succès mis à jour" : "Échec mis à jour",
                description: `La transaction a été marquée comme ${isSuccess ? "succès" : "échec"} avec succès.`,
            })

            setReason("")
            onSuccess()
            onClose()
        } catch (err: any) {
            const errorMessage = extractErrorMessages(err)
            setError(errorMessage)
            toast({
                title: "Erreur",
                description: errorMessage,
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Raison</label>
                        <Input
                            placeholder={defaultReason}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    {error && (
                        <ErrorDisplay
                            error={error}
                            variant="inline"
                            showRetry={false}
                        />
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Annuler
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading} variant={isSuccess ? "default" : "destructive"}>
                        {loading ? "Chargement..." : "Confirmer"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
