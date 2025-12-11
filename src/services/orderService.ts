import { supabase, DbOrder, DbOrderItem } from '@/lib/supabase'
import { Order, OrderItem, OrderWithItems } from '@/types/order'
import { PaymentMethod } from '@/types/auth'

// Checkout (convert cart to order)
export async function checkout(
  userId: string,
  paymentMethod: PaymentMethod
): Promise<{ success: boolean; orderId?: string; error?: string }> {
  try {
    const { data, error } = await supabase
      .rpc('checkout', {
        p_user_id: userId,
        p_payment_method: paymentMethod
      })

    if (error) {
      console.error('Checkout error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, orderId: data as string }
  } catch (err) {
    console.error('Checkout exception:', err)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// Get order by ID
export async function getOrder(orderId: string): Promise<OrderWithItems | null> {
  try {
    // Get order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderError) {
      console.error('Error fetching order:', orderError)
      return null
    }

    // Get order items
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId)

    if (itemsError) {
      console.error('Error fetching order items:', itemsError)
      return { ...order, items: [] }
    }

    return {
      ...order,
      items: items as OrderItem[]
    }
  } catch (err) {
    console.error('Order fetch exception:', err)
    return null
  }
}

// Get all orders for user
export async function getUserOrders(userId: string): Promise<Order[]> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching orders:', error)
      return []
    }

    return data as Order[]
  } catch (err) {
    console.error('Orders fetch exception:', err)
    return []
  }
}

// Get recent orders (last 10)
export async function getRecentOrders(userId: string, limit: number = 10): Promise<Order[]> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching recent orders:', error)
      return []
    }

    return data as Order[]
  } catch (err) {
    console.error('Recent orders fetch exception:', err)
    return []
  }
}

// Get order statistics
export async function getOrderStats(userId: string): Promise<{
  totalOrders: number
  totalSpent: number
  averageOrder: number
} | null> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('total')
      .eq('user_id', userId)
      .eq('status', 'completed')

    if (error) {
      console.error('Error fetching order stats:', error)
      return null
    }

    const orders = data as { total: number }[]
    const totalOrders = orders.length
    const totalSpent = orders.reduce((sum, o) => sum + Number(o.total), 0)
    const averageOrder = totalOrders > 0 ? totalSpent / totalOrders : 0

    return {
      totalOrders,
      totalSpent,
      averageOrder
    }
  } catch (err) {
    console.error('Order stats exception:', err)
    return null
  }
}
