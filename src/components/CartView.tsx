import { Minus, Plus, Trash2, CreditCard, CheckCircle, XCircle } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";

export function CartView() {
  const { cart, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const [showNFCDialog, setShowNFCDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showFailureDialog, setShowFailureDialog] = useState(false);

  const handleCheckout = () => {
    setShowNFCDialog(true);
    
    // Simulate NFC card reading for 3 seconds
    setTimeout(() => {
      setShowNFCDialog(false);
      // For now, randomly show success or failure (placeholder)
      const isSuccess = Math.random() > 0.3; // 70% success rate
      if (isSuccess) {
        setShowSuccessDialog(true);
        setTimeout(() => {
          setShowSuccessDialog(false);
          clearCart();
        }, 3000);
      } else {
        setShowFailureDialog(true);
      }
    }, 3000);
  };

  if (cart.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-foreground">Your Cart</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">Your cart is empty</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-foreground">Your Cart ({cart.length} items)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
        {cart.map((item) => (
          <div key={item.id} className="flex items-center gap-4 pb-4 border-b border-border last:border-0">
            <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-md" />
            <div className="flex-1">
              <h4 className="font-semibold text-card-foreground">{item.name}</h4>
              <p className="text-sm text-muted-foreground">{item.price.toFixed(2)} SAR</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="outline"
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center font-semibold">{item.quantity}</span>
              <Button
                size="icon"
                variant="outline"
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="destructive" onClick={() => removeFromCart(item.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        <div className="pt-4 border-t-2 border-primary/20 space-y-4">
          <div className="flex justify-between items-center text-xl font-bold">
            <span className="text-foreground">Total:</span>
            <span className="text-primary">{totalPrice.toFixed(2)} SAR</span>
          </div>
          <Button 
            onClick={handleCheckout} 
            className="w-full" 
            size="lg"
            disabled={cart.length === 0}
          >
            <CreditCard className="mr-2 h-5 w-5" />
            Checkout
          </Button>
        </div>
      </CardContent>

      {/* NFC Waiting Dialog */}
      <Dialog open={showNFCDialog} onOpenChange={setShowNFCDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">Waiting for NFC Card</DialogTitle>
            <DialogDescription className="text-center pt-4">
              <div className="flex flex-col items-center gap-4">
                <CreditCard className="h-24 w-24 text-primary animate-pulse" />
                <p className="text-lg">Please tap your card on the reader...</p>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Payment Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl text-green-600">Payment Successful!</DialogTitle>
            <DialogDescription className="text-center pt-4">
              <div className="flex flex-col items-center gap-4">
                <CheckCircle className="h-24 w-24 text-green-600" />
                <p className="text-lg">Your payment has been processed successfully.</p>
                <p className="text-sm text-muted-foreground">Thank you for shopping with us!</p>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Payment Failure Dialog */}
      <Dialog open={showFailureDialog} onOpenChange={setShowFailureDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl text-destructive">Payment Failed</DialogTitle>
            <DialogDescription className="text-center pt-4">
              <div className="flex flex-col items-center gap-4">
                <XCircle className="h-24 w-24 text-destructive" />
                <p className="text-lg">Unable to process your payment.</p>
                <p className="text-sm text-muted-foreground">Please try again or use a different card.</p>
                <Button onClick={() => setShowFailureDialog(false)} className="mt-4">
                  Try Again
                </Button>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
