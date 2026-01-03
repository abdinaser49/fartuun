import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Store,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Save,
  Trash2,
  RefreshCcw,
  Database,
  Search,
  Receipt,
  ShoppingBag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useProductContext } from "@/context/ProductContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const Settings = () => {
  const { settings, updateSettings, clearData, resetSystem, fetchDeletedItems, restoreItem } = useProductContext();
  const [formData, setFormData] = useState({ ...settings });
  const [activeTab, setActiveTab] = useState("store");
  const [deletedItems, setDeletedItems] = useState<any[]>([]);
  const [trashTable, setTrashTable] = useState<'sales' | 'products' | 'customers' | 'expenses' | 'purchases'>('sales');

  const handleSave = async () => {
    await updateSettings(formData);
  };

  const loadTrash = async (table: any) => {
    setTrashTable(table);
    const items = await fetchDeletedItems(table);
    setDeletedItems(items);
  };

  return (
    <MainLayout>
      <div className="mb-8 opacity-0 animate-fade-in text-center md:text-left">
        <h1 className="text-3xl font-display font-bold text-foreground">Control Center</h1>
        <p className="text-muted-foreground mt-1">Configure your professional retail environment</p>
      </div>

      <Tabs defaultValue="store" onValueChange={setActiveTab} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="stat-card p-2 lg:col-span-1 h-fit sticky top-24">
            <TabsList className="flex flex-col h-auto bg-transparent gap-1">
              <TabsTrigger value="store" className="w-full justify-start gap-3 px-4 py-3 data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                <Store className="w-5 h-5" /> Store Info
              </TabsTrigger>
              <TabsTrigger value="data" className="w-full justify-start gap-3 px-4 py-3 data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                <Database className="w-5 h-5" /> Data Management
              </TabsTrigger>
              <TabsTrigger value="notifications" className="w-full justify-start gap-3 px-4 py-3 data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                <Bell className="w-5 h-5" /> Notifications
              </TabsTrigger>
              <TabsTrigger value="regional" className="w-full justify-start gap-3 px-4 py-3 data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
                <Globe className="w-5 h-5" /> Regional
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3 space-y-6">
            <TabsContent value="store" className="mt-0">
              <div className="stat-card">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Store className="w-5 h-5 text-primary" /> Store Information
                </h2>
                <div className="grid gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-1.5">
                      <Label>Store Name</Label>
                      <Input
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Fartun Retail Hub"
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label>Phone Number</Label>
                      <Input
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+252 ..."
                      />
                    </div>
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Retail Address</Label>
                    <Input
                      value={formData.address}
                      onChange={e => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Main Street, Mogadishu"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-1.5">
                      <Label>Business Email</Label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label>Tax/Registration ID</Label>
                      <Input
                        value={formData.taxId}
                        onChange={e => setFormData({ ...formData, taxId: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="data" className="mt-0 space-y-6">
              <div className="stat-card border-l-4 border-l-destructive">
                <h2 className="text-xl font-bold mb-2 flex items-center gap-2 text-destructive">
                  <Trash2 className="w-5 h-5" /> Danger Zone
                </h2>
                <p className="text-sm text-muted-foreground mb-6">Cleared data can be recovered within 30 days. After that, it is permanently deleted.</p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="h-24 flex flex-col gap-2 hover:bg-destructive/5 hover:text-destructive border-dashed">
                        <Receipt className="w-6 h-6" /> Clear Sales
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Move all sales to trash?</AlertDialogTitle>
                        <AlertDialogDescription>This will hide all sales from your history. You can restore them within 30 days from the recovery tab.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => clearData('sales')} className="bg-destructive hover:bg-destructive/90 text-white">Clear All Sales</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="h-24 flex flex-col gap-2 hover:bg-destructive/5 hover:text-destructive border-dashed">
                        <ShoppingBag className="w-6 h-6" /> Clear Products
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Move all products to trash?</AlertDialogTitle>
                        <AlertDialogDescription>All active products will be hidden. You can restore them within 30 days.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => clearData('products')} className="bg-destructive hover:bg-destructive/90 text-white">Clear All Products</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="h-24 flex flex-col gap-2 hover:bg-destructive/5 hover:text-destructive border-dashed">
                        <User className="w-6 h-6" /> Clear Customers
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Move all customers to trash?</AlertDialogTitle>
                        <AlertDialogDescription>All customer profiles will be hidden. You can restore them within 30 days.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => clearData('customers')} className="bg-destructive hover:bg-destructive/90 text-white">Clear All Customers</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                <div className="mt-6 pt-6 border-t border-destructive/20">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full gap-2 shadow-glow-destructive font-bold uppercase tracking-wider">
                        <Trash2 className="w-5 h-5" />
                        Full System Reset (Delete All Data)
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="border-destructive">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-destructive flex items-center gap-2">
                          <Trash2 className="w-5 h-5" />
                          ARE YOU ABSOLUTELY SURE?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-foreground">
                          This will **PERMANENTLY DELETE** all sales, products, customers, suppliers, and expenses. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => resetSystem()} className="bg-destructive hover:bg-destructive/90 text-white font-bold">
                          YES, DELETE ALL SYSTEM DATA
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              <div className="stat-card border-l-4 border-l-primary">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <RefreshCcw className="w-5 h-5 text-primary" /> Data Recovery (Trash)
                </h2>
                <div className="flex gap-2 mb-6 flex-wrap">
                  {(['sales', 'products', 'customers', 'expenses', 'purchases'] as const).map((table) => (
                    <Button
                      key={table}
                      variant={trashTable === table ? "default" : "secondary"}
                      size="sm"
                      onClick={() => loadTrash(table)}
                      className="capitalize"
                    >
                      {table}
                    </Button>
                  ))}
                </div>

                <div className="rounded-lg border border-border">
                  <div className="p-4 bg-secondary/30 text-xs font-bold grid grid-cols-4 border-b border-border">
                    <span className="col-span-2">NAME / ID</span>
                    <span>DELETED ON</span>
                    <span className="text-right">ACTION</span>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto divide-y divide-border">
                    {deletedItems.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground text-sm">
                        No items found in {trashTable} trash.
                      </div>
                    ) : (
                      deletedItems.map((item) => (
                        <div key={item.id} className="p-4 grid grid-cols-4 items-center text-sm">
                          <span className="col-span-2 font-mono text-xs truncate mr-4">
                            {item.name || item.id}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            {new Date(item.deleted_at).toLocaleDateString()}
                          </span>
                          <div className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-primary hover:text-primary hover:bg-primary/10 h-8"
                              onClick={() => restoreItem(trashTable, item.id).then(() => loadTrash(trashTable))}
                            >
                              <RefreshCcw className="w-3.5 h-3.5 mr-1" /> Restore
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="mt-0">
              <div className="stat-card">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" /> Notifications
                </h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                    <div>
                      <p className="font-bold">Low Stock Alerts</p>
                      <p className="text-xs text-muted-foreground">Notify when products fall below threshold</p>
                    </div>
                    <Switch
                      checked={formData.lowStockAlerts}
                      onCheckedChange={checked => setFormData({ ...formData, lowStockAlerts: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                    <div>
                      <p className="font-bold">Daily Sales Summary</p>
                      <p className="text-xs text-muted-foreground">Automated EOD sales report via email</p>
                    </div>
                    <Switch
                      checked={formData.dailySummary}
                      onCheckedChange={checked => setFormData({ ...formData, dailySummary: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                    <div>
                      <p className="font-bold">New Order Sounds</p>
                      <p className="text-xs text-muted-foreground">Audio alert for every transaction</p>
                    </div>
                    <Switch
                      checked={formData.orderNotifications}
                      onCheckedChange={checked => setFormData({ ...formData, orderNotifications: checked })}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="regional" className="mt-0">
              <div className="stat-card">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" /> Region & Currency
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="grid gap-1.5">
                    <Label>Primary Currency</Label>
                    <Input
                      value={formData.currency}
                      onChange={e => setFormData({ ...formData, currency: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Local Timezone</Label>
                    <Input
                      value={formData.timezone}
                      onChange={e => setFormData({ ...formData, timezone: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Date/Time Format</Label>
                    <Input
                      value={formData.dateFormat}
                      onChange={e => setFormData({ ...formData, dateFormat: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Interface Language</Label>
                    <Input
                      value={formData.language}
                      onChange={e => setFormData({ ...formData, language: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Global Save Action */}
            {activeTab !== 'data' && (
              <div className="flex justify-end pt-4">
                <Button size="lg" className="w-full sm:w-auto gap-2 shadow-glow" onClick={handleSave}>
                  <Save className="w-4 h-4" />
                  Apply All Changes
                </Button>
              </div>
            )}
          </div>
        </div>
      </Tabs>
    </MainLayout>
  );
};

export default Settings;

