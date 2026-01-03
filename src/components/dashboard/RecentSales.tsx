import { cn } from "@/lib/utils";

import { useProductContext } from "@/context/ProductContext";

export function RecentSales() {
  const { sales, settings } = useProductContext();

  const recentSales = sales.slice(0, 5);

  return (
    <div className="stat-card opacity-0 animate-slide-up stagger-3">
      <h3 className="font-display text-lg font-semibold text-foreground mb-4">Recent Sales</h3>
      <div className="space-y-4">
        {recentSales.map((sale, index) => (
          <div
            key={sale.id}
            className={cn(
              "flex items-center justify-between py-3 border-b border-border/50 last:border-0",
              "opacity-0 animate-fade-in"
            )}
            style={{ animationDelay: `${0.3 + index * 0.1}s` }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                <span className="text-sm font-semibold text-secondary-foreground">
                  {sale.customer ? sale.customer.split(" ").map((n) => n[0]).join("") : "G"}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{sale.customer || "Guest Customer"}</p>
                <p className="text-xs text-muted-foreground">{sale.items} items</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-foreground">{settings.currency?.split(' ')[1]?.replace(/[()]/g, '') || settings.currency || '$'}{sale.total.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">{new Date(sale.date).toLocaleTimeString()}</p>
            </div>
          </div>
        ))}
        {recentSales.length === 0 && (
          <p className="text-sm text-center py-4 text-muted-foreground">No recent sales</p>
        )}
      </div>
    </div>
  );
}
