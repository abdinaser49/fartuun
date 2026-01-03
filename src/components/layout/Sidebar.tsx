import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Truck,
  BarChart3,
  Store,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Wallet,
  Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const adminNavigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "POS", href: "/pos", icon: ShoppingCart },
  { name: "Sales", href: "/sales", icon: Receipt },
  { name: "Products", href: "/products", icon: Package },
  { name: "Purchases", href: "/purchases", icon: Truck },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Suppliers", href: "/suppliers", icon: Store },
  { name: "Expenses", href: "/expenses", icon: Wallet },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

const cashierNavigation = [
  { name: "POS", href: "/pos", icon: ShoppingCart },
  { name: "Sales", href: "/sales", icon: Receipt },
];

import { useProductContext } from "@/context/ProductContext";

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, signOut, isAdmin } = useAuth();
  const { settings } = useProductContext();

  const navigation = isAdmin ? adminNavigation : cashierNavigation;

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const userInitials = user?.email?.substring(0, 2).toUpperCase() || 'U';
  const roleName = isAdmin ? 'Maamulaha (Admin)' : 'Lacag Qaataha (Cashier)';

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar transition-all duration-300 flex flex-col",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-sidebar-border">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-glow">
          <Store className="w-5 h-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <h1 className="font-display text-lg font-bold text-sidebar-foreground">
              {settings.name}
            </h1>
            <p className="text-xs text-sidebar-foreground/60">Retail System</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                "sidebar-item",
                isActive && "active",
                !isActive && "text-sidebar-foreground/70 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-primary-foreground")} />
              {!collapsed && (
                <span className="font-medium animate-fade-in">{item.name}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-sidebar-border">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
            <span className="text-sm font-semibold text-sidebar-foreground">{userInitials}</span>
          </div>
          {!collapsed && (
            <div className="flex-1 animate-fade-in">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.email}</p>
              <p className="text-xs text-sidebar-foreground/60">{roleName}</p>
            </div>
          )}
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleLogout}
              className="text-sidebar-foreground/60 hover:text-sidebar-foreground"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          )}
        </div>
        {collapsed && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleLogout}
            className="w-full mt-2 text-sidebar-foreground/60 hover:text-sidebar-foreground"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Collapse Toggle */}
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-8 bg-card border border-border shadow-card hover:shadow-elevated"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </Button>
    </aside>
  );
}
