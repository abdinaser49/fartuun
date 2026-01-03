import { useState, useRef } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import {
    Search,
    Receipt,
    Calendar,
    User,
    CreditCard,
    Banknote,
    Smartphone,
    ChevronRight,
    Filter,
    Printer,
    Download,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useProductContext } from "@/context/ProductContext";

const Sales = () => {
    const { sales, loading, settings } = useProductContext();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedSale, setSelectedSale] = useState<any>(null);

    const handlePrint = () => {
        window.print();
    };

    const handleExportPDF = async () => {
        if (!selectedSale) return;

        const receiptElement = document.getElementById("printable-receipt");
        if (!receiptElement) {
            toast.error("Receipt element not found");
            return;
        }

        try {
            toast.loading("Generating High-Quality PDF...", { id: "pdf-gen" });

            // Render the receipt temporarily to measure it
            const canvas = await html2canvas(receiptElement, {
                scale: 3, // Higher scale for better clarity
                logging: false,
                useCORS: true,
                backgroundColor: "#ffffff",
                windowWidth: 400, // Fixed width for consistent rendering
                onclone: (doc) => {
                    const clonedEl = doc.getElementById("printable-receipt");
                    if (clonedEl) {
                        clonedEl.style.display = "block";
                        clonedEl.style.position = "static";
                        clonedEl.style.width = "80mm";
                    }
                }
            });

            const imgData = canvas.toDataURL("image/png");

            // Calculate height in mm (80mm is our target width)
            const imgWidth = 80;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: [imgWidth, imgHeight] // Dynamic height based on content
            });

            pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight, undefined, 'FAST');
            pdf.save(`${settings.name.replace(/\s+/g, '-').toUpperCase()}-${selectedSale.id.split("-")[0].toUpperCase()}.pdf`);

            toast.success("Receipt Saved Successfully!", { id: "pdf-gen" });
        } catch (error) {
            console.error("PDF Generation error:", error);
            toast.error("Failed to generate PDF", { id: "pdf-gen" });
        }
    };

    const filteredSales = sales.filter((sale) =>
        sale.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sale.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sale.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sale.itemNames?.some(name => name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const getPaymentIcon = (method: string) => {
        switch (method.toUpperCase()) {
            case "CASH":
                return <Banknote className="w-4 h-4 text-green-500" />;
            case "CARD":
                return <CreditCard className="w-4 h-4 text-blue-500" />;
            default:
                return <Smartphone className="w-4 h-4 text-primary" />;
        }
    };

    return (
        <MainLayout>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 opacity-0 animate-fade-in">
                <div>
                    <h1 className="text-3xl font-display font-bold text-foreground">Sales History</h1>
                    <p className="text-muted-foreground mt-1">View and manage all your completed sales</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="gap-2">
                        <Filter className="w-4 h-4" />
                        Filter
                    </Button>
                </div>
            </div>

            {/* Stats Quick View */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="stat-card opacity-0 animate-slide-up stagger-1">
                    <p className="text-sm font-medium text-muted-foreground">Total Sales Count</p>
                    <p className="text-3xl font-display font-bold text-foreground mt-1">{sales.length}</p>
                </div>
                <div className="stat-card opacity-0 animate-slide-up stagger-2">
                    <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                    <p className="text-3xl font-display font-bold text-primary mt-1">
                        {settings.currency?.split(' ')[1]?.replace(/[()]/g, '') || settings.currency || '$'}{sales.reduce((sum, s) => sum + s.total, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                </div>
                <div className="stat-card opacity-0 animate-slide-up stagger-3">
                    <p className="text-sm font-medium text-muted-foreground">Avg. Sale Value</p>
                    <p className="text-3xl font-display font-bold text-foreground mt-1">
                        {settings.currency?.split(' ')[1]?.replace(/[()]/g, '') || settings.currency || '$'}{sales.length > 0
                            ? (sales.reduce((sum, s) => sum + s.total, 0) / sales.length).toLocaleString(undefined, { minimumFractionDigits: 2 })
                            : "0.00"
                        }
                    </p>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 opacity-0 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by ID, customer, or payment method..."
                        className="pl-10 h-11"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Sales Table */}
            <div className="stat-card p-0 overflow-hidden opacity-0 animate-slide-up stagger-2">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border/50 bg-secondary/30 text-left">
                                <th className="py-4 px-6 font-semibold text-foreground text-sm">Sale ID</th>
                                <th className="py-4 px-6 font-semibold text-foreground text-sm">Customer</th>
                                <th className="py-4 px-6 font-semibold text-foreground text-sm">Date & Time</th>
                                <th className="py-4 px-6 font-semibold text-foreground text-sm">Items</th>
                                <th className="py-4 px-6 font-semibold text-foreground text-sm">Payment Method</th>
                                <th className="py-4 px-6 font-semibold text-foreground text-sm text-right">Total Amount</th>
                                <th className="py-4 px-6"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="py-20 text-center text-muted-foreground">
                                        Loading sales history...
                                    </td>
                                </tr>
                            ) : filteredSales.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-20 text-center text-muted-foreground">
                                        <Receipt className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                        <p className="text-lg font-medium">No sales found</p>
                                        <p className="text-sm">Try adjusting your search or filters</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredSales.map((sale, index) => (
                                    <tr
                                        key={sale.id}
                                        className={cn(
                                            "border-b border-border/30 hover:bg-secondary/30 transition-colors group",
                                            "opacity-0 animate-fade-in"
                                        )}
                                        style={{ animationDelay: `${0.1 + index * 0.05}s` }}
                                    >
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                <Receipt className="w-4 h-4 text-primary" />
                                                <span className="font-mono text-xs text-foreground uppercase truncate w-24" title={sale.id}>
                                                    #{sale.id.split('-')[0]}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <User className="w-4 h-4 text-muted-foreground" />
                                                    <span className="text-foreground font-medium">{sale.customer}</span>
                                                </div>
                                                {sale.itemNames && sale.itemNames.length > 0 && (
                                                    <p className="text-[10px] text-muted-foreground line-clamp-1 pl-6">
                                                        {sale.itemNames.join(", ")}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Calendar className="w-4 h-4" />
                                                <span className="text-sm">
                                                    {new Date(sale.date).toLocaleDateString()} {new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="inline-flex items-center justify-center bg-secondary text-secondary-foreground text-xs font-bold rounded-full w-6 h-6">
                                                {sale.items}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                {getPaymentIcon(sale.paymentMethod)}
                                                <span className="text-sm font-semibold text-foreground uppercase">{sale.paymentMethod}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-right font-bold text-foreground">
                                            {settings.currency?.split(' ')[1]?.replace(/[()]/g, '') || settings.currency || '$'}{sale.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => setSelectedSale(sale)}
                                            >
                                                Details
                                                <ChevronRight className="w-4 h-4 ml-1" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Sale Details Dialog */}
            <Dialog open={!!selectedSale} onOpenChange={() => setSelectedSale(null)}>
                <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
                    <DialogHeader className="p-6 bg-secondary/30 border-b border-border/50">
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <Receipt className="w-5 h-5 text-primary" />
                            Sale Details
                        </DialogTitle>
                    </DialogHeader>

                    {selectedSale && (
                        <div className="p-6">
                            {/* Receipt Header */}
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-semibold">Sale ID</p>
                                    <p className="font-mono text-sm text-foreground uppercase">#{selectedSale.id.split('-')[0]}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-muted-foreground uppercase font-semibold">Date & Time</p>
                                    <p className="text-sm text-foreground">
                                        {new Date(selectedSale.date).toLocaleDateString()} {new Date(selectedSale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 mb-8">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Customer</p>
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-muted-foreground" />
                                        <p className="text-sm font-medium text-foreground">{selectedSale.customer}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Payment Method</p>
                                    <div className="flex items-center gap-2 justify-end">
                                        {getPaymentIcon(selectedSale.paymentMethod)}
                                        <p className="text-sm font-bold text-foreground uppercase">{selectedSale.paymentMethod}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Item Table */}
                            <div className="border-y border-border/50 py-4 mb-6">
                                <p className="text-xs text-muted-foreground uppercase font-semibold mb-3">Order Summary</p>
                                <div className="space-y-3">
                                    {selectedSale.saleItems?.map((item: any, idx: number) => (
                                        <div key={idx} className="flex justify-between items-start text-sm">
                                            <div>
                                                <p className="font-medium text-foreground">{item.name}</p>
                                                <p className="text-[11px] text-muted-foreground">{settings.currency?.split(' ')[1]?.replace(/[()]/g, '') || settings.currency || '$'}{item.price.toFixed(2)} × {item.quantity}</p>
                                            </div>
                                            <p className="font-bold text-foreground">{settings.currency?.split(' ')[1]?.replace(/[()]/g, '') || settings.currency || '$'}{(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Totals */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <p className="text-muted-foreground">Total Items</p>
                                    <p className="text-foreground font-medium">{selectedSale.items}</p>
                                </div>
                                <div className="flex justify-between text-lg font-bold pt-2 border-t border-border/50">
                                    <p className="text-foreground">Total Amount</p>
                                    <p className="text-primary">{settings.currency?.split(' ')[1]?.replace(/[()]/g, '') || settings.currency || '$'}{selectedSale.total.toFixed(2)}</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 mt-8 print:hidden">
                                <Button className="flex-1 gap-2" onClick={handlePrint}>
                                    <Printer className="w-4 h-4" />
                                    Print Receipt
                                </Button>
                                <Button variant="outline" className="gap-2" onClick={handleExportPDF}>
                                    <Download className="w-4 h-4" />
                                    Export PDF
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Hidden Printable Receipt */}
            <div id="printable-receipt" className="hidden print:block bg-white text-black font-sans leading-tight">
                {selectedSale && (
                    <div className="receipt-content p-4 w-[76mm]">
                        <div className="text-center mb-4">
                            <h2 className="text-xl font-black uppercase tracking-tight">{settings.name}</h2>
                            <p className="text-[12px] font-medium">{settings.address}</p>
                            <p className="text-[12px] font-medium">Tel: {settings.phone}</p>
                            <div className="my-2 border-b border-black"></div>
                            <h3 className="text-sm font-bold bg-black text-white py-1 uppercase tracking-widest">Sale Receipt</h3>
                        </div>

                        <div className="text-[11px] space-y-1 mb-4 border-b border-black pb-2">
                            <div className="flex justify-between">
                                <span className="font-bold">RECEIPT #:</span>
                                <span className="font-mono uppercase">{selectedSale.id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-bold">DATE:</span>
                                <span>{new Date(selectedSale.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-bold">TIME:</span>
                                <span>{new Date(selectedSale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-bold">CUSTOMER:</span>
                                <span className="uppercase">{selectedSale.customer}</span>
                            </div>
                        </div>

                        <div className="text-[11px] mb-4">
                            <div className="grid grid-cols-6 font-bold border-b-2 border-black pb-1 mb-2">
                                <span className="col-span-3">DESCRIPTION</span>
                                <span className="text-center">QTY</span>
                                <span className="text-right col-span-2">TOTAL</span>
                            </div>
                            <div className="space-y-3">
                                {selectedSale.saleItems?.map((item: any, idx: number) => (
                                    <div key={idx} className="grid grid-cols-6 items-start">
                                        <div className="col-span-3">
                                            <p className="font-bold uppercase leading-none mb-1">{item.name}</p>
                                            <p className="text-[9px] text-gray-700">{settings.currency?.split(' ')[1]?.replace(/[()]/g, '') || settings.currency || '$'}{item.price.toFixed(2)} unit</p>
                                        </div>
                                        <span className="text-center font-bold">x{item.quantity}</span>
                                        <span className="text-right col-span-2 font-bold">{settings.currency?.split(' ')[1]?.replace(/[()]/g, '') || settings.currency || '$'}{(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="border-t-2 border-black pt-2 mb-4">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-bold">TOTAL ITEMS:</span>
                                <span className="text-xs font-bold">{selectedSale.items}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-y border-black/20 my-2">
                                <span className="text-sm font-black">GRAND TOTAL:</span>
                                <span className="text-lg font-black">{settings.currency?.split(' ')[1]?.replace(/[()]/g, '') || settings.currency || '$'}{selectedSale.total.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="bg-gray-100 p-2 text-center mb-6">
                            <p className="text-[10px] font-bold uppercase mb-1">Paid via</p>
                            <p className="text-sm font-black uppercase text-primary border border-primary/20 py-1">{selectedSale.paymentMethod}</p>
                        </div>

                        <div className="text-center space-y-2 border-t border-dashed border-black pt-4">
                            <p className="text-xs font-bold uppercase italic">No Exchange, No Refund</p>
                            <p className="text-[10px] uppercase font-bold">Thank you for shopping with us!</p>
                            <div className="flex justify-center mt-2">
                                <div className="border-2 border-black p-1">
                                    <p className="text-[8px] font-black tracking-[0.2em] uppercase">MAMO-RETAIL-SYSTEM</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default Sales;
