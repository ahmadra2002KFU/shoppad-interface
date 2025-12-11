import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BarcodeLabel } from '@/components/BarcodeLabel'
import { getAllProducts } from '@/services/productService'
import { Product } from '@/types/product'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Printer, Grid, List } from 'lucide-react'

export default function PrintBarcodes() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    setLoading(true)
    const data = await getAllProducts()
    setProducts(data)
    setLoading(false)
  }

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))]

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category === selectedCategory)

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Hidden when printing */}
      <header className="bg-white shadow-sm print:hidden sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Shopping
                </Button>
              </Link>
              <h1 className="text-xl font-bold text-gray-900">
                Print Barcodes
              </h1>
            </div>

            <div className="flex items-center gap-2">
              {/* View Toggle */}
              <div className="flex border rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-700' : 'bg-white text-gray-600'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-700' : 'bg-white text-gray-600'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Print Button */}
              <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
                <Printer className="w-4 h-4 mr-2" />
                Print All ({filteredProducts.length})
              </Button>
            </div>
          </div>

          {/* Category Filter */}
          <div className="mt-4 flex gap-2 flex-wrap">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`
                  px-3 py-1 rounded-full text-sm font-medium transition-colors
                  ${selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
                `}
              >
                {category === 'all' ? 'All Categories' : category}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Product Grid */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Print Header - Only visible when printing */}
        <div className="hidden print:block mb-6">
          <h1 className="text-2xl font-bold text-center">Product Barcodes</h1>
          <p className="text-center text-gray-600">
            {filteredProducts.length} products | Generated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 print:grid-cols-4 print:gap-2">
            {filteredProducts.map(product => (
              <BarcodeLabel
                key={product.id}
                product={product}
                showPrice={true}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                className="flex items-center gap-4 bg-white p-3 rounded-lg border print:break-inside-avoid"
              >
                <BarcodeLabel product={product} compact showPrice={false} />
                <div className="flex-1">
                  <div className="font-medium">{product.name}</div>
                  <div className="text-sm text-gray-500">{product.category}</div>
                </div>
                <div className="text-lg font-bold text-green-700">
                  {product.price.toFixed(2)} SAR
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredProducts.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No products found with barcodes
          </div>
        )}
      </main>

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }

          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .print\\:hidden {
            display: none !important;
          }

          .print\\:block {
            display: block !important;
          }

          .print\\:grid-cols-4 {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }

          .print\\:gap-2 {
            gap: 0.5rem;
          }

          .print\\:break-inside-avoid {
            break-inside: avoid;
          }
        }
      `}</style>
    </div>
  )
}
