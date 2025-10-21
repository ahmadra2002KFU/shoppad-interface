import { CreditCard, CheckCircle, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface NFCCheckoutDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  showSuccess?: boolean;
  showFailure?: boolean;
  onSuccessClose?: () => void;
  onFailureClose?: () => void;
}

export function NFCCheckoutDialog({
  isOpen,
  onConfirm,
  onCancel,
  showSuccess = false,
  showFailure = false,
  onSuccessClose,
  onFailureClose,
}: NFCCheckoutDialogProps) {
  const { t } = useLanguage();

  // Checkout Confirmation Dialog
  if (isOpen && !showSuccess && !showFailure) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">{t("nfcCheckoutTitle")}</DialogTitle>
            <DialogDescription className="text-center pt-4">
              <div className="flex flex-col items-center gap-6">
                <CreditCard className="h-24 w-24 text-primary animate-pulse" />
                <p className="text-lg font-medium">{t("nfcCheckoutMessage")}</p>
                <div className="flex gap-4 w-full">
                  <Button
                    onClick={onCancel}
                    variant="outline"
                    className="flex-1"
                    size="lg"
                  >
                    {t("no")}
                  </Button>
                  <Button
                    onClick={onConfirm}
                    className="flex-1"
                    size="lg"
                  >
                    {t("yes")}
                  </Button>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  // Payment Success Dialog
  if (showSuccess) {
    return (
      <Dialog open={showSuccess} onOpenChange={(open) => !open && onSuccessClose?.()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl text-green-600">{t("paymentSuccessful")}</DialogTitle>
            <DialogDescription className="text-center pt-4">
              <div className="flex flex-col items-center gap-4">
                <CheckCircle className="h-24 w-24 text-green-600" />
                <p className="text-lg">{t("thankYouForShopping")}</p>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  // Payment Failure Dialog
  if (showFailure) {
    return (
      <Dialog open={showFailure} onOpenChange={(open) => !open && onFailureClose?.()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl text-destructive">{t("paymentFailed")}</DialogTitle>
            <DialogDescription className="text-center pt-4">
              <div className="flex flex-col items-center gap-4">
                <XCircle className="h-24 w-24 text-destructive" />
                <p className="text-lg">{t("pleaseTryAgain")}</p>
                <Button onClick={onFailureClose} className="mt-4">
                  {t("tryAgain")}
                </Button>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return null;
}

