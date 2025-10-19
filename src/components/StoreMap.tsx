import { Map } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import storeMapImg from "@/assets/store-map.jpg";

export function StoreMap() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Map className="text-primary" />
          Store Map
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg overflow-hidden border border-border">
          <img src={storeMapImg} alt="Store Layout" className="w-full h-auto" />
        </div>
      </CardContent>
    </Card>
  );
}
