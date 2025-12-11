import { PaymentMethod } from './auth'

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled'

export interface Order {
  id: string
  user_id: string
  order_number: string
  status: OrderStatus
  payment_method: PaymentMethod
  subtotal: number
  tax: number
  total: number
  items_count: number
  created_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string
  product_price: number
  quantity: number
  line_total: number
}

export interface OrderWithItems extends Order {
  items: OrderItem[]
}
