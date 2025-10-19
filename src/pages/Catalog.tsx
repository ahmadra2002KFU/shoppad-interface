import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { ScannerPlaceholder } from "@/components/ScannerPlaceholder";
import { WeightDisplay } from "@/components/WeightDisplay";
import { products, categories } from "@/data/products";
import { useCart } from "@/contexts/CartContext";
import { Badge } from "@/components/ui/badge";

const Catalog = () => {
  const navigate = useNavigate();
  const { totalItems, currentWeight } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category === selectedCategory)
    : products;

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <h1 className="text-2xl font-bold text-foreground">Browse Products</h1>

          <Button variant="default" onClick={() => navigate("/shopping")}>
            <ShoppingBag className="mr-2 h-4 w-4" />
            Shopping View
            {totalItems > 0 && (
              <Badge variant="destructive" className="ml-2">
                {totalItems}
              </Badge>
            )}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <ScannerPlaceholder />

        <div className="mt-8 mb-6 flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            onClick={() => setSelectedCategory(null)}
          >
            All Products
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </main>

      <WeightDisplay weight={currentWeight} />
    </div>
  );
};

export default Catalog;
