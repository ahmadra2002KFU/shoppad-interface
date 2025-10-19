import { Map } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import storeMapImg from "@/assets/store-map.jpg";

export function StoreMap() {
  const [showEnlargedMap, setShowEnlargedMap] = useState(false);

  return (
    <>
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Map className="text-primary" />
            Store Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className="rounded-lg overflow-hidden border border-border cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => setShowEnlargedMap(true)}
          >
            <img src={storeMapImg} alt="Store Layout" className="w-full h-auto" />
            <p className="text-center text-sm text-muted-foreground mt-2">Click to enlarge</p>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showEnlargedMap} onOpenChange={setShowEnlargedMap}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-4">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">Store Map</DialogTitle>
          </DialogHeader>
          <div className="overflow-auto max-h-[85vh]">
            <img src={storeMapImg} alt="Detailed Store Layout" className="w-full h-auto" />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
