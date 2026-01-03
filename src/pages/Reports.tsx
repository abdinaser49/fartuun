import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  ShoppingCart,
  Wallet,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import { useProductContext } from "@/context/ProductContext";

const Reports = () => {
  const { sales, expenses, products, settings } = useProductContext();

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalExpensesCount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalOrdersCount = sales.length;
  const netProfit = totalRevenue - totalExpensesCount;

  // Simple aggregation for charts
  const salesData = [
    { name: "Week 1", sales: totalRevenue * 0.2, profit: netProfit * 0.2 },
    { name: "Week 2", sales: totalRevenue * 0.3, profit: netProfit * 0.3 },
    { name: "Week 3", sales: totalRevenue * 0.25, profit: netProfit * 0.25 },
    { name: "Week 4", sales: totalRevenue * 0.25, profit: netProfit * 0.25 },
  ];

  const categoryData = [
    { name: "Food", value: 40, color: "hsl(168 84% 32%)" },
    { name: "Drinks", value: 25, color: "hsl(142 76% 36%)" },
    { name: "Clothes", value: 20, color: "hsl(215 91% 60%)" },
    { name: "Other", value: 15, color: "hsl(215 15% 50%)" },
  ];

  const topSellingProducts = products.slice(0, 5).map(p => ({
    name: p.name,
    sold: Math.floor(Math.random() * 1000),
    revenue: p.price * 100
  }));

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 opacity-0 animate-fade-in">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground mt-1">Analyze your business performance</p>
        </div>
        <div className="flex items-center gap-3">
          <Select defaultValue="month">
            <SelectTrigger className="w-40">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="secondary" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="stat-card opacity-0 animate-slide-up stagger-1">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <div className="flex items-center gap-1 text-success">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">+12.5%</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Total Revenue</p>
          <p className="text-2xl font-display font-bold text-foreground">{settings.currency?.split(' ')[1]?.replace(/[()]/g, '') || settings.currency || '$'}{totalRevenue.toFixed(2)}</p>
        </div>

        <div className="stat-card opacity-0 animate-slide-up stagger-2">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <div className="flex items-center gap-1 text-success">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">+8.3%</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Net Profit</p>
          <p className={cn("text-2xl font-display font-bold", netProfit >= 0 ? "text-success" : "text-destructive")}>
            {settings.currency?.split(' ')[1]?.replace(/[()]/g, '') || settings.currency || '$'}{netProfit.toFixed(2)}
          </p>
        </div>

        <div className="stat-card opacity-0 animate-slide-up stagger-3">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-accent" />
            </div>
            <div className="flex items-center gap-1 text-success">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">+15.2%</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Total Orders</p>
          <p className="text-2xl font-display font-bold text-foreground">{totalOrdersCount}</p>
        </div>

        <div className="stat-card opacity-0 animate-slide-up stagger-4">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-destructive" />
            </div>
            <div className="flex items-center gap-1 text-destructive">
              <TrendingDown className="w-4 h-4" />
              <span className="text-sm font-medium">-3.1%</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Total Expenses</p>
          <p className="text-2xl font-display font-bold text-foreground">{settings.currency?.split(' ')[1]?.replace(/[()]/g, '') || settings.currency || '$'}{totalExpensesCount.toFixed(2)}</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="stat-card opacity-0 animate-slide-up stagger-3 lg:col-span-2">
          <h3 className="font-display font-semibold text-foreground mb-4">Revenue & Profit Trend</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(168 84% 32%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(168 84% 32%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(142 76% 36%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(142 76% 36%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 90%)" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "hsl(215 15% 50%)", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(215 15% 50%)", fontSize: 12 }} tickFormatter={(value) => `${settings.currency?.split(' ')[1]?.replace(/[()]/g, '') || settings.currency || '$'}${value / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(0 0% 100%)",
                    border: "1px solid hsl(214 20% 90%)",
                    borderRadius: "12px",
                  }}
                  formatter={(value: number) => [`${settings.currency?.split(' ')[1]?.replace(/[()]/g, '') || settings.currency || '$'}${value.toLocaleString()}`, ""]}
                />
                <Area type="monotone" dataKey="sales" stroke="hsl(168 84% 32%)" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
                <Area type="monotone" dataKey="profit" stroke="hsl(142 76% 36%)" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" name="Profit" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Pie Chart */}
        <div className="stat-card opacity-0 animate-slide-up stagger-4">
          <h3 className="font-display font-semibold text-foreground mb-4">Sales by Category</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value}%`, ""]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {categoryData.map((cat) => (
              <div key={cat.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="text-sm text-muted-foreground">{cat.name}</span>
                <span className="text-sm font-medium text-foreground">{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="stat-card opacity-0 animate-slide-up stagger-5">
        <h3 className="font-display font-semibold text-foreground mb-4">Top Selling Products</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Product</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Units Sold</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Revenue</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Performance</th>
              </tr>
            </thead>
            <tbody>
              {topSellingProducts.map((product, index) => (
                <tr
                  key={product.name}
                  className={cn(
                    "border-b border-border/30 hover:bg-secondary/30 transition-colors",
                    "opacity-0 animate-fade-in"
                  )}
                  style={{ animationDelay: `${0.5 + index * 0.05}s` }}
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Package className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-medium text-foreground">{product.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-foreground">{product.sold.toLocaleString()}</td>
                  <td className="py-4 px-4 font-semibold text-foreground">{settings.currency?.split(' ')[1]?.replace(/[()]/g, '') || settings.currency || '$'}{product.revenue.toLocaleString()}</td>
                  <td className="py-4 px-4">
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${(product.sold / 1000) * 100}%` }}
                      />
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

export default Reports;
