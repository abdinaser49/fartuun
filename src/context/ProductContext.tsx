import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface Product {
    id: string; // Changed to string for UUID
    name: string;
    sku: string;
    category: string;
    price: number;
    cost: number;
    stock: number;
    unit: string;
    status: string;
}

export interface Sale {
    id: string;
    customer: string;
    items: number;
    total: number;
    date: Date;
    paymentMethod: string;
    customerId?: string;
    itemNames?: string[];
    saleItems?: {
        name: string;
        quantity: number;
        price: number;
    }[];
    deleted_at?: string;
}

export interface StoreSettings {
    name: string;
    phone: string;
    address: string;
    email: string;
    taxId: string;
    currency: string;
    timezone: string;
    dateFormat: string;
    language: string;
    lowStockAlerts: boolean;
    dailySummary: boolean;
    orderNotifications: boolean;
    creditReminders: boolean;
}

export interface Customer {
    id: string;
    name: string;
    phone: string;
    email: string;
    address: string;
    credit: number;
    totalPurchases: number;
}

export interface Supplier {
    id: string;
    name: string;
    contact: string;
    phone: string;
    email: string;
    address: string;
    products: number;
    lastOrder: string;
}

export interface Expense {
    id: string;
    description: string;
    category: string;
    amount: number;
    date: Date;
}

export interface Purchase {
    id: string;
    supplier: string;
    date: Date;
    items: number;
    total: number;
    status: string;
}

export interface Activity {
    id: string;
    type: "sale" | "product_add" | "stock_low" | "other" | "customer_add" | "supplier_add" | "expense_add" | "purchase_add";
    message: string;
    timestamp: Date;
}

