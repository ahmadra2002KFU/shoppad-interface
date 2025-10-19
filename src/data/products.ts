import { Product } from "@/types/product";
import tomatoImg from "@/assets/tomato.jpg";
import potatoImg from "@/assets/potato.jpg";
import appleImg from "@/assets/apple.jpg";
import clothingImg from "@/assets/clothing.jpg";
import kitchenImg from "@/assets/kitchen.jpg";

export const products: Product[] = [
  // Fresh Produce
  {
    id: "1",
    name: "Fresh Tomatoes",
    category: "Fresh Produce",
    price: 2.99,
    image: tomatoImg,
    barcode: "1234567890123",
    weight: 0.5,
  },
  {
    id: "2",
    name: "Organic Potatoes",
    category: "Fresh Produce",
    price: 3.49,
    image: potatoImg,
    barcode: "1234567890124",
    weight: 1.0,
  },
  {
    id: "3",
    name: "Red Apples",
    category: "Fresh Produce",
    price: 4.99,
    image: appleImg,
    barcode: "1234567890125",
    weight: 0.8,
  },
  // Clothing
  {
    id: "4",
    name: "Cotton T-Shirt",
    category: "Clothing",
    price: 19.99,
    image: clothingImg,
    barcode: "2234567890123",
  },
  {
    id: "5",
    name: "Casual Pants",
    category: "Clothing",
    price: 39.99,
    image: clothingImg,
    barcode: "2234567890124",
  },
  // Kitchen
  {
    id: "6",
    name: "Cookware Set",
    category: "Kitchen",
    price: 79.99,
    image: kitchenImg,
    barcode: "3234567890123",
  },
  {
    id: "7",
    name: "Kitchen Utensils",
    category: "Kitchen",
    price: 24.99,
    image: kitchenImg,
    barcode: "3234567890124",
  },
];

export const categories = Array.from(new Set(products.map((p) => p.category)));
