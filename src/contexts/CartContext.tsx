import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { CartItem, Product } from "@/types/product";
import { getProductByBarcode } from "@/services/productService";

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  addToCartByBarcode: (barcode: string) => Promise<{ success: boolean; product?: Product; error?: string }>;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  currentWeight: number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Add product to cart by scanning barcode
  const addToCartByBarcode = useCallback(async (barcode: string): Promise<{ success: boolean; product?: Product; error?: string }> => {
    setIsLoading(true);
    try {
      const product = await getProductByBarcode(barcode);

      if (!product) {
        return { success: false, error: `Product not found for barcode: ${barcode}` };
      }

      addToCart(product);
      return { success: true, product };
    } catch (error) {
      console.error('Error adding product by barcode:', error);
      return { success: false, error: 'Failed to lookup product' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const currentWeight = cart.reduce((sum, item) => sum + (item.weight || 0) * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        addToCartByBarcode,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        currentWeight,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
