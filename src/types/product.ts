export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  barcode?: string;
  weight?: number;
}

export interface CartItem extends Product {
  quantity: number;
}
