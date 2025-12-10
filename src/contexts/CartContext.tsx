/**
 * Cart Context with Hybrid Storage
 * - Syncs with server when authenticated
 * - Falls back to localStorage when offline or not authenticated
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { CartItem, Product } from "@/types/product";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";

const CART_STORAGE_KEY = 'shoppad_cart';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  currentWeight: number;
  isLoading: boolean;
  isSyncing: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load cart from localStorage
  const loadLocalCart = useCallback((): CartItem[] => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, []);

  // Save cart to localStorage
  const saveLocalCart = useCallback((items: CartItem[]) => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage full or unavailable
    }
  }, []);

  // Load cart from server
  const loadServerCart = useCallback(async (): Promise<CartItem[]> => {
    try {
      const response = await api.getCart();
      if (response.success && response.data) {
        return response.data.items;
      }
    } catch {
      // Network error
    }
    return [];
  }, []);

  // Sync local cart to server
  const syncCartToServer = useCallback(async (items: CartItem[]) => {
    if (!isAuthenticated || items.length === 0) return;

    setIsSyncing(true);
    try {
      const syncItems = items.map(item => ({
        productId: item.id,
        quantity: item.quantity,
      }));
      await api.syncCart(syncItems);
    } catch {
      // Network error - cart will sync next time
    } finally {
      setIsSyncing(false);
    }
  }, [isAuthenticated]);

  // Initialize cart on mount and auth changes
  useEffect(() => {
    const initCart = async () => {
      setIsLoading(true);

      if (isAuthenticated) {
        // Try to load from server first
        const serverCart = await loadServerCart();

        if (serverCart.length > 0) {
          setCart(serverCart);
          saveLocalCart(serverCart);
        } else {
          // Check if there's a local cart to sync
          const localCart = loadLocalCart();
          if (localCart.length > 0) {
            setCart(localCart);
            // Sync local cart to server
            await syncCartToServer(localCart);
          }
        }
      } else {
        // Not authenticated - use local cart
        const localCart = loadLocalCart();
        setCart(localCart);
      }

      setIsLoading(false);
    };

    initCart();
  }, [isAuthenticated, user?.id, loadServerCart, loadLocalCart, saveLocalCart, syncCartToServer]);

  // Add to cart
  const addToCart = useCallback(async (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      let newCart: CartItem[];

      if (existing) {
        newCart = prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        newCart = [...prev, { ...product, quantity: 1 }];
      }

      // Save to localStorage
      saveLocalCart(newCart);

      return newCart;
    });

    // Sync with server if authenticated
    if (isAuthenticated) {
      try {
        await api.addToCart(product.id, 1);
      } catch {
        // Network error - local cart is source of truth
      }
    }
  }, [isAuthenticated, saveLocalCart]);

  // Remove from cart
  const removeFromCart = useCallback(async (productId: string) => {
    setCart((prev) => {
      const newCart = prev.filter((item) => item.id !== productId);
      saveLocalCart(newCart);
      return newCart;
    });

    // Sync with server if authenticated
    if (isAuthenticated) {
      try {
        await api.removeFromCart(productId);
      } catch {
        // Network error - local cart is source of truth
      }
    }
  }, [isAuthenticated, saveLocalCart]);

  // Update quantity
  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prev) => {
      const newCart = prev.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      );
      saveLocalCart(newCart);
      return newCart;
    });

    // Sync with server if authenticated
    if (isAuthenticated) {
      try {
        await api.updateCartItem(productId, quantity);
      } catch {
        // Network error - local cart is source of truth
      }
    }
  }, [isAuthenticated, removeFromCart, saveLocalCart]);

  // Clear cart
  const clearCart = useCallback(async () => {
    setCart([]);
    saveLocalCart([]);

    // Sync with server if authenticated
    if (isAuthenticated) {
      try {
        await api.clearCart();
      } catch {
        // Network error - local cart is source of truth
      }
    }
  }, [isAuthenticated, saveLocalCart]);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const currentWeight = cart.reduce((sum, item) => sum + (item.weight || 0) * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        currentWeight,
        isLoading,
        isSyncing,
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
