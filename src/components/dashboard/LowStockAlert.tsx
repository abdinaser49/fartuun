import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

import { useProductContext } from "@/context/ProductContext";

export function LowStockAlert() {
  const { products } = useProductContext();

  const lowStockItems = products.filter(p => p.stock < 10);

  return (
    <div className="stat-card border-destructive/30 opacity-0 animate-slide-up stagger-5">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-destructive" />
        <h3 className="font-display text-lg font-semibold text-foreground">Low Stock Alert</h3>
      </div>
      <div className="space-y-3">
        {lowStockItems.map((item, index) => (
          <div
            key={item.id}
            className={cn(
              "flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/20",
              "opacity-0 animate-fade-in"
            )}
            style={{ animationDelay: `${0.5 + index * 0.1}s` }}
          >
            <div>
              <p className="text-sm font-medium text-foreground">{item.name}</p>
              <p className="text-xs text-muted-foreground">Min: 10 units</p>
            </div>
            <div className="badge-low-stock">
              {item.stock} left
            </div>
          </div>
        ))}
        {lowStockItems.length === 0 && (
          <p className="text-sm text-center py-4 text-muted-foreground">No low stock items</p>
        )}
      </div>
    </div>
  );
}
