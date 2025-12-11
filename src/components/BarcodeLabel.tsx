import Barcode from 'react-barcode'
import { Product } from '@/types/product'

interface BarcodeLabelProps {
  product: Product
  showPrice?: boolean
  compact?: boolean
}

export function BarcodeLabel({ product, showPrice = true, compact = false }: BarcodeLabelProps) {
  if (!product.barcode) {
    return (
      <div className="border border-dashed border-gray-300 rounded p-4 text-center text-gray-500">
        No barcode available
      </div>
    )
  }

  return (
    <div
      className={`
        bg-white border border-gray-200 rounded-lg shadow-sm
        ${compact ? 'p-2' : 'p-4'}
        print:border-black print:shadow-none print:rounded-none
      `}
      style={{
        // Standard label size for printing: 50mm x 25mm
        minWidth: compact ? 'auto' : '50mm',
        minHeight: compact ? 'auto' : '25mm',
      }}
    >
      {/* Product Name */}
      <div
        className={`
          font-semibold text-gray-900 truncate text-center
          ${compact ? 'text-xs mb-1' : 'text-sm mb-2'}
        `}
      >
        {product.name}
      </div>

      {/* Barcode */}
      <div className="flex justify-center">
        <Barcode
          value={product.barcode}
          format="EAN13"
          width={compact ? 1.2 : 1.5}
          height={compact ? 40 : 50}
          fontSize={compact ? 10 : 12}
          margin={0}
          displayValue={true}
          background="#ffffff"
          lineColor="#000000"
        />
      </div>

      {/* Price */}
      {showPrice && (
        <div
          className={`
            font-bold text-center text-green-700
            ${compact ? 'text-sm mt-1' : 'text-lg mt-2'}
          `}
        >
          {product.price.toFixed(2)} SAR
        </div>
      )}
    </div>
  )
}

// Compact version for inline display
export function BarcodeBadge({ barcode }: { barcode: string }) {
  return (
    <div className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs font-mono">
      <svg
        className="w-3 h-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
        />
      </svg>
      {barcode}
    </div>
  )
}

export default BarcodeLabel
