import { supabase, DbProduct } from '@/lib/supabase'
import { Product } from '@/types/product'
import { products as localProducts } from '@/data/products'

// Convert database product to app product format
function dbToProduct(dbProduct: DbProduct): Product {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    category: dbProduct.category,
    price: dbProduct.price,
    image: dbProduct.image,
    barcode: dbProduct.barcode,
    weight: dbProduct.weight || undefined,
  }
}

// Get product by barcode - tries Supabase first, falls back to local data
export async function getProductByBarcode(barcode: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('barcode', barcode)
      .eq('is_active', true)
      .single()

    if (error) {
      console.warn('Supabase lookup failed, trying local data:', error.message)
      // Fallback to local products
      const localProduct = localProducts.find(p => p.barcode === barcode)
      return localProduct || null
    }

    return dbToProduct(data as DbProduct)
  } catch (err) {
    console.error('Error fetching product by barcode:', err)
    // Fallback to local products
    const localProduct = localProducts.find(p => p.barcode === barcode)
    return localProduct || null
  }
}

// Get all products from Supabase with fallback to local
export async function getAllProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (error) {
      console.warn('Supabase fetch failed, using local data:', error.message)
      return localProducts
    }

    return (data as DbProduct[]).map(dbToProduct)
  } catch (err) {
    console.error('Error fetching products:', err)
    return localProducts
  }
}

// Get all categories
export async function getAllCategories(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('name')
      .order('display_order')

    if (error) {
      console.warn('Supabase categories fetch failed:', error.message)
      // Return unique categories from local products
      return Array.from(new Set(localProducts.map(p => p.category)))
    }

    return data.map(c => c.name)
  } catch (err) {
    console.error('Error fetching categories:', err)
    return Array.from(new Set(localProducts.map(p => p.category)))
  }
}

// Get products by category
export async function getProductsByCategory(category: string): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('name')

    if (error) {
      console.warn('Supabase category fetch failed:', error.message)
      return localProducts.filter(p => p.category === category)
    }

    return (data as DbProduct[]).map(dbToProduct)
  } catch (err) {
    console.error('Error fetching products by category:', err)
    return localProducts.filter(p => p.category === category)
  }
}
