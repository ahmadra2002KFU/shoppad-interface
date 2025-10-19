import { QrCode, Scan } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

export function ScannerPlaceholder() {
  const { t } = useLanguage();

  const handleScan = (type: "barcode" | "qr") => {
    toast.info(type === "barcode" ? t("barcodeScanner") : t("qrScanner"), {
      description: t("scannerDescription"),
    });
  };

  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardContent className="p-6 flex items-center justify-center gap-4">
        <Button variant="outline" size="lg" onClick={() => handleScan("barcode")} className="flex-1">
          <Scan className="mr-2 h-5 w-5" />
          {t("scanBarcode")}
        </Button>
        <Button variant="outline" size="lg" onClick={() => handleScan("qr")} className="flex-1">
          <QrCode className="mr-2 h-5 w-5" />
          {t("scanQRCode")}
        </Button>
      </CardContent>
    </Card>
  );
}
