import { useState } from "react";
import { ShoppingCart, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { ProductCard } from "@/components/ProductCard";
import { CartView } from "@/components/CartView";
import { WeeklyOffers } from "@/components/WeeklyOffers";
import { StoreMap } from "@/components/StoreMap";
import { ScannerPlaceholder } from "@/components/ScannerPlaceholder";
import { WeightDisplay } from "@/components/WeightDisplay";
import { products, categories } from "@/data/products";
import { useCart } from "@/contexts/CartContext";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Shopping = () => {
  const { totalItems, currentWeight } = useCart();
  const { language, toggleLanguage, t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category === selectedCategory)
    : products;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">{t("smartCart")}</h1>
            </div>
            <div className="flex items-center gap-3">
              {totalItems > 0 && (
                <Badge variant="default" className="text-base px-4 py-2">
                  {totalItems} {t("items")}
                </Badge>
              )}
              <Button 
                variant="outline" 
                size="icon"
                onClick={toggleLanguage}
                className="shrink-0"
              >
                <Languages className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column - Products */}
          <div className="lg:col-span-2 space-y-4">
            <ScannerPlaceholder />

            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={selectedCategory === null ? "default" : "outline"}
                onClick={() => setSelectedCategory(null)}
              >
                {t("all")}
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  size="sm"
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                >
                  {t(category.toLowerCase())}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>

          {/* Right Column - Cart, Offers, Map */}
          <div className="lg:col-span-1">
            <Tabs defaultValue="cart" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="cart">{t("cart")}</TabsTrigger>
                <TabsTrigger value="offers">{t("offers")}</TabsTrigger>
                <TabsTrigger value="map">{t("map")}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="cart" className="mt-0">
                <CartView />
              </TabsContent>
              
              <TabsContent value="offers" className="mt-0">
                <WeeklyOffers />
              </TabsContent>
              
              <TabsContent value="map" className="mt-0">
                <StoreMap />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <WeightDisplay weight={currentWeight} />
    </div>
  );
};

export default Shopping;
