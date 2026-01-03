import { cn } from "@/lib/utils";

import { useProductContext } from "@/context/ProductContext";

export function TopProducts() {
  const { products, settings } = useProductContext();

  const topProducts = products.slice(0, 5);

  return (
    <div className="stat-card opacity-0 animate-slide-up stagger-4">
      <h3 className="font-display text-lg font-semibold text-foreground mb-4">Top Selling Products</h3>
      <div className="space-y-3">
        {topProducts.map((product, index) => (
          <div
            key={product.id}
            className={cn(
              "flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors",
              "opacity-0 animate-fade-in"
            )}
            style={{ animationDelay: `${0.4 + index * 0.1}s` }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">#{index + 1}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{product.name}</p>
                <p className="text-xs text-muted-foreground">{product.category}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-foreground">{settings.currency?.split(' ')[1]?.replace(/[()]/g, '') || settings.currency || '$'}{product.price.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">{Math.floor(Math.random() * 50)} sold</p>
            </div>
          </div>
        ))}
        {topProducts.length === 0 && (
          <p className="text-sm text-center py-4 text-muted-foreground">No products found</p>
        )}
      </div>
    </div>
  );
}
