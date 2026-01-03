import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  Smartphone,
  User,
  Percent,
  Receipt,
  Barcode,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useProductContext } from "@/context/ProductContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

const categories = ["All", "Food", "Drinks", "Clothes", "Shopping"];

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
}

const POS = () => {
  const { products, sales, customers, addSale, addCustomer, settings } = useProductContext();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [discount, setDiscount] = useState(0);

  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false);
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
  });

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: typeof products[0]) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal - discountAmount;

  const handleCheckout = (method: string) => {
    if (cart.length === 0) return;
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

    addSale({
      customer: selectedCustomer ? selectedCustomer.name : "Guest Customer",
      customerId: selectedCustomer?.id,
      items: totalItems,
      total: total,
      paymentMethod: method,
    }, cart);

    toast.success(`Payment of ${settings.currency?.split(' ')[1]?.replace(/[()]/g, '') || settings.currency || '$'}${total.toFixed(2)} processed via ${method}!`);
    setCart([]);
    setDiscount(0);
    setSelectedCustomer(null);
  };

  const handleQuickAddCustomer = async () => {
    if (!newCustomer.name) return;
    await addCustomer({
      ...newCustomer,
      email: "",
      address: "",
      credit: 0,
      totalPurchases: 0,
    });
    setIsAddingCustomer(false);
    setNewCustomer({ name: "", phone: "" });
  };

  return (
    <MainLayout>
      <div className="flex gap-6 h-[calc(100vh-8rem)]">
        {/* Products Section */}
        <div className="flex-1 flex flex-col opacity-0 animate-fade-in">
          <div className="mb-4">
            <h1 className="text-2xl font-display font-bold text-foreground">{settings.name} POS</h1>
            <p className="text-muted-foreground">{settings.address}</p>
          </div>

          {/* Search and Barcode */}
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search or scan barcode..."
                className="pl-10 input-search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="secondary" size="icon">
              <Barcode className="w-5 h-5" />
            </Button>
          </div>

          {/* Categories */}
          <div className="flex gap-2 mb-4 flex-wrap">
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

          {/* Products Grid */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredProducts.map((product, index) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className={cn(
                    "pos-item text-left opacity-0 animate-scale-in"
                  )}
                  style={{ animationDelay: `${index * 0.03}s` }}
                >
                  <h3 className="font-medium text-foreground text-sm mb-1 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-2">{product.unit}</p>
                  <p className="text-lg font-bold text-primary">{settings.currency?.split(' ')[1]?.replace(/[()]/g, '') || settings.currency || '$'}{product.price.toFixed(2)}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Cart Section */}
        <div className="w-96 flex flex-col bg-card rounded-2xl border border-border/50 shadow-card opacity-0 animate-slide-up stagger-1">
          {/* Cart Header */}
          <div className="p-4 border-b border-border/50">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-semibold text-foreground">Current Sale</h2>
                <Dialog open={isAddingCustomer} onOpenChange={setIsAddingCustomer}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2 text-primary hover:text-primary hover:bg-primary/10">
                      <Plus className="w-4 h-4" />
                      Quick Add
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                      <DialogTitle>Quick Add Customer</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="quick-name">Customer Name</Label>
                        <Input
                          id="quick-name"
                          placeholder="Full Name"
                          value={newCustomer.name}
                          onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="quick-phone">Phone Number</Label>
                        <Input
                          id="quick-phone"
                          placeholder="+252..."
                          value={newCustomer.phone}
                          onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                        />
                      </div>
                      <Button className="w-full mt-2" onClick={handleQuickAddCustomer}>
                        Save Customer
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="flex items-center gap-2">
                <Popover open={customerSearchOpen} onOpenChange={setCustomerSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={customerSearchOpen}
                      className="flex-1 justify-between bg-secondary/50 border-none hover:bg-secondary truncate"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <User className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="truncate">
                          {selectedCustomer ? selectedCustomer.name : "Select Customer (Guest)"}
                        </span>
                      </div>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search customer..." />
                      <CommandList>
                        <CommandEmpty>No customer found.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            onSelect={() => {
                              setSelectedCustomer(null);
                              setCustomerSearchOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                !selectedCustomer ? "opacity-100" : "opacity-0"
                              )}
                            />
                            Guest Customer
                          </CommandItem>
                          {customers.map((customer) => (
                            <CommandItem
                              key={customer.id}
                              value={customer.name}
                              onSelect={() => {
                                setSelectedCustomer(customer);
                                setCustomerSearchOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedCustomer?.id === customer.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col">
                                <span>{customer.name}</span>
                                <span className="text-[10px] text-muted-foreground">{customer.phone}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {selectedCustomer && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setSelectedCustomer(null)}
                    className="shrink-0 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Plus className="w-4 h-4 rotate-45" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Receipt className="w-12 h-12 mb-2 opacity-50" />
                <p>Cart is empty</p>
                <p className="text-sm">Click products to add them</p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground text-sm">{item.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {settings.currency?.split(' ')[1]?.replace(/[()]/g, '') || settings.currency || '$'}{item.price.toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="icon-sm"
                      onClick={() => updateQuantity(item.id, -1)}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <Button
                      variant="secondary"
                      size="icon-sm"
                      onClick={() => updateQuantity(item.id, 1)}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeFromCart(item.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Footer */}
          <div className="p-4 border-t border-border/50 space-y-4">
            {/* Discount */}
            <div className="flex items-center gap-2">
              <Percent className="w-4 h-4 text-muted-foreground" />
              <Input
                type="number"
                placeholder="Discount %"
                className="flex-1"
                value={discount || ""}
                onChange={(e) => setDiscount(Number(e.target.value))}
              />
            </div>

            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{settings.currency?.split(' ')[1]?.replace(/[()]/g, '') || settings.currency || '$'}{subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Discount ({discount}%)</span>
                  <span className="font-medium text-destructive">-{settings.currency?.split(' ')[1]?.replace(/[()]/g, '') || settings.currency || '$'}{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">{settings.currency?.split(' ')[1]?.replace(/[()]/g, '') || settings.currency || '$'}{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                className="flex-col h-auto py-3 gap-1"
                onClick={() => handleCheckout("EVC PLUS")}
                disabled={cart.length === 0}
              >
                <Smartphone className="w-5 h-5 text-primary" />
                <span className="text-xs font-semibold">EVC PLUS</span>
              </Button>
              <Button
                variant="secondary"
                className="flex-col h-auto py-3 gap-1"
                onClick={() => handleCheckout("EDAHAB")}
                disabled={cart.length === 0}
              >
                <Smartphone className="w-5 h-5 text-primary" />
                <span className="text-xs font-semibold">EDAHAB</span>
              </Button>
              <Button
                variant="secondary"
                className="flex-col h-auto py-3 gap-1"
                onClick={() => handleCheckout("JEEP")}
                disabled={cart.length === 0}
              >
                <Smartphone className="w-5 h-5 text-primary" />
                <span className="text-xs font-semibold">JEEP</span>
              </Button>
              <Button
                variant="secondary"
                className="flex-col h-auto py-3 gap-1"
                onClick={() => handleCheckout("CASH")}
                disabled={cart.length === 0}
              >
                <Banknote className="w-5 h-5 text-primary" />
                <span className="text-xs font-semibold">CASH</span>
              </Button>
              <Button
                variant="secondary"
                className="flex-col h-auto py-3 gap-1 col-span-2"
                onClick={() => handleCheckout("CARD")}
                disabled={cart.length === 0}
              >
                <CreditCard className="w-5 h-5 text-primary" />
                <span className="text-xs font-semibold">CARD</span>
              </Button>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={() => handleCheckout("CASH")}
              disabled={cart.length === 0}
            >
              Complete Sale
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default POS;
