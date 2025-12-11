import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { getUserOrders, getOrderStats } from '@/services/orderService'
import { Order } from '@/types/order'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Package, Receipt, Calendar, CreditCard, TrendingUp } from 'lucide-react'

const PAYMENT_METHOD_LABELS = {
  mada_pay: 'Mada Pay',
  google_pay: 'Google Pay',
  apple_pay: 'Apple Pay'
}

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700'
}

export default function OrderHistory() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<{
    totalOrders: number
    totalSpent: number
    averageOrder: number
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  async function loadData() {
    if (!user) return
    setLoading(true)

    const [ordersData, statsData] = await Promise.all([
      getUserOrders(user.id),
      getOrderStats(user.id)
    ])

    setOrders(ordersData)
    setStats(statsData)
    setLoading(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Order History</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Orders</p>
                  <p className="text-xl font-bold text-gray-900">{stats.totalOrders}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Spent</p>
                  <p className="text-xl font-bold text-gray-900">{stats.totalSpent.toFixed(2)} SAR</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Avg Order</p>
                  <p className="text-xl font-bold text-gray-900">{stats.averageOrder.toFixed(2)} SAR</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-6">Start shopping to see your order history here</p>
            <Link to="/">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div
                key={order.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden"
              >
                {/* Order Header */}
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-gray-600">
                      {order.order_number}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500 text-sm">
                    <Calendar className="w-4 h-4" />
                    {formatDate(order.created_at)}
                  </div>
                </div>

                {/* Order Details */}
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Package className="w-4 h-4" />
                        <span>{order.items_count} items</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <CreditCard className="w-4 h-4" />
                        <span>{PAYMENT_METHOD_LABELS[order.payment_method]}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        Subtotal: {order.subtotal.toFixed(2)} SAR
                      </div>
                      <div className="text-sm text-gray-500">
                        VAT (15%): {order.tax.toFixed(2)} SAR
                      </div>
                      <div className="text-lg font-bold text-green-700 mt-1">
                        Total: {order.total.toFixed(2)} SAR
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
