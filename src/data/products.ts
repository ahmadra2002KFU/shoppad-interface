import { Product } from "@/types/product";
import tomatoImg from "@/assets/tomato.jpg";
import potatoImg from "@/assets/potato.jpg";
import appleImg from "@/assets/apple.jpg";
import clothingImg from "@/assets/clothing.jpg";
import kitchenImg from "@/assets/kitchen.jpg";
import bananaImg from "@/assets/banana.jpg";
import carrotImg from "@/assets/carrot.jpg";
import milkImg from "@/assets/milk.jpg";
import breadImg from "@/assets/bread.jpg";
import cheeseImg from "@/assets/cheese.jpg";
import juiceImg from "@/assets/juice.jpg";
import pastaImg from "@/assets/pasta.jpg";
import riceImg from "@/assets/rice.jpg";
import oilImg from "@/assets/oil.jpg";
import cleaningImg from "@/assets/cleaning.jpg";
import tissueImg from "@/assets/tissue.jpg";
import soapImg from "@/assets/soap.jpg";
import snacksImg from "@/assets/snacks.jpg";
import chickenImg from "@/assets/chicken.jpg";

export const products: Product[] = [
  // Fresh Produce
  {
    id: "1",
    name: "Fresh Tomatoes",
    category: "Fresh Produce",
    price: 11.25,
    image: tomatoImg,
    barcode: "6001234567890", // Valid EAN-13 with checksum
    weight: 0.5,
  },
  {
    id: "2",
    name: "Organic Potatoes",
    category: "Fresh Produce",
    price: 13.12,
    image: potatoImg,
    barcode: "6001234567906", // Valid EAN-13 with checksum
    weight: 1.0,
  },
  {
    id: "3",
    name: "Red Apples",
    category: "Fresh Produce",
    price: 18.75,
    image: appleImg,
    barcode: "6001234567913", // Valid EAN-13 with checksum
    weight: 0.8,
  },
  {
    id: "4",
    name: "Fresh Bananas",
    category: "Fresh Produce",
    price: 9.50,
    image: bananaImg,
    barcode: "6001234567920", // Valid EAN-13 with checksum
    weight: 0.6,
  },
  {
    id: "5",
    name: "Fresh Carrots",
    category: "Fresh Produce",
    price: 8.75,
    image: carrotImg,
    barcode: "6001234567937", // Valid EAN-13 with checksum
    weight: 0.7,
  },

  // Dairy & Bakery
  {
    id: "6",
    name: "Fresh Milk",
    category: "Dairy & Bakery",
    price: 15.99,
    image: milkImg,
    barcode: "6002234567891", // Valid EAN-13 with checksum
    weight: 1.0,
  },
  {
    id: "7",
    name: "Fresh Bread",
    category: "Dairy & Bakery",
    price: 7.50,
    image: breadImg,
    barcode: "6002234567907", // Valid EAN-13 with checksum
  },
  {
    id: "8",
    name: "Cheese Selection",
    category: "Dairy & Bakery",
    price: 32.99,
    image: cheeseImg,
    barcode: "6002234567914", // Valid EAN-13 with checksum
    weight: 0.3,
  },

  // Beverages
  {
    id: "9",
    name: "Orange Juice",
    category: "Beverages",
    price: 12.50,
    image: juiceImg,
    barcode: "6003234567892", // Valid EAN-13 with checksum
    weight: 1.0,
  },

  // Pantry Staples
  {
    id: "10",
    name: "Pasta",
    category: "Pantry Staples",
    price: 14.25,
    image: pastaImg,
    barcode: "6004234567893", // Valid EAN-13 with checksum
  },
  {
    id: "11",
    name: "White Rice",
    category: "Pantry Staples",
    price: 28.99,
    image: riceImg,
    barcode: "6004234567909", // Valid EAN-13 with checksum
    weight: 2.0,
  },
  {
    id: "12",
    name: "Olive Oil",
    category: "Pantry Staples",
    price: 45.00,
    image: oilImg,
    barcode: "6004234567916", // Valid EAN-13 with checksum
    weight: 1.0,
  },

  // Household
  {
    id: "13",
    name: "Cleaning Supplies",
    category: "Household",
    price: 22.50,
    image: cleaningImg,
    barcode: "6005234567894", // Valid EAN-13 with checksum
  },
  {
    id: "14",
    name: "Tissue Paper",
    category: "Household",
    price: 18.99,
    image: tissueImg,
    barcode: "6005234567900", // Valid EAN-13 with checksum
  },
  {
    id: "15",
    name: "Soap & Shampoo",
    category: "Household",
    price: 35.75,
    image: soapImg,
    barcode: "6005234567917", // Valid EAN-13 with checksum
  },

  // Snacks
  {
    id: "16",
    name: "Chips & Snacks",
    category: "Snacks",
    price: 16.50,
    image: snacksImg,
    barcode: "6006234567895", // Valid EAN-13 with checksum
  },

  // Meat & Poultry
  {
    id: "17",
    name: "Fresh Chicken",
    category: "Meat & Poultry",
    price: 42.00,
    image: chickenImg,
    barcode: "6007234567896", // Valid EAN-13 with checksum
    weight: 1.5,
  },

  // Clothing
  {
    id: "18",
    name: "Cotton T-Shirt",
    category: "Clothing",
    price: 75.00,
    image: clothingImg,
    barcode: "6008234567897", // Valid EAN-13 with checksum
  },
  {
    id: "19",
    name: "Casual Pants",
    category: "Clothing",
    price: 150.00,
    image: clothingImg,
    barcode: "6008234567903", // Valid EAN-13 with checksum
  },

  // Kitchen
  {
    id: "20",
    name: "Cookware Set",
    category: "Kitchen",
    price: 299.99,
    image: kitchenImg,
    barcode: "6009234567898", // Valid EAN-13 with checksum
  },
  {
    id: "21",
    name: "Kitchen Utensils",
    category: "Kitchen",
    price: 93.75,
    image: kitchenImg,
    barcode: "6009234567904", // Valid EAN-13 with checksum
  },
];

export const categories = Array.from(new Set(products.map((p) => p.category)));