interface ProductContextType {
    products: Product[];
    sales: Sale[];
    customers: Customer[];
    suppliers: Supplier[];
    expenses: Expense[];
    purchases: Purchase[];
    activities: Activity[];
    loading: boolean;
    settings: StoreSettings;
    addProduct: (product: Omit<Product, "id">) => Promise<void>;
    deleteProduct: (id: string) => Promise<void>;
    updateProduct: (product: Product) => Promise<void>;
    addSale: (sale: Omit<Sale, "id" | "date">, items: any[]) => Promise<void>;
    addCustomer: (customer: Omit<Customer, "id">) => Promise<void>;
    updateCustomer: (customer: Customer) => Promise<void>;
    deleteCustomer: (id: string) => Promise<void>;
    addSupplier: (supplier: Omit<Supplier, "id">) => Promise<void>;
    updateSupplier: (supplier: Supplier) => Promise<void>;
    deleteSupplier: (id: string) => Promise<void>;
    addExpense: (expense: Omit<Expense, "id" | "date">) => Promise<void>;
    updateExpense: (expense: Expense) => Promise<void>;
    deleteExpense: (id: string) => Promise<void>;
    addPurchase: (purchase: any, items: any[]) => Promise<void>;
    addActivity: (activity: Omit<Activity, "id" | "timestamp">) => Promise<void>;
    updateSettings: (newSettings: Partial<StoreSettings>) => Promise<void>;
    clearData: (table: 'sales' | 'products' | 'customers' | 'expenses' | 'purchases') => Promise<void>;
    resetSystem: () => Promise<void>;
    restoreItem: (table: 'sales' | 'products' | 'customers' | 'expenses' | 'purchases', id: string) => Promise<void>;
    fetchDeletedItems: (table: 'sales' | 'products' | 'customers' | 'expenses' | 'purchases') => Promise<any[]>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider = ({ children }: { children: React.ReactNode }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [sales, setSales] = useState<Sale[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState<StoreSettings>({
        name: "Fartun Retail Hub",
        phone: "+252 61 XXX XXXX",
        address: "Main Street, Mogadishu",
        email: "info@mamomulki.com",
        taxId: "TIN-123456789",
        currency: "USD ($)",
        timezone: "East Africa Time (EAT)",
        dateFormat: "DD/MM/YYYY",
        language: "English",
        lowStockAlerts: true,
        dailySummary: true,
        orderNotifications: false,
        creditReminders: true,
    });
    const { user } = useAuth();

    const fetchProducts = async () => {
        try {
            let { data, error } = await (supabase
                .from("products")
                .select("*, categories(name)")
                .is('deleted_at', null) as any);

            // Fallback if column is missing
            if (error && (error.message.includes("deleted_at") || error.message.includes("column"))) {
                console.warn("Schema missing 'deleted_at'. Falling back to normal fetch.");
                const fallback = await supabase
                    .from("products")
                    .select("*, categories(name)");
                data = fallback.data;
                error = fallback.error;
            }

            if (error) throw error;

            if (data) {
                const mappedProducts: Product[] = data.map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    sku: p.sku || "",
                    category: p.categories?.name || "Uncategorized",
                    price: Number(p.selling_price),
                    cost: Number(p.purchase_price),
                    stock: Number(p.stock_quantity),
                    unit: p.unit_type,
                    status: Number(p.stock_quantity) > 0 ? "active" : "out_of_stock",
                }));
                setProducts(mappedProducts);
            }
        } catch (error: any) {
            console.error("Error fetching products:", error.message);
        }
    };

    const fetchSales = async () => {
        try {
            let { data, error } = await (supabase
                .from("sales")
                .select(`
                    *,
                    customers(name),
                    sale_items(
                        quantity,
                        unit_price,
                        products(name)
                    )
                `)
                .is('deleted_at', null) as any)
                .order('created_at', { ascending: false });

            // Fallback if column is missing
            if (error && (error.message.includes("deleted_at") || error.message.includes("column"))) {
                const fallback = await supabase
                    .from("sales")
                    .select(`
                        *,
                        customers(name),
                        sale_items(
                            quantity,
                            unit_price,
                            products(name)
                        )
                    `)
                    .order('created_at', { ascending: false });
                data = fallback.data;
                error = fallback.error;
            }

            if (error) throw error;

            if (data) {
                const mappedSales: Sale[] = data.map((s: any) => ({
                    id: s.id,
                    customer: s.customers?.name || "Guest Customer",
                    items: s.sale_items?.length || 0,
                    total: Number(s.total_amount),
                    date: new Date(s.created_at),
                    paymentMethod: s.payment_method,
                    itemNames: s.sale_items?.map((si: any) => si.products?.name).filter(Boolean) || [],
                    saleItems: s.sale_items?.map((si: any) => ({
                        name: si.products?.name || "Unknown Product",
                        quantity: Number(si.quantity),
                        price: Number(si.unit_price),
                    })) || [],
                }));
                setSales(mappedSales);
            }
        } catch (error: any) {
            console.error("Error fetching sales:", error.message);
        }
    };

    const fetchCustomers = async () => {
        try {
            let { data, error } = await (supabase.from("customers").select("*").is('deleted_at', null) as any);

            // Fallback if column is missing
            if (error && (error.message.includes("deleted_at") || error.message.includes("column"))) {
                const fallback = await supabase.from("customers").select("*");
                data = fallback.data;
                error = fallback.error;
            }

            if (error) throw error;
            if (data) {
                setCustomers(data.map((c: any) => ({
                    id: c.id,
                    name: c.name,
                    phone: c.phone || "",
                    email: c.email || "",
                    address: c.address || "",
                    credit: Number(c.credit_balance),
                    totalPurchases: 0, // Would need mapping
                })));
            }
        } catch (error: any) {
            console.error("Error fetching customers:", error.message);
        }
    };

    const fetchSuppliers = async () => {
        try {
            const { data, error } = await supabase.from("suppliers").select("*");
            if (error) throw error;
            if (data) {
                setSuppliers(data.map((s: any) => ({
                    id: s.id,
                    name: s.name,
                    contact: "", // DB doesn't have contact person?
                    phone: s.phone || "",
                    email: s.email || "",
                    address: s.address || "",
                    products: 0,
                    lastOrder: "Never",
                })));
            }
        } catch (error: any) {
            console.error("Error fetching suppliers:", error.message);
        }
    };

    const fetchExpenses = async () => {
        try {
            const { data, error } = await supabase.from("expenses").select("*");
            if (error) throw error;
            if (data) {
                setExpenses(data.map((e: any) => ({
                    id: e.id,
                    description: e.description || "",
                    category: e.category,
                    amount: Number(e.amount),
                    date: new Date(e.created_at),
                })));
            }
        } catch (error: any) {
            console.error("Error fetching expenses:", error.message);
        }
    };

    const fetchPurchases = async () => {
        try {
            const { data, error } = await supabase
                .from("purchases")
                .select(`
                    *,
                    suppliers(name),
                    purchase_items(count)
                `);
            if (error) throw error;
            if (data) {
                setPurchases(data.map((p: any) => ({
                    id: p.id,
                    supplier: p.suppliers?.name || "Unknown",
                    date: new Date(p.created_at),
                    items: p.purchase_items?.[0]?.count || 0,
                    total: Number(p.total_amount),
                    status: p.status,
                })));
            }
        } catch (error: any) {
            console.error("Error fetching purchases:", error.message);
        }
    };

    useEffect(() => {
        if (user) {
            setLoading(true);
            Promise.all([
                fetchProducts(),
                fetchSales(),
                fetchCustomers(),
                fetchSuppliers(),
                fetchExpenses(),
                fetchPurchases(),
                fetchSettings()
            ]).finally(() => setLoading(false));

            // Clean up old deleted items
            cleanupOldDeletedItems();
        }
    }, [user]);

    const fetchSettings = async () => {
        if (!user) return;
        try {
            const { data, error } = await (supabase.from("settings" as any) as any)
                .select("*")
                .eq("user_id", user.id)
                .maybeSingle();

            if (error) throw error;

            if (data) {
                const s = data as any;
                setSettings({
                    name: s.store_name || "Fartun Retail Hub",
                    phone: s.store_phone || "",
                    address: s.store_address || "",
                    email: s.store_email || "",
                    taxId: s.tax_id || "",
                    currency: s.currency || "USD ($)",
                    timezone: s.timezone || "East Africa Time (EAT)",
                    dateFormat: s.date_format || "DD/MM/YYYY",
                    language: s.language || "English",
                    lowStockAlerts: s.low_stock_alerts ?? true,
                    dailySummary: s.daily_summary ?? true,
                    orderNotifications: s.order_notifications ?? false,
                    creditReminders: s.credit_reminders ?? true,
                });
            }
        } catch (error: any) {
            console.error("Error fetching settings:", error.message);
        }
    };

    const updateSettings = async (newSettings: Partial<StoreSettings>) => {
        if (!user) return;
        try {
            const updated = { ...settings, ...newSettings };
            setSettings(updated);

            const { error } = await (supabase.from("settings" as any) as any)
                .upsert({
                    user_id: user.id,
                    store_name: updated.name,
                    store_phone: updated.phone,
                    store_address: updated.address,
                    store_email: updated.email,
                    tax_id: updated.taxId,
                    currency: updated.currency,
                    timezone: updated.timezone,
                    date_format: updated.dateFormat,
                    language: updated.language,
                    low_stock_alerts: updated.lowStockAlerts,
                    daily_summary: updated.dailySummary,
                    order_notifications: updated.orderNotifications,
                    credit_reminders: updated.creditReminders,
                });

            if (error) throw error;
            toast.success("Settings saved successfully");
        } catch (error: any) {
            toast.error(`Error saving settings: ${error.message}`);
        }
    };

    const cleanupOldDeletedItems = async () => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const isoDate = thirtyDaysAgo.toISOString();

        await Promise.all([
            supabase.from("sales").delete().not("deleted_at", "is", null).lt("deleted_at", isoDate),
            supabase.from("products").delete().not("deleted_at", "is", null).lt("deleted_at", isoDate),
            supabase.from("customers").delete().not("deleted_at", "is", null).lt("deleted_at", isoDate),
            supabase.from("expenses").delete().not("deleted_at", "is", null).lt("deleted_at", isoDate),
            supabase.from("purchases").delete().not("deleted_at", "is", null).lt("deleted_at", isoDate),
        ]);
    };

    const resetSystem = async () => {
        if (!user) return;
        try {
            // Delete in order to avoid FK issues
            // 1. Child records
            await supabase.from("sale_items").delete().neq("id", "00000000-0000-0000-0000-000000000000");
            await supabase.from("purchase_items").delete().neq("id", "00000000-0000-0000-0000-000000000000");

            // 2. Parent records
            await supabase.from("sales").delete().neq("id", "00000000-0000-0000-0000-000000000000");
            await supabase.from("purchases").delete().neq("id", "00000000-0000-0000-0000-000000000000");
            await supabase.from("products").delete().neq("id", "00000000-0000-0000-0000-000000000000");
            await supabase.from("customers").delete().neq("id", "00000000-0000-0000-0000-000000000000");
            await supabase.from("suppliers").delete().neq("id", "00000000-0000-0000-0000-000000000000");
            await supabase.from("expenses").delete().neq("id", "00000000-0000-0000-0000-000000000000");

            toast.success("System has been reset successfully.");

            // Refresh all state
            await Promise.all([
                fetchProducts(),
                fetchSales(),
                fetchCustomers(),
                fetchSuppliers(),
                fetchExpenses(),
                fetchPurchases()
            ]);
        } catch (error: any) {
            toast.error(`Error resetting system: ${error.message}`);
        }
    };

    const clearData = async (table: 'sales' | 'products' | 'customers' | 'expenses' | 'purchases') => {
        if (!user) return;
        try {
            const now = new Date().toISOString();
            const { error } = await (supabase.from(table as any) as any)
                .update({ deleted_at: now })
                .is('deleted_at', null);

            if (error) throw error;

            toast.success(`${table.charAt(0).toUpperCase() + table.slice(1)} cleared (Recovery available for 30 days)`);

            // Refresh state
            if (table === 'sales') fetchSales();
            if (table === 'products') fetchProducts();
            if (table === 'customers') fetchCustomers();
            if (table === 'expenses') fetchExpenses();
            if (table === 'purchases') fetchPurchases();
        } catch (error: any) {
            toast.error(`Error clearing data: ${error.message}`);
        }
    };

    const fetchDeletedItems = async (table: 'sales' | 'products' | 'customers' | 'expenses' | 'purchases') => {
        try {
            const { data, error } = await supabase
                .from(table)
                .select("*")
                .not("deleted_at", "is", null)
                .order("deleted_at", { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error: any) {
            console.error(`Error fetching deleted items from ${table}:`, error.message);
            return [];
        }
    };

    const restoreItem = async (table: 'sales' | 'products' | 'customers' | 'expenses' | 'purchases', id: string) => {
        try {
            const { error } = await (supabase.from(table as any) as any)
                .update({ deleted_at: null })
                .eq("id", id);

            if (error) throw error;

            toast.success("Item restored successfully");
            if (table === 'sales') fetchSales();
            if (table === 'products') fetchProducts();
            if (table === 'customers') fetchCustomers();
            if (table === 'expenses') fetchExpenses();
            if (table === 'purchases') fetchPurchases();
        } catch (error: any) {
            toast.error(`Error restoring item: ${error.message}`);
        }
    };

    const addActivity = async (activity: Omit<Activity, "id" | "timestamp">) => {
        // Activities could be stored in a table too, but for now we'll keep them local or just log
        const newActivity: Activity = {
            id: Math.random().toString(36).substr(2, 9),
            ...activity,
            timestamp: new Date(),
        };
        setActivities((prev) => [newActivity, ...prev]);
    };

    const addProduct = async (product: Omit<Product, "id">) => {
        try {
            // First, find or create category
            let categoryId = null;
            if (product.category) {
                const { data: catData, error: catError } = await supabase
                    .from("categories")
                    .select("id")
                    .eq("name", product.category)
                    .maybeSingle();

                if (catError) throw catError;

                if (catData) {
                    categoryId = catData.id;
                } else {
                    const { data: newCat, error: newCatError } = await supabase
                        .from("categories")
                        .insert({ name: product.category })
                        .select("id")
                        .single();
                    if (newCatError) throw newCatError;
                    categoryId = newCat.id;
                }
            }

            const { data, error } = await supabase
                .from("products")
                .insert({
                    name: product.name,
                    sku: product.sku,
                    category_id: categoryId,
                    selling_price: product.price,
                    purchase_price: product.cost,
                    stock_quantity: product.stock,
                    unit_type: product.unit,
                })
                .select()
                .single();

            if (error) throw error;

            await fetchProducts();
            addActivity({
                type: "product_add",
                message: `Product added: ${product.name}`,
            });
            toast.success("Product added successfully");
        } catch (error: any) {
            toast.error(`Error adding product: ${error.message}`);
        }
    };

    const deleteProduct = async (id: string) => {
        try {
            const { error } = await (supabase.from("products") as any)
                .update({ deleted_at: new Date().toISOString() })
                .eq("id", id);

            if (error) {
                // If update fails (e.g. column doesn't exist), try hard delete as fallback
                // though the user's error confirms the constraint exists, so soft delete is better.
                console.error("Soft delete failed, attempting hard delete:", error.message);
                const { error: hardDeleteError } = await supabase.from("products").delete().eq("id", id);
                if (hardDeleteError) throw hardDeleteError;
            }

            setProducts((prev) => prev.filter((p) => p.id !== id));
            toast.success("Product deleted (Soft delete)");
        } catch (error: any) {
            console.error("Deletion error:", error);
            if (error.message?.includes("violates foreign key constraint")) {
                toast.error("Ma tirtiri kartid alaab horay loo iibiyay! Fadlan marka hore SQL Editor ka ku dar 'deleted_at' (Soft Delete).", {
                    duration: 6000,
                });
            } else {
                toast.error(`Error deleting product: ${error.message}`);
            }
        }
    };

    const updateProduct = async (updatedProduct: Product) => {
        try {
            // First, find or create category if it changed
            let categoryId = null;
            if (updatedProduct.category) {
                const { data: catData, error: catError } = await supabase
                    .from("categories")
                    .select("id")
                    .eq("name", updatedProduct.category)
                    .maybeSingle();

                if (catError) throw catError;

                if (catData) {
                    categoryId = catData.id;
                } else {
                    const { data: newCat, error: newCatError } = await supabase
                        .from("categories")
                        .insert({ name: updatedProduct.category })
                        .select("id")
                        .single();
                    if (newCatError) throw newCatError;
                    categoryId = newCat.id;
                }
            }

            const { error } = await supabase
                .from("products")
                .update({
                    name: updatedProduct.name,
                    sku: updatedProduct.sku,
                    category_id: categoryId,
                    selling_price: updatedProduct.price,
                    purchase_price: updatedProduct.cost,
                    stock_quantity: updatedProduct.stock,
                    unit_type: updatedProduct.unit,
                })
                .eq("id", updatedProduct.id);

            if (error) throw error;
            await fetchProducts();

            addActivity({
                type: "other",
                message: `Product updated: ${updatedProduct.name}`,
            });

            toast.success("Product updated successfully");
        } catch (error: any) {
            toast.error(`Error updating product: ${error.message}`);
        }
    };

    const addSale = async (sale: Omit<Sale, "id" | "date">, items: any[]) => {
        try {
            if (!user) throw new Error("User must be logged in to make a sale");

            const { data: saleData, error: saleError } = await supabase
                .from("sales")
                .insert({
                    total_amount: sale.total,
                    payment_method: sale.paymentMethod,
                    cashier_id: user.id,
                    customer_id: sale.customerId,
                })
                .select()
                .single();

            if (saleError) throw saleError;

            // Add sale items and update stock
            for (const item of items) {
                const { error: itemError } = await supabase.from("sale_items").insert({
                    sale_id: saleData.id,
                    product_id: item.id,
                    quantity: item.quantity,
                    unit_price: item.price,
                    total: item.price * item.quantity,
                });

                if (itemError) throw itemError;

                // Update stock manual 
                const product = products.find(p => p.id === item.id);
                if (product) {
                    await supabase
                        .from("products")
                        .update({ stock_quantity: product.stock - item.quantity })
                        .eq("id", item.id);
                }
            }

            await fetchProducts();
            await fetchSales();
            addActivity({
                type: "sale",
                message: `New sale: ${sale.items} items for $${sale.total.toFixed(2)}`,
            });
        } catch (error: any) {
            toast.error(`Error processing sale: ${error.message}`);
            throw error;
        }
    };

    const addCustomer = async (customer: Omit<Customer, "id">) => {
        try {
            const { error } = await supabase.from("customers").insert({
                name: customer.name,
                phone: customer.phone,
                email: customer.email,
                address: customer.address,
                credit_balance: customer.credit,
            });
            if (error) throw error;
            await fetchCustomers();
            toast.success("Customer added");
        } catch (error: any) {
            toast.error(`Error adding customer: ${error.message}`);
        }
    };

    const updateCustomer = async (customer: Customer) => {
        try {
            const { error } = await supabase.from("customers").update({
                name: customer.name,
                phone: customer.phone,
                email: customer.email,
                address: customer.address,
                credit_balance: customer.credit,
            }).eq("id", customer.id);

            if (error) throw error;
            await fetchCustomers();
            toast.success("Customer updated");
        } catch (error: any) {
            toast.error(`Error updating customer: ${error.message}`);
        }
    };

    const deleteCustomer = async (id: string) => {
        try {
            const { error } = await (supabase.from("customers") as any)
                .update({ deleted_at: new Date().toISOString() })
                .eq("id", id);

            if (error) {
                const { error: hardDeleteError } = await (supabase.from("customers") as any).delete().eq("id", id);
                if (hardDeleteError) throw hardDeleteError;
            }

            setCustomers((prev) => prev.filter((c) => c.id !== id));
            toast.success("Customer deleted");
        } catch (error: any) {
            toast.error(`Error deleting customer: ${error.message}`);
        }
    };

    const addSupplier = async (supplier: Omit<Supplier, "id">) => {
        try {
            const { error } = await supabase.from("suppliers").insert({
                name: supplier.name,
                phone: supplier.phone,
                email: supplier.email,
                address: supplier.address,
            });
            if (error) throw error;
            await fetchSuppliers();
            toast.success("Supplier added");
        } catch (error: any) {
            toast.error(`Error adding supplier: ${error.message}`);
        }
    };

    const updateSupplier = async (supplier: Supplier) => {
        try {
            const { error } = await supabase.from("suppliers").update({
                name: supplier.name,
                phone: supplier.phone,
                email: supplier.email,
                address: supplier.address,
            }).eq("id", supplier.id);

            if (error) throw error;
            await fetchSuppliers();
            toast.success("Supplier updated");
        } catch (error: any) {
            toast.error(`Error updating supplier: ${error.message}`);
        }
    };

    const deleteSupplier = async (id: string) => {
        try {
            const { error } = await (supabase.from("suppliers") as any)
                .update({ deleted_at: new Date().toISOString() })
                .eq("id", id);

            if (error) {
                const { error: hardDeleteError } = await (supabase.from("suppliers") as any).delete().eq("id", id);
                if (hardDeleteError) throw hardDeleteError;
            }

            setSuppliers((prev) => prev.filter((s) => s.id !== id));
            toast.success("Supplier deleted");
        } catch (error: any) {
            toast.error(`Error deleting supplier: ${error.message}`);
        }
    };

    const addExpense = async (expense: Omit<Expense, "id" | "date">) => {
        try {
            const { error } = await supabase.from("expenses").insert({
                description: expense.description,
                amount: expense.amount,
                category: expense.category,
            });
            if (error) throw error;
            await fetchExpenses();
            toast.success("Expense recorded");
        } catch (error: any) {
            toast.error(`Error recording expense: ${error.message}`);
        }
    };

    const updateExpense = async (expense: Expense) => {
        try {
            const { error } = await supabase.from("expenses").update({
                description: expense.description,
                amount: expense.amount,
                category: expense.category,
            }).eq("id", expense.id);

            if (error) throw error;
            await fetchExpenses();
            toast.success("Expense updated");
        } catch (error: any) {
            toast.error(`Error updating expense: ${error.message}`);
        }
    };

    const deleteExpense = async (id: string) => {
        try {
            const { error } = await (supabase.from("expenses") as any)
                .update({ deleted_at: new Date().toISOString() })
                .eq("id", id);

            if (error) {
                const { error: hardDeleteError } = await (supabase.from("expenses") as any).delete().eq("id", id);
                if (hardDeleteError) throw hardDeleteError;
            }

            setExpenses((prev) => prev.filter((e) => e.id !== id));
            toast.success("Expense deleted");
        } catch (error: any) {
            toast.error(`Error deleting expense: ${error.message}`);
        }
    };

    const addPurchase = async (purchase: any, items: any[]) => {
        try {
            const { data: purchaseData, error: purchaseError } = await supabase
                .from("purchases")
                .insert({
                    supplier_id: purchase.supplierId,
                    total_amount: purchase.total,
                    status: purchase.status || "completed",
                })
                .select()
                .single();

            if (purchaseError) throw purchaseError;

            for (const item of items) {
                const { error: itemError } = await supabase.from("purchase_items").insert({
                    purchase_id: purchaseData.id,
                    product_id: item.productId,
                    quantity: item.quantity,
                    unit_price: item.price,
                    total: item.price * item.quantity,
                });
                if (itemError) throw itemError;

                // Update stock (increment)
                const product = products.find(p => p.id === item.productId);
                if (product) {
                    await supabase
                        .from("products")
                        .update({ stock_quantity: product.stock + item.quantity })
                        .eq("id", item.productId);
                }
            }

            await fetchProducts();
            await fetchPurchases();
            toast.success("Purchase order created");
        } catch (error: any) {
            toast.error(`Error recording purchase: ${error.message}`);
        }
    };

    return (
        <ProductContext.Provider
            value={{
                products,
                sales,
                customers,
                suppliers,
                expenses,
                purchases,
                activities,
                loading,
                settings,
                addProduct,
                deleteProduct,
                updateProduct,
                addSale,
                addCustomer,
                updateCustomer,
                deleteCustomer,
                addSupplier,
                updateSupplier,
                deleteSupplier,
                addExpense,
                updateExpense,
                deleteExpense,
                addPurchase,
                addActivity,
                updateSettings,
                clearData,
                resetSystem,
                restoreItem,
                fetchDeletedItems,
            }}
        >
            {children}
        </ProductContext.Provider>
    );
};

export const useProductContext = () => {
    const context = useContext(ProductContext);
    if (context === undefined) {
        throw new Error("useProductContext must be used within a ProductProvider");
    }
    return context;
};
