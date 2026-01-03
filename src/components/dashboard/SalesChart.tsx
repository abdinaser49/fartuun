import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { useProductContext } from "@/context/ProductContext";

const data: { name: string; sales: number; profit: number }[] = [];

export function SalesChart() {
  const { settings } = useProductContext();
  return (
    <div className="stat-card opacity-0 animate-slide-up stagger-2">
      <h3 className="font-display text-lg font-semibold text-foreground mb-4">Weekly Overview</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(168 84% 32%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(168 84% 32%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(38 92% 50%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(38 92% 50%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 90%)" vertical={false} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(215 15% 50%)", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(215 15% 50%)", fontSize: 12 }}
              tickFormatter={(value) => `${settings.currency?.split(' ')[1]?.replace(/[()]/g, '') || settings.currency || '$'}${value / 1000}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(0 0% 100%)",
                border: "1px solid hsl(214 20% 90%)",
                borderRadius: "12px",
                boxShadow: "0 4px 6px -1px hsl(215 25% 15% / 0.07)",
              }}
              formatter={(value: number) => [`${settings.currency?.split(' ')[1]?.replace(/[()]/g, '') || settings.currency || '$'}${value.toLocaleString()}`, ""]}
            />
            <Area
              type="monotone"
              dataKey="sales"
              stroke="hsl(168 84% 32%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorSales)"
              name="Sales"
            />
            <Area
              type="monotone"
              dataKey="profit"
              stroke="hsl(38 92% 50%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorProfit)"
              name="Profit"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-sm text-muted-foreground">Sales</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-accent" />
          <span className="text-sm text-muted-foreground">Profit</span>
        </div>
      </div>
    </div>
  );
}
