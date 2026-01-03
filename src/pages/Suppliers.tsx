import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  MoreVertical,
  Edit2,
  Trash2,
  Package,
  Building2,
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

import { useProductContext } from "@/context/ProductContext";

const Suppliers = () => {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useProductContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newSupplier, setNewSupplier] = useState({
    name: "",
    contact: "",
    phone: "",
    email: "",
    address: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewSupplier((prev) => ({ ...prev, [id]: value }));
  };

  const handleAddSupplier = async () => {
    if (!newSupplier.name) return;

    const supplierData = {
      name: newSupplier.name,
      contact: newSupplier.contact,
      phone: newSupplier.phone,
      email: newSupplier.email,
      address: newSupplier.address,
      products: isEditing ? (suppliers.find(s => s.id === editingId)?.products || 0) : 0,
      lastOrder: isEditing ? (suppliers.find(s => s.id === editingId)?.lastOrder || "Never") : "Never",
    };

    if (isEditing && editingId) {
      await updateSupplier({ ...supplierData, id: editingId });
    } else {
      await addSupplier(supplierData);
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setNewSupplier({ name: "", contact: "", phone: "", email: "", address: "" });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleEdit = (supplier: any) => {
    setNewSupplier({
      name: supplier.name,
      contact: supplier.contact,
      phone: supplier.phone,
      email: supplier.email,
      address: supplier.address,
    });
    setIsEditing(true);
    setEditingId(supplier.id);
    setIsDialogOpen(true);
  };

  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 opacity-0 animate-fade-in">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Suppliers</h1>
          <p className="text-muted-foreground mt-1">Manage your supplier network</p>
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
              Add Supplier
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="font-display">
                {isEditing ? "Edit Supplier" : "Add New Supplier"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Company Name</Label>
                <Input id="name" placeholder="Enter company name" value={newSupplier.name} onChange={handleInputChange} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contact">Contact Person</Label>
                <Input id="contact" placeholder="Enter contact name" value={newSupplier.contact} onChange={handleInputChange} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" placeholder="+252 61 XXX XXXX" value={newSupplier.phone} onChange={handleInputChange} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="email@example.com" value={newSupplier.email} onChange={handleInputChange} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" placeholder="Full address" value={newSupplier.address} onChange={handleInputChange} />
              </div>
              <Button className="w-full mt-2" onClick={handleAddSupplier}>
                {isEditing ? "Update Supplier" : "Add Supplier"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="stat-card opacity-0 animate-slide-up stagger-1">
          <p className="text-sm font-medium text-muted-foreground">Total Suppliers</p>
          <p className="text-3xl font-display font-bold text-foreground mt-1">{suppliers.length}</p>
        </div>
        <div className="stat-card opacity-0 animate-slide-up stagger-2">
          <p className="text-sm font-medium text-muted-foreground">Total Products Supplied</p>
          <p className="text-3xl font-display font-bold text-primary mt-1">
            {suppliers.reduce((sum, s) => sum + s.products, 0)}
          </p>
        </div>
        <div className="stat-card opacity-0 animate-slide-up stagger-3">
          <p className="text-sm font-medium text-muted-foreground">Active This Month</p>
          <p className="text-3xl font-display font-bold text-foreground mt-1">{suppliers.length}</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6 opacity-0 animate-slide-up stagger-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search suppliers..."
            className="pl-10 input-search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSuppliers.map((supplier, index) => (
          <div
            key={supplier.id}
            className="stat-card opacity-0 animate-scale-in group"
            style={{ animationDelay: `${0.4 + index * 0.05}s` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{supplier.name}</h3>
                  <p className="text-sm text-muted-foreground">{supplier.contact}</p>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                  onClick={() => handleEdit(supplier)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete "${supplier.name}"?`)) {
                      deleteSupplier(supplier.id);
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>{supplier.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>{supplier.email}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{supplier.address}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border/50 flex justify-between items-center">
              <div>
                <span className="text-sm text-muted-foreground">Products</span>
                <p className="font-semibold text-foreground">{supplier.products}</p>
              </div>
              <div className="text-right">
                <span className="text-sm text-muted-foreground">Last Order</span>
                <p className="font-semibold text-foreground">{supplier.lastOrder}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </MainLayout>
  );
};

export default Suppliers;
