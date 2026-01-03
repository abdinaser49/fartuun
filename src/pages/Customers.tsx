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
  DollarSign,
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

const Customers = () => {
  const { customers, addCustomer, updateCustomer, deleteCustomer, settings } = useProductContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewCustomer((prev) => ({ ...prev, [id]: value }));
  };

  const handleAddCustomer = async () => {
    if (!newCustomer.name) return;

    const customerData = {
      name: newCustomer.name,
      phone: newCustomer.phone,
      email: newCustomer.email,
      address: newCustomer.address,
      credit: isEditing ? (customers.find(c => c.id === editingId)?.credit || 0) : 0,
      totalPurchases: isEditing ? (customers.find(c => c.id === editingId)?.totalPurchases || 0) : 0,
    };

    if (isEditing && editingId) {
      await updateCustomer({ ...customerData, id: editingId });
    } else {
      await addCustomer(customerData);
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setNewCustomer({ name: "", phone: "", email: "", address: "" });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleEdit = (customer: any) => {
    setNewCustomer({
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
    });
    setIsEditing(true);
    setEditingId(customer.id);
    setIsDialogOpen(true);
  };

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalCredit = customers.reduce((sum, c) => sum + c.credit, 0);

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 opacity-0 animate-fade-in">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Customers</h1>
          <p className="text-muted-foreground mt-1">Manage your customer relationships</p>
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
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="font-display">
                {isEditing ? "Edit Customer" : "Add New Customer"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Enter customer name" value={newCustomer.name} onChange={handleInputChange} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" placeholder="+252 61 XXX XXXX" value={newCustomer.phone} onChange={handleInputChange} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="email@example.com" value={newCustomer.email} onChange={handleInputChange} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" placeholder="City, Country" value={newCustomer.address} onChange={handleInputChange} />
              </div>
              <Button className="w-full mt-2" onClick={handleAddCustomer}>
                {isEditing ? "Update Customer" : "Add Customer"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="stat-card opacity-0 animate-slide-up stagger-1">
          <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
          <p className="text-3xl font-display font-bold text-foreground mt-1">{customers.length}</p>
        </div>
        <div className="stat-card opacity-0 animate-slide-up stagger-2">
          <p className="text-sm font-medium text-muted-foreground">Total Credit Owed</p>
          <p className="text-3xl font-display font-bold text-destructive mt-1">{settings.currency?.split(' ')[1]?.replace(/[()]/g, '') || settings.currency || '$'}{totalCredit.toFixed(2)}</p>
        </div>
        <div className="stat-card opacity-0 animate-slide-up stagger-3">
          <p className="text-sm font-medium text-muted-foreground">With Outstanding Credit</p>
          <p className="text-3xl font-display font-bold text-foreground mt-1">{customers.filter(c => c.credit > 0).length}</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6 opacity-0 animate-slide-up stagger-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            className="pl-10 input-search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((customer, index) => (
          <div
            key={customer.id}
            className="stat-card opacity-0 animate-scale-in group"
            style={{ animationDelay: `${0.4 + index * 0.05}s` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">
                    {customer.name.split(" ").map((n) => n[0]).join("")}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{customer.name}</h3>
                  {customer.credit > 0 && (
                    <span className="badge-low-stock text-xs">
                      {settings.currency?.split(' ')[1]?.replace(/[()]/g, '') || settings.currency || '$'}{customer.credit.toFixed(2)} credit
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                  onClick={() => handleEdit(customer)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete "${customer.name}"?`)) {
                      deleteCustomer(customer.id);
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
                <span>{customer.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>{customer.email}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{customer.address}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border/50">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Purchases</span>
                <span className="font-semibold text-foreground">{settings.currency?.split(' ')[1]?.replace(/[()]/g, '') || settings.currency || '$'}{customer.totalPurchases.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </MainLayout>
  );
};

export default Customers;
