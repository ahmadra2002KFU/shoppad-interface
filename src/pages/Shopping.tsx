import { useState } from "react";
import { ShoppingCart, Languages, QrCode, User, LogIn, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { ProductCard } from "@/components/ProductCard";
import { CartView } from "@/components/CartView";
import { WeeklyOffers } from "@/components/WeeklyOffers";
import { StoreMap } from "@/components/StoreMap";
import { ScannerPlaceholder } from "@/components/ScannerPlaceholder";
import { WeightDisplay } from "@/components/WeightDisplay";
import { NFCCheckoutDialog } from "@/components/NFCCheckoutDialog";
import { products, categories } from "@/data/products";
import { useCart } from "@/contexts/CartContext";
import { useNFCDetection } from "@/hooks/useNFCDetection";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const Shopping = () => {
  const { totalItems, currentWeight, clearCart } = useCart();
  const { language, toggleLanguage, t } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showFailureDialog, setShowFailureDialog] = useState(false);
  const [currentNFCEvent, setCurrentNFCEvent] = useState<{ uid: string; timestamp: string } | null>(null);

  // NFC Detection Hook
  const { nfcEvent, markAsProcessed } = useNFCDetection({
    enabled: true,
    pollInterval: 1000, // Check every second
    onNFCDetected: (event) => {
      // Only show dialog if cart has items
      if (totalItems > 0) {
        console.log('NFC detected:', event);
        toast.info(t("nfcDetected"));
        setCurrentNFCEvent({ uid: event.uid, timestamp: event.timestamp });
        setShowCheckoutDialog(true);
      } else {
        // Cart is empty, mark as processed immediately
        markAsProcessed(event.uid, event.timestamp);
        toast.warning(t("cartEmpty"));
      }
    },
  });

  const handleCheckoutConfirm = async () => {
    setShowCheckoutDialog(false);

    // Simulate payment processing
    // In a real app, this would call a payment API
    const isSuccess = Math.random() > 0.1; // 90% success rate

    if (isSuccess) {
      setShowSuccessDialog(true);

      // Mark NFC event as processed
      if (currentNFCEvent) {
        await markAsProcessed(currentNFCEvent.uid, currentNFCEvent.timestamp);
      }

      // Clear cart after 3 seconds
      setTimeout(() => {
        setShowSuccessDialog(false);
        clearCart();
        setCurrentNFCEvent(null);
      }, 3000);
    } else {
      setShowFailureDialog(true);
    }
  };

  const handleCheckoutCancel = async () => {
    setShowCheckoutDialog(false);

    // Mark NFC event as processed
    if (currentNFCEvent) {
      await markAsProcessed(currentNFCEvent.uid, currentNFCEvent.timestamp);
      setCurrentNFCEvent(null);
    }

    toast.info(t("checkoutCancelled"));
  };

  const handleFailureClose = async () => {
    setShowFailureDialog(false);

    // Mark NFC event as processed
    if (currentNFCEvent) {
      await markAsProcessed(currentNFCEvent.uid, currentNFCEvent.timestamp);
      setCurrentNFCEvent(null);
    }
  };

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
              <Link to="/qr-codes">
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  title="View Product QR Codes"
                >
                  <QrCode className="w-5 h-5" />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="icon"
                onClick={toggleLanguage}
                className="shrink-0"
              >
                <Languages className="w-5 h-5" />
              </Button>
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="shrink-0">
                      <User className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>
                      {user?.name || (language === 'ar' ? 'حسابي' : 'My Account')}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="flex items-center gap-2 cursor-pointer">
                        <Settings className="w-4 h-4" />
                        {language === 'ar' ? 'الإعدادات' : 'Settings'}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={logout}
                      className="text-destructive cursor-pointer"
                    >
                      {language === 'ar' ? 'تسجيل الخروج' : 'Logout'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/login">
                  <Button variant="outline" size="icon" className="shrink-0">
                    <LogIn className="w-5 h-5" />
                  </Button>
                </Link>
              )}
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

      <WeightDisplay calculatedWeight={currentWeight} />

      {/* NFC Checkout Dialog */}
      <NFCCheckoutDialog
        isOpen={showCheckoutDialog}
        onConfirm={handleCheckoutConfirm}
        onCancel={handleCheckoutCancel}
        showSuccess={showSuccessDialog}
        showFailure={showFailureDialog}
        onFailureClose={handleFailureClose}
      />
    </div>
  );
};

export default Shopping;
