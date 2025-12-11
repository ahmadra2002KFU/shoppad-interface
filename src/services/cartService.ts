import { supabase, DbCart, DbCartItem, DbProduct } from '@/lib/supabase'
import { Product } from '@/types/product'

export interface CartItemWithProduct extends DbCartItem {
  product: Product
}

export interface CartWithItems extends DbCart {
  items: CartItemWithProduct[]
}

// Get or create active cart for user
export async function getOrCreateCart(userId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .rpc('get_or_create_cart', { p_user_id: userId })

    if (error) {
      console.error('Error getting/creating cart:', error)
      return null
    }

    return data as string
  } catch (err) {
    console.error('Cart exception:', err)
    return null
  }
}

// Get active cart with items for user
export async function getCartWithItems(userId: string): Promise<CartWithItems | null> {
  try {
    // First get the active cart
    const { data: cart, error: cartError } = await supabase
      .from('carts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single()

    if (cartError) {
      if (cartError.code === 'PGRST116') {
        // No cart found, return null
        return null
      }
      console.error('Error fetching cart:', cartError)
      return null
    }

    // Get cart items with product info
    const { data: items, error: itemsError } = await supabase
      .from('cart_items')
      .select(`
        *,
        product:products (*)
      `)
      .eq('cart_id', cart.id)

    if (itemsError) {
      console.error('Error fetching cart items:', itemsError)
      return { ...cart, items: [] }
    }

    // Transform the items
    const transformedItems: CartItemWithProduct[] = (items || []).map(item => ({
      ...item,
      product: {
        id: item.product.id,
        name: item.product.name,
        category: item.product.category,
        price: item.product.price,
        image: item.product.image,
        barcode: item.product.barcode,
        weight: item.product.weight || undefined
      }
    }))

    return {
      ...cart,
      items: transformedItems
    }
  } catch (err) {
    console.error('Cart fetch exception:', err)
    return null
  }
}

// Add item to cart
export async function addItemToCart(
  userId: string,
  productId: string,
  quantity: number = 1
): Promise<boolean> {
  try {
    const { error } = await supabase
      .rpc('add_to_cart', {
        p_user_id: userId,
        p_product_id: productId,
        p_quantity: quantity
      })

    if (error) {
      console.error('Error adding to cart:', error)
      return false
    }

    return true
  } catch (err) {
    console.error('Add to cart exception:', err)
    return false
  }
}

// Update cart item quantity
export async function updateCartItemQuantity(
  cartItemId: string,
  quantity: number
): Promise<boolean> {
  try {
    if (quantity <= 0) {
      return removeCartItem(cartItemId)
    }

    const { error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', cartItemId)

    if (error) {
      console.error('Error updating cart item:', error)
      return false
    }

    return true
  } catch (err) {
    console.error('Update cart item exception:', err)
    return false
  }
}

// Remove item from cart
export async function removeCartItem(cartItemId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId)

    if (error) {
      console.error('Error removing cart item:', error)
      return false
    }

    return true
  } catch (err) {
    console.error('Remove cart item exception:', err)
    return false
  }
}

// Clear all items from cart
export async function clearCart(cartId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', cartId)

    if (error) {
      console.error('Error clearing cart:', error)
      return false
    }

    return true
  } catch (err) {
    console.error('Clear cart exception:', err)
    return false
  }
}

// Subscribe to cart item changes (for realtime sync)
export function subscribeToCartChanges(
  cartId: string,
  onInsert: (item: DbCartItem) => void,
  onUpdate: (item: DbCartItem) => void,
  onDelete: (oldItem: DbCartItem) => void
) {
  const channel = supabase
    .channel(`cart_items_${cartId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'cart_items',
        filter: `cart_id=eq.${cartId}`
      },
      (payload) => onInsert(payload.new as DbCartItem)
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'cart_items',
        filter: `cart_id=eq.${cartId}`
      },
      (payload) => onUpdate(payload.new as DbCartItem)
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'cart_items',
        filter: `cart_id=eq.${cartId}`
      },
      (payload) => onDelete(payload.old as DbCartItem)
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
