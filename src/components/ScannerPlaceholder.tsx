import { QrCode, Scan } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ScannerPlaceholder() {
  const handleScan = (type: "barcode" | "qr") => {
    toast.info(`${type === "barcode" ? "Barcode" : "QR Code"} scanner activated`, {
      description: "Scanner functionality will be integrated here",
    });
  };

  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardContent className="p-6 flex items-center justify-center gap-4">
        <Button variant="outline" size="lg" onClick={() => handleScan("barcode")} className="flex-1">
          <Scan className="mr-2 h-5 w-5" />
          Scan Barcode
        </Button>
        <Button variant="outline" size="lg" onClick={() => handleScan("qr")} className="flex-1">
          <QrCode className="mr-2 h-5 w-5" />
          Scan QR Code
        </Button>
      </CardContent>
    </Card>
  );
}
