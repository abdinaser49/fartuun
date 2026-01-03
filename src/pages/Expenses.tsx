import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Calendar,
  Wallet,
  Zap,
  Home,
  Truck,
  Users,
  MoreVertical,
  Edit2,
  Trash2,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import { useProductContext } from "@/context/ProductContext";

const expenseCategories = [
  { name: "Utilities", icon: Zap, color: "text-blue-500" },
  { name: "Rent", icon: Home, color: "text-purple-500" },
  { name: "Transport", icon: Truck, color: "text-orange-500" },
  { name: "Salaries", icon: Users, color: "text-green-500" },
  { name: "Other", icon: Wallet, color: "text-gray-500" },
];

const Expenses = () => {
  const { expenses, addExpense, updateExpense, deleteExpense, settings } = useProductContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newExpense, setNewExpense] = useState({
    description: "",
    category: "Other",
    amount: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewExpense((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (value: string) => {
    setNewExpense((prev) => ({ ...prev, category: value }));
  };

  const handleAddExpense = async () => {
    if (!newExpense.description || !newExpense.amount) return;

    const expenseData = {
      description: newExpense.description,
      category: newExpense.category,
      amount: parseFloat(newExpense.amount),
    };

    if (isEditing && editingId) {
      await updateExpense({ ...expenseData, id: editingId, date: expenses.find(e => e.id === editingId)?.date || new Date() });
    } else {
      await addExpense(expenseData);
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setNewExpense({ description: "", category: "Other", amount: "" });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleEdit = (expense: any) => {
    setNewExpense({
      description: expense.description,
      category: expense.category,
      amount: expense.amount.toString(),
    });
    setIsEditing(true);
    setEditingId(expense.id);
    setIsDialogOpen(true);
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const expenseByCategory = expenseCategories.map((cat) => ({
    ...cat,
    total: expenses.filter((e) => e.category === cat.name).reduce((sum, e) => sum + e.amount, 0),
  }));

  const getCategoryIcon = (categoryName: string) => {
    const category = expenseCategories.find((c) => c.name === categoryName);
    if (!category) return Wallet;
    return category.icon;
  };

  const getCategoryColor = (categoryName: string) => {
    const category = expenseCategories.find((c) => c.name === categoryName);
    return category?.color || "text-gray-500";
  };

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 opacity-0 animate-fade-in">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Expenses</h1>
          <p className="text-muted-foreground mt-1">Track and manage business expenses</p>
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
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="font-display">
                {isEditing ? "Edit Expense" : "Add New Expense"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" placeholder="Enter expense description" value={newExpense.description} onChange={handleInputChange} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={newExpense.category} onValueChange={handleSelectChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseCategories.map((cat) => (
                        <SelectItem key={cat.name} value={cat.name}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input id="amount" type="number" placeholder="0.00" value={newExpense.amount} onChange={handleInputChange} />
                </div>
              </div>
              <Button className="w-full mt-2" onClick={handleAddExpense}>
                {isEditing ? "Update Expense" : "Add Expense"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="stat-card opacity-0 animate-slide-up stagger-1 col-span-1 md:col-span-2">
          <p className="text-sm font-medium text-muted-foreground">Total Expenses This Month</p>
          <p className="text-4xl font-display font-bold text-destructive mt-1">{settings.currency?.split(' ')[1]?.replace(/[()]/g, '') || settings.currency || '$'}{totalExpenses.toLocaleString()}</p>
        </div>
        {expenseByCategory.slice(0, 2).map((cat, index) => (
          <div
            key={cat.name}
            className={cn("stat-card opacity-0 animate-slide-up", `stagger-${index + 2}`)}
          >
            <div className="flex items-center gap-2 mb-2">
              <cat.icon className={cn("w-5 h-5", cat.color)} />
              <p className="text-sm font-medium text-muted-foreground">{cat.name}</p>
            </div>
            <p className="text-2xl font-display font-bold text-foreground">{settings.currency?.split(' ')[1]?.replace(/[()]/g, '') || settings.currency || '$'}{cat.total.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="stat-card opacity-0 animate-slide-up stagger-3">
          <h3 className="font-display font-semibold text-foreground mb-4">By Category</h3>
          <div className="space-y-3">
            {expenseByCategory.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn("w-8 h-8 rounded-lg bg-secondary flex items-center justify-center", cat.color)}>
                    <cat.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{cat.name}</span>
                </div>
                <span className="font-semibold text-foreground">{settings.currency?.split(' ')[1]?.replace(/[()]/g, '') || settings.currency || '$'}{cat.total.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="stat-card opacity-0 animate-slide-up stagger-4 lg:col-span-2">
          <h3 className="font-display font-semibold text-foreground mb-4">Recent Expenses</h3>
          <div className="space-y-3">
            {expenses.map((expense, index) => {
              const Icon = getCategoryIcon(expense.category);
              return (
                <div
                  key={expense.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors group",
                    "opacity-0 animate-fade-in"
                  )}
                  style={{ animationDelay: `${0.4 + index * 0.05}s` }}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-lg bg-card flex items-center justify-center", getCategoryColor(expense.category))}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{expense.description}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>{expense.date.toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{expense.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-foreground mr-2">{settings.currency?.split(' ')[1]?.replace(/[()]/g, '') || settings.currency || '$'}{expense.amount.toFixed(2)}</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                        onClick={() => handleEdit(expense)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete this expense?`)) {
                            deleteExpense(expense.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Expenses;
