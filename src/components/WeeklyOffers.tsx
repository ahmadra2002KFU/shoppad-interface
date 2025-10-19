import { Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const offers = [
  { id: 1, title: "Fresh Produce Sale", discount: "30% OFF", description: "All fruits and vegetables" },
  { id: 2, title: "Kitchen Essentials", discount: "25% OFF", description: "Cookware and utensils" },
  { id: 3, title: "Clothing Deal", discount: "Buy 2 Get 1 FREE", description: "All apparel items" },
];

export function WeeklyOffers() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Tag className="text-accent" />
          Weekly Offers
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {offers.map((offer) => (
          <Card key={offer.id} className="border-accent/30 bg-accent/5 hover:bg-accent/10 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-semibold text-card-foreground">{offer.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{offer.description}</p>
                </div>
                <Badge variant="default" className="bg-accent text-accent-foreground shrink-0">
                  {offer.discount}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}
