import { Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";

export function WeeklyOffers() {
  const { t } = useLanguage();

  const offers = [
    { id: 1, titleKey: "freshProduceSale", discount: "30% OFF", descriptionKey: "allFruitsVegetables" },
    { id: 2, titleKey: "kitchenEssentials", discount: "25% OFF", descriptionKey: "cookwareUtensils" },
    { id: 3, titleKey: "clothingDeal", discount: "Buy 2 Get 1 FREE", descriptionKey: "allApparelItems" },
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Tag className="text-accent" />
          {t("weeklyOffers")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {offers.map((offer) => (
          <Card key={offer.id} className="border-accent/30 bg-accent/5 hover:bg-accent/10 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-semibold text-card-foreground">{t(offer.titleKey)}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{t(offer.descriptionKey)}</p>
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
