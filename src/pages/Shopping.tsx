import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
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
              <h1 className="text-2xl font-bold text-foreground">Smart Cart</h1>
            </div>
            {totalItems > 0 && (
              <Badge variant="default" className="text-base px-4 py-2">
                {totalItems} items
              </Badge>
            )}
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
                All
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  size="sm"
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
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
                <TabsTrigger value="cart">Cart</TabsTrigger>
                <TabsTrigger value="offers">Offers</TabsTrigger>
                <TabsTrigger value="map">Map</TabsTrigger>
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
