import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  FileText,
  Calendar,
  Building2,
  Eye,
  Download,
} from "lucide-react";
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
import { cn } from "@/lib/utils";

import { useProductContext } from "@/context/ProductContext";

const Purchases = () => {
  const { purchases, suppliers, settings } = useProductContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredPurchases = purchases.filter((purchase) =>
    purchase.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    purchase.supplier.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPurchases = purchases.reduce((sum, p) => sum + p.total, 0);
  const pendingCount = purchases.filter(p => p.status === "pending").length;

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 opacity-0 animate-fade-in">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Purchases</h1>
          <p className="text-muted-foreground mt-1">Manage purchase orders and inventory</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Purchase Order
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="font-display">Create Purchase Order</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>{supplier.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Order Date</Label>
                <Input id="date" type="date" />
              </div>
              <div className="grid gap-2">
                <Label>Add Products</Label>
                <div className="p-4 border border-dashed border-border rounded-lg text-center text-muted-foreground">
                  <p className="text-sm">Click to add products to this order</p>
                </div>
              </div>
              <Button className="w-full mt-2" onClick={() => setIsDialogOpen(false)}>
                Create Order
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="stat-card opacity-0 animate-slide-up stagger-1">
          <p className="text-sm font-medium text-muted-foreground">Total Purchase Orders</p>
          <p className="text-3xl font-display font-bold text-foreground mt-1">{purchases.length}</p>
        </div>
        <div className="stat-card opacity-0 animate-slide-up stagger-2">
          <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
          <p className="text-3xl font-display font-bold text-primary mt-1">{settings.currency?.split(' ')[1]?.replace(/[()]/g, '') || settings.currency || '$'}{totalPurchases.toLocaleString()}</p>
        </div>
        <div className="stat-card opacity-0 animate-slide-up stagger-3">
          <p className="text-sm font-medium text-muted-foreground">Pending Orders</p>
          <p className="text-3xl font-display font-bold text-accent mt-1">{pendingCount}</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6 opacity-0 animate-slide-up stagger-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            className="pl-10 input-search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="stat-card opacity-0 animate-slide-up stagger-5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Order ID</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Supplier</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Items</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Total</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPurchases.map((purchase, index) => (
                <tr
                  key={purchase.id}
                  className={cn(
                    "border-b border-border/30 hover:bg-secondary/30 transition-colors",
                    "opacity-0 animate-fade-in"
                  )}
                  style={{ animationDelay: `${0.5 + index * 0.05}s` }}
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      <span className="font-medium text-foreground">{purchase.id}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">{purchase.supplier}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{purchase.date.toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-foreground">{purchase.items}</td>
                  <td className="py-4 px-4 font-semibold text-foreground">{settings.currency?.split(' ')[1]?.replace(/[()]/g, '') || settings.currency || '$'}{purchase.total.toLocaleString()}</td>
                  <td className="py-4 px-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium",
                      purchase.status === "completed" ? "bg-success/10 text-success" : "bg-accent/10 text-accent"
                    )}>
                      {purchase.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon-sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon-sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
};

export default Purchases;
