import { useState } from "react";
import { QrCode, Scan, Printer, Keyboard } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { BarcodeScanner, ManualBarcodeInput } from "@/components/BarcodeScanner";

export function ScannerPlaceholder() {
  const { t } = useLanguage();
  const { addToCartByBarcode, isLoading } = useCart();
  const [scannerOpen, setScannerOpen] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);

  const handleBarcodeScan = async (barcode: string) => {
    const result = await addToCartByBarcode(barcode);

    if (result.success && result.product) {
      toast.success(`Added: ${result.product.name}`, {
        description: `${result.product.price.toFixed(2)} SAR - Barcode: ${barcode}`,
      });
      // Keep scanner open for continuous scanning
    } else {
      toast.error("Product not found", {
        description: result.error || `No product found for barcode: ${barcode}`,
      });
    }
  };

  const handleQrScan = () => {
    toast.info(t("qrScanner"), {
      description: "QR code scanning coming soon!",
    });
  };

  return (
    <>
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4 space-y-3">
          {/* Main scanner buttons */}
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="default"
              size="lg"
              onClick={() => setScannerOpen(true)}
              className="flex-1"
              disabled={isLoading}
            >
              <Scan className="mr-2 h-5 w-5" />
              {t("scanBarcode")}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleQrScan}
              className="flex-1"
            >
              <QrCode className="mr-2 h-5 w-5" />
              {t("scanQRCode")}
            </Button>
          </div>

          {/* Secondary actions */}
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowManualInput(!showManualInput)}
            >
              <Keyboard className="mr-2 h-4 w-4" />
              {showManualInput ? "Hide Manual Entry" : "Manual Entry"}
            </Button>
            <Link to="/print-barcodes">
              <Button variant="ghost" size="sm">
                <Printer className="mr-2 h-4 w-4" />
                Print Barcodes
              </Button>
            </Link>
          </div>

          {/* Manual barcode input */}
          {showManualInput && (
            <div className="pt-2 border-t">
              <ManualBarcodeInput onSubmit={handleBarcodeScan} />
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Test barcodes: 1234567890123 (Tomatoes), 2234567890123 (Milk), 3234567890123 (Juice)
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Camera barcode scanner modal */}
      <BarcodeScanner
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={handleBarcodeScan}
      />
    </>
  );
}
