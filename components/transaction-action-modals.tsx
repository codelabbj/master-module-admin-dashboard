"use client"

import { useState } from "react"
import { useApi } from "@/lib/useApi"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"

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
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const apiFetch = useApi()
    const { toast } = useToast()

    const isSuccess = actionType === "success"
    const title = isSuccess ? "Marquer comme succès" : "Marquer comme échec"
    const description = isSuccess
        ? "Êtes-vous sûr de vouloir marquer cette transaction comme succès ? Cette action mettra à jour le statut de la transaction."
        : "Êtes-vous sûr de vouloir marquer cette transaction comme échec ? Cette action mettra à jour le statut de la transaction."

    const defaultReason = "Action initiée par l'administrateur"

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
                body: JSON.stringify({ reason: defaultReason }),
            })

            toast({
                title: isSuccess ? "Succès mis à jour" : "Échec mis à jour",
                description: `La transaction a été marquée comme ${isSuccess ? "succès" : "échec"} avec succès.`,
            })

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

                <div className="py-4">
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
