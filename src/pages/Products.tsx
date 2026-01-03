import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  Filter,
  Package,
  Edit2,
  Trash2,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useProductContext } from "@/context/ProductContext";

const categories = ["All", "Food", "Drinks", "Clothes", "Shopping", "Other"];
const units = ["Piece", "KG", "Gram", "Bottle", "Pack", "Carton"];

const Products = () => {
  const { products, addProduct, updateProduct, deleteProduct, settings } = useProductContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();

  const [newProduct, setNewProduct] = useState({
    name: "",
    sku: "",
    category: "",
    price: "",
    cost: "",
    stock: "",
    unit: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setNewProduct((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setNewProduct({
      name: "",
      sku: "",
      category: "",
      price: "",
      cost: "",
      stock: "",
      unit: "",
    });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleEdit = (product: any) => {
    setNewProduct({
      name: product.name,
      sku: product.sku || "",
      category: product.category || "",
      price: product.price.toString(),
      cost: product.cost.toString(),
      stock: product.stock.toString(),
      unit: product.unit || "",
    });
    setIsEditing(true);
    setEditingId(product.id);
    setIsDialogOpen(true);
  };

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const productData = {
      name: newProduct.name,
      sku: newProduct.sku || `SKU${Date.now()}`,
      category: newProduct.category || "Other",
      price: parseFloat(newProduct.price),
      cost: parseFloat(newProduct.cost) || 0,
      stock: parseInt(newProduct.stock) || 0,
      unit: newProduct.unit || "Piece",
      status: (parseInt(newProduct.stock) || 0) < 10 ? "low-stock" : "in-stock",
    };

    if (isEditing && editingId) {
      updateProduct({ ...productData, id: editingId });
    } else {
      addProduct(productData);
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 opacity-0 animate-fade-in">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground mt-1">Manage your product inventory</p>
        </div>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="font-display">
                {isEditing ? "Edit Product" : "Add New Product"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter product name"
                  value={newProduct.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="sku">SKU / Barcode</Label>
                  <Input
                    id="sku"
                    placeholder="SKU001"
                    value={newProduct.sku}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={newProduct.category}
                    onValueChange={(value) => handleSelectChange("category", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.slice(1).map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="cost">Purchase Price</Label>
                  <Input
                    id="cost"
                    type="number"
                    placeholder="0.00"
                    value={newProduct.cost}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="price">Selling Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="0.00"
                    value={newProduct.price}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="stock">Stock Quantity</Label>
                  <Input
                    id="stock"
                    type="number"
                    placeholder="0"
                    value={newProduct.stock}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="unit">Unit Type</Label>
                  <Select
                    value={newProduct.unit}
                    onValueChange={(value) => handleSelectChange("unit", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((unit) => (
                        <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full mt-2" onClick={handleAddProduct}>
                {isEditing ? "Update Product" : "Add Product"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 opacity-0 animate-slide-up stagger-1">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-10 input-search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "secondary"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProducts.map((product, index) => (
          <div
            key={product.id}
            className="stat-card opacity-0 animate-scale-in group"
            style={{ animationDelay: `${0.1 + index * 0.05}s` }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Package className="w-6 h-6 text-primary" />
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                  onClick={() => handleEdit(product)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
                      deleteProduct(product.id);
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <h3 className="font-semibold text-foreground mb-1">{product.name}</h3>
            <p className="text-sm text-muted-foreground mb-3">{product.sku} · {product.category}</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-foreground">{settings.currency?.split(' ')[1]?.replace(/[()]/g, '') || settings.currency || '$'}{product.price.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Cost: {settings.currency?.split(' ')[1]?.replace(/[()]/g, '') || settings.currency || '$'}{product.cost.toFixed(2)}</p>
              </div>
              <div className={product.status === "low-stock" ? "badge-low-stock" : "badge-in-stock"}>
                {product.stock} {product.unit}
              </div>
            </div>
          </div>
        ))}
        {filteredProducts.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No products found
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Products;
