import { MainLayout } from "@/components/layout/MainLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentSales } from "@/components/dashboard/RecentSales";
import { TopProducts } from "@/components/dashboard/TopProducts";
import { LowStockAlert } from "@/components/dashboard/LowStockAlert";
import { SalesChart } from "@/components/dashboard/SalesChart";
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { useProductContext } from "@/context/ProductContext";

const Dashboard = () => {
  const { products, sales, customers, expenses, settings } = useProductContext();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todaySales = sales
    .filter(sale => new Date(sale.date) >= today)
    .reduce((sum, sale) => sum + sale.total, 0);

  const todayOrders = sales.filter(sale => new Date(sale.date) >= today).length;

  const todayExpenses = expenses
    .filter(e => new Date(e.date) >= today)
    .reduce((sum, e) => sum + e.amount, 0);

  const todayProfit = todaySales - todayExpenses;

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-8 opacity-0 animate-fade-in">
        <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Today's Sales"
          value={`${settings.currency?.split(' ')[1]?.replace(/[()]/g, '') || settings.currency || '$'}${todaySales.toFixed(2)}`}
          change={0}
          trend="up"
          icon={<DollarSign className="w-6 h-6 text-primary" />}
          className="stagger-1"
        />
        <StatCard
          title="Total Orders"
          value={todayOrders.toString()}
          change={0}
          trend="up"
          icon={<ShoppingCart className="w-6 h-6 text-primary" />}
          className="stagger-2"
        />
        <StatCard
          title="Products"
          value={products.length.toString()}
          change={0}
          trend="up"
          icon={<Package className="w-6 h-6 text-primary" />}
          className="stagger-3"
        />
        <StatCard
          title="Customers"
          value={customers.length.toString()}
          change={0}
          trend="up"
          icon={<Users className="w-6 h-6 text-primary" />}
          className="stagger-4"
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        <div className="stat-card opacity-0 animate-slide-up stagger-1 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Today's Profit</p>
            <p className={cn("text-4xl font-display font-bold mt-1", todayProfit >= 0 ? "text-success" : "text-destructive")}>
              {settings.currency?.split(' ')[1]?.replace(/[()]/g, '') || settings.currency || '$'}{todayProfit.toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              After {settings.currency?.split(' ')[1]?.replace(/[()]/g, '') || settings.currency || '$'}{todayExpenses.toFixed(2)} in expenses
            </p>
          </div>
          <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center", todayProfit >= 0 ? "bg-success/10" : "bg-destructive/10")}>
            <TrendingUp className={cn("w-8 h-8", todayProfit >= 0 ? "text-success" : "text-destructive")} />
          </div>
        </div>
      </div>

      {/* Charts and Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <SalesChart />
        <RecentSales />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopProducts />
        <LowStockAlert />
      </div>
    </MainLayout>
  );
};

export default Dashboard;
