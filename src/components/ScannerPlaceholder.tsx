import { QrCode, Scan } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { QRScanner } from "@/components/QRScanner";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import { useQRScanner } from "@/hooks/useQRScanner";
import { useBarcodeScanner } from "@/hooks/useBarcodeScanner";

export function ScannerPlaceholder() {
  const { t } = useLanguage();

  // QR Scanner
  const {
    isOpen: isQROpen,
    openScanner: openQRScanner,
    closeScanner: closeQRScanner,
    handleScan: handleQRScan
  } = useQRScanner({
    validateWeightOnScan: false, // Set to true to validate weight against sensor
    autoAddToCart: true,
  });

  // Barcode Scanner
  const {
    isOpen: isBarcodeOpen,
    openScanner: openBarcodeScanner,
    closeScanner: closeBarcodeScanner,
    handleScan: handleBarcodeScan,
  } = useBarcodeScanner({
    validateWeightOnScan: false, // Set to true to validate weight against sensor
    autoAddToCart: true,
  });

  return (
    <>
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6 flex items-center justify-center gap-4">
          <Button variant="outline" size="lg" onClick={openBarcodeScanner} className="flex-1">
            <Scan className="mr-2 h-5 w-5" />
            {t("scanBarcode")}
          </Button>
          <Button variant="outline" size="lg" onClick={openQRScanner} className="flex-1">
            <QrCode className="mr-2 h-5 w-5" />
            {t("scanQRCode")}
          </Button>
        </CardContent>
      </Card>

      <QRScanner isOpen={isQROpen} onClose={closeQRScanner} onScan={handleQRScan} />
      <BarcodeScanner isOpen={isBarcodeOpen} onClose={closeBarcodeScanner} onScan={handleBarcodeScan} />
    </>
  );
}
