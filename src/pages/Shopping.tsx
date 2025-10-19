import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartView } from "@/components/CartView";
import { WeeklyOffers } from "@/components/WeeklyOffers";
import { StoreMap } from "@/components/StoreMap";
import { WeightDisplay } from "@/components/WeightDisplay";
import { useCart } from "@/contexts/CartContext";

const Shopping = () => {
  const navigate = useNavigate();
  const { currentWeight } = useCart();

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/catalog")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Catalog
          </Button>

          <h1 className="text-2xl font-bold text-foreground">Shopping View</h1>

          <div className="w-32" />
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <CartView />
          </div>

          <div className="lg:col-span-1">
            <WeeklyOffers />
          </div>

          <div className="lg:col-span-1">
            <StoreMap />
          </div>
        </div>
      </main>

      <WeightDisplay weight={currentWeight} />
    </div>
  );
};

export default Shopping;
