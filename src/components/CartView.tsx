import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function CartView() {
  const { cart, removeFromCart, updateQuantity, totalPrice } = useCart();

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
        <div className="pt-4 border-t-2 border-primary/20">
          <div className="flex justify-between items-center text-xl font-bold">
            <span className="text-foreground">Total:</span>
            <span className="text-primary">{totalPrice.toFixed(2)} SAR</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
