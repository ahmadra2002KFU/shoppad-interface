/**
 * QR Codes Page
 * Displays and generates QR codes for all products for testing and printing
 */

import { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { ArrowLeft, Download, Printer, Search, QrCode, Grid3X3, List } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { products, categories } from "@/data/products";
import { productToQRData } from "@/utils/qrCodeParser";

type ViewMode = "grid" | "list";

export default function QRCodes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const printRef = useRef<HTMLDivElement>(null);

  // Filter products based on search and category
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.id.includes(searchTerm) ||
      product.barcode?.includes(searchTerm);
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Download a single QR code as SVG
  const downloadQRCode = (productId: string, productName: string) => {
    const svg = document.getElementById(`qr-${productId}`);
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const svgUrl = URL.createObjectURL(svgBlob);
      const downloadLink = document.createElement("a");
      downloadLink.href = svgUrl;
      downloadLink.download = `qr-${productName.replace(/\s+/g, "-").toLowerCase()}.svg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(svgUrl);
    }
  };

  // Print all QR codes
  const printAllQRCodes = () => {
    const printContent = document.getElementById("print-area");
    if (printContent) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Product QR Codes - Shoppad</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .qr-grid {
                  display: grid;
                  grid-template-columns: repeat(3, 1fr);
                  gap: 30px;
                  page-break-inside: avoid;
                }
                .qr-item {
                  text-align: center;
                  padding: 15px;
                  border: 1px solid #ddd;
                  border-radius: 8px;
                  page-break-inside: avoid;
                }
                .qr-item h3 { margin: 10px 0 5px; font-size: 14px; }
                .qr-item p { margin: 5px 0; font-size: 12px; color: #666; }
                .qr-item .price { font-weight: bold; color: #2563eb; }
                .qr-item .barcode { font-family: monospace; font-size: 11px; }
                svg { max-width: 150px; height: auto; }
                @media print {
                  .qr-grid { grid-template-columns: repeat(3, 1fr); }
                  .qr-item { break-inside: avoid; }
                }
              </style>
            </head>
            <body>
              <h1 style="text-align: center; margin-bottom: 30px;">Shoppad Product QR Codes</h1>
              <div class="qr-grid">
                ${filteredProducts
                  .map(
                    (product) => `
                  <div class="qr-item">
                    ${document.getElementById(`qr-${product.id}`)?.outerHTML || ""}
                    <h3>${product.name}</h3>
                    <p class="price">${product.price.toFixed(2)} SAR</p>
                    <p>${product.category}</p>
                    ${product.barcode ? `<p class="barcode">Barcode: ${product.barcode}</p>` : ""}
                    ${product.weight ? `<p>Weight: ${product.weight} kg</p>` : ""}
                  </div>
                `
                  )
                  .join("")}
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <QrCode className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Product QR Codes</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={printAllQRCodes}>
                <Printer className="w-4 h-4 mr-2" />
                Print All
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-primary">{products.length}</div>
              <p className="text-sm text-muted-foreground">Total Products</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-primary">{categories.length}</div>
              <p className="text-sm text-muted-foreground">Categories</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-primary">{filteredProducts.length}</div>
              <p className="text-sm text-muted-foreground">Showing</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-green-600">Ready</div>
              <p className="text-sm text-muted-foreground">QR Status</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search products by name, ID, or barcode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* View Mode Toggle */}
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2 mt-4">
              <Button
                size="sm"
                variant={selectedCategory === null ? "default" : "outline"}
                onClick={() => setSelectedCategory(null)}
              >
                All
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  size="sm"
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* QR Codes Display */}
        <div id="print-area" ref={printRef}>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  <CardContent className="p-4 flex flex-col items-center">
                    {/* QR Code */}
                    <div className="bg-white p-3 rounded-lg mb-3">
                      <QRCodeSVG
                        id={`qr-${product.id}`}
                        value={productToQRData(product)}
                        size={120}
                        level="M"
                        includeMargin={false}
                      />
                    </div>

                    {/* Product Info */}
                    <h3 className="font-semibold text-sm text-center line-clamp-2 mb-1">
                      {product.name}
                    </h3>
                    <p className="text-primary font-bold text-lg mb-1">
                      {product.price.toFixed(2)} SAR
                    </p>
                    <Badge variant="secondary" className="text-xs mb-2">
                      {product.category}
                    </Badge>
                    {product.barcode && (
                      <p className="text-xs text-muted-foreground font-mono">{product.barcode}</p>
                    )}

                    {/* Download Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 w-full"
                      onClick={() => downloadQRCode(product.id, product.name)}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProducts.map((product) => (
                <Card key={product.id}>
                  <CardContent className="p-4 flex items-center gap-4">
                    {/* QR Code */}
                    <div className="bg-white p-2 rounded-lg shrink-0">
                      <QRCodeSVG
                        id={`qr-${product.id}`}
                        value={productToQRData(product)}
                        size={80}
                        level="M"
                        includeMargin={false}
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg">{product.name}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <Badge variant="secondary">{product.category}</Badge>
                        <span className="text-primary font-bold">
                          {product.price.toFixed(2)} SAR
                        </span>
                        {product.weight && (
                          <span className="text-sm text-muted-foreground">
                            Weight: {product.weight} kg
                          </span>
                        )}
                      </div>
                      {product.barcode && (
                        <p className="text-sm text-muted-foreground font-mono mt-1">
                          Barcode: {product.barcode}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadQRCode(product.id, product.name)}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <QrCode className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </CardContent>
          </Card>
        )}

        {/* QR Code Format Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">QR Code Format</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              Each QR code contains JSON data with the following structure:
            </p>
            <pre className="bg-muted p-3 rounded-lg text-xs overflow-x-auto">
              {JSON.stringify(
                {
                  id: "1",
                  name: "Product Name",
                  price: 10.99,
                  category: "Category",
                  weight: 0.5,
                  barcode: "6001234567890",
                },
                null,
                2
              )}
            </pre>
            <p className="text-sm text-muted-foreground mt-3">
              Scan these QR codes with the Smart Cart scanner to add products to your cart.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
