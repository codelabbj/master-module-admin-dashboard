"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/lib/useApi";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display";
import { ArrowLeft, DollarSign, Calendar, TrendingUp, Users, Loader2, Save, AlertTriangle, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";


export default function CommissionStatPage({ params }: { params: { user_id: string } }) {
  const userId = params.user_id;
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState("");
  const [lastPeriodEnd, setLastPeriodEnd] = useState<string | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const apiFetch = useApi();
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
  const router = useRouter();

  useEffect(() => {
    fetchStats();
  }, [userId, baseUrl, apiFetch]);

  // Handle opening the payload input modal
  const handlePayClick = () => {
    setPayError("");
    setModalOpen(true);
  };

  // Handle the "Payer la commission" button in the payload modal
  const handlePayCommissionClick = () => {
    setModalOpen(false);
    setConfirmModalOpen(true);
  };

  // Handle the final confirmation and API call
  const handleConfirmPay = async () => {
    setConfirmModalOpen(false);
    setPayLoading(true);
    setPayError("");
    try {
      const now = new Date().toISOString();
      const payload = {
        amount: parseFloat(amount),
        period_start: lastPeriodEnd || stats?.period_info?.start || now,
        period_end: now,
        admin_notes: adminNote,
      };
      const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/admin/users/${userId}/pay-commission/`;
      await apiFetch(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });
      setAmount("");
      setAdminNote("");
      // Refetch stats
      await fetchStats();
    } catch (err: any) {
      const errorMessage = extractErrorMessages(err);
      setPayError(errorMessage);
      // Reopen the payload modal to show the error
      setModalOpen(true);
    } finally {
      setPayLoading(false);
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    setError("");
    try {
      const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/admin/users/${userId}/commission-stats/`;
      const data = await apiFetch(endpoint);
      setStats(data);
      // Find last period_end from commission_history
      if (data.commission_history && data.commission_history.length > 0) {
        const last = data.commission_history[data.commission_history.length - 1];
        setLastPeriodEnd(last.period_end);
      }
    } catch (err: any) {
      setError(extractErrorMessages(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await fetchStats();
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="h-8 w-48 bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse" />
            <div className="h-4 w-64 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
          </div>
          <div className="h-6 w-32 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-800 rounded mb-2" />
                <div className="h-8 w-16 bg-neutral-200 dark:bg-neutral-800 rounded mb-2" />
                <div className="h-3 w-32 bg-neutral-200 dark:bg-neutral-800 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Statistiques de commission
          </h1>
          <p className="text-muted-foreground">
            Voir et gérer les données de commission des partenaires
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-accent rounded-lg">
            <DollarSign className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              ID: {userId}
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={handlePayClick}>
                <DollarSign className="h-4 w-4 mr-2" />
                Payer la commission
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <span>Payer la commission</span>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {payError && (
                  <div className="flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm">{payError}</span>
                  </div>
                )}
                <div>
                  <Label htmlFor="amount">Montant</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Montant (ex: 25000.00)"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="adminNote">Notes d'administrateur</Label>
                  <Textarea
                    id="adminNote"
                    placeholder="Notes optionnelles sur ce paiement"
                    value={adminNote}
                    onChange={e => setAdminNote(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setModalOpen(false)}>
                  Annuler
                </Button>
                <Button
                  onClick={handlePayCommissionClick}
                  disabled={!amount}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Payer la commission
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error && (
        <Card>
          <CardContent className="p-6">
            <ErrorDisplay error={error} onRetry={handleRefresh} />
          </CardContent>
        </Card>
      )}

      {stats && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Commissions totales</p>
                    <p className="text-2xl font-bold text-foreground">
                      {(parseFloat(stats.total_commissions || 0))} XOF
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Commissions en attente</p>
                    <p className="text-2xl font-bold text-foreground">
                      {(parseFloat(stats.pending_commissions || 0))} XOF
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Transactions totales</p>
                    <p className="text-2xl font-bold text-foreground">
                      {stats.total_transactions || 0}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Period Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Informations sur la période
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Début de période</p>
                    <p className="text-foreground">
                      {stats.period_info?.start ? new Date(stats.period_info.start).toLocaleDateString() : 'Non défini'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Fin de période</p>
                    <p className="text-foreground">
                      {stats.period_info?.end ? new Date(stats.period_info.end).toLocaleDateString() : 'Non défini'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Commission History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Historique des commissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.commission_history && stats.commission_history.length > 0 ? (
                <div className="space-y-4">
                  {stats.commission_history.map((commission: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-accent/50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <DollarSign className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {(parseFloat(commission.amount || 0))} XOF
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {commission.period_start && commission.period_end ?
                              `${new Date(commission.period_start).toLocaleDateString()} - ${new Date(commission.period_end).toLocaleDateString()}` :
                              'Période non spécifiée'
                            }
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            commission.status === 'completed' ? "default" :
                              commission.status === 'pending' ? "secondary" :
                                "destructive"
                          }
                        >
                          <div className="flex items-center gap-1">
                            {commission.status === 'completed' ? (
                              <CheckCircle className="h-3 w-3" />
                            ) : commission.status === 'pending' ? (
                              <AlertTriangle className="h-3 w-3" />
                            ) : (
                              <XCircle className="h-3 w-3" />
                            )}
                            <span className="capitalize">{commission.status || 'Inconnu'}</span>
                          </div>
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="space-y-4">
                    <div className="h-16 w-16 rounded-full bg-accent mx-auto flex items-center justify-center">
                      <TrendingUp className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Aucun historique de commission</h3>
                      <p className="text-muted-foreground">Aucun paiement de commission n'a encore été effectué.</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Confirmation Modal */}
      <Dialog open={confirmModalOpen} onOpenChange={setConfirmModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <span>Confirmer le paiement</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {payError && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">{payError}</span>
              </div>
            )}
            <p className="text-muted-foreground">
              Êtes-vous sûr de vouloir payer une commission de <span className="font-semibold">{(parseFloat(amount) || 0)} XOF</span> ?
            </p>
            <p className="text-sm text-muted-foreground">
              Cette action ne peut pas être annulée et sera enregistrée dans l'historique des commissions.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmModalOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleConfirmPay}
              disabled={payLoading}
            >
              {payLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Traitement...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Continuer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}