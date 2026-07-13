import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { medicines as seedMedicines } from "@/lib/mock/data";
import type { Medicine } from "@/lib/types";
import {
    Plus,
    Pencil,
    Factory,
    PackageMinus,
    Search,
    Loader2,
    Download,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Building2,
    Package,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/pharmacy/manufacturemaster")({
    component: ManufactureMaster,
});

function ManufactureMaster() {
    const [manufacturers, setManufacturers] = useState<string[]>(() => {
        const unique = new Set(seedMedicines.map((m) => m.manufacturer));
        return Array.from(unique).sort();
    });

    const [newManufacturer, setNewManufacturer] = useState("");
    const [editingManufacturer, setEditingManufacturer] = useState<string | null>(null);
    const [editValue, setEditValue] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const handleAddManufacturer = () => {
        const trimmed = newManufacturer.trim();
        if (!trimmed) {
            toast.error("Please enter a manufacturer name");
            return;
        }
        if (manufacturers.includes(trimmed)) {
            toast.error("Manufacturer already exists");
            return;
        }
        setIsLoading(true);
        setTimeout(() => {
            setManufacturers((prev) => [...prev, trimmed].sort());
            setNewManufacturer("");
            setIsLoading(false);
            toast.success(`Added "${trimmed}" to manufacturers`);
        }, 500);
    };

    const handleDeleteManufacturer = (name: string) => {
        const medCount = seedMedicines.filter((m) => m.manufacturer === name).length;
        if (medCount > 0) {
            toast.warning(`Cannot delete "${name}" - ${medCount} medicine(s) use this manufacturer`);
            return;
        }
        if (window.confirm(`Delete manufacturer "${name}"?`)) {
            setIsLoading(true);
            setTimeout(() => {
                setManufacturers((prev) => prev.filter((m) => m !== name));
                setIsLoading(false);
                toast.success(`Removed "${name}" from manufacturers`);
            }, 500);
        }
    };

    const handleStartEdit = (name: string) => {
        setEditingManufacturer(name);
        setEditValue(name);
    };

    const handleSaveEdit = () => {
        const trimmed = editValue.trim();
        if (!trimmed) {
            toast.error("Manufacturer name cannot be empty");
            return;
        }
        if (trimmed !== editingManufacturer && manufacturers.includes(trimmed)) {
            toast.error("Manufacturer already exists");
            return;
        }
        setIsLoading(true);
        setTimeout(() => {
            setManufacturers((prev) =>
                prev.map((m) => (m === editingManufacturer ? trimmed : m)).sort()
            );
            setEditingManufacturer(null);
            setEditValue("");
            setIsLoading(false);
            toast.success(`Updated manufacturer to "${trimmed}"`);
        }, 500);
    };

    const handleCancelEdit = () => {
        setEditingManufacturer(null);
        setEditValue("");
    };

    const filteredManufacturers = searchQuery
        ? manufacturers.filter((m) =>
            m.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : manufacturers;

    const totalItems = filteredManufacturers.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const currentItems = filteredManufacturers.slice(startIndex, endIndex);

    const getMedicineCount = (manufacturer: string) => {
        return seedMedicines.filter((m) => m.manufacturer === manufacturer).length;
    };

    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    const handleItemsPerPageChange = (value: number) => {
        setItemsPerPage(value);
        setCurrentPage(1);
    };

    const exportToCSV = () => {
        if (manufacturers.length === 0) {
            toast.info("No manufacturers to export");
            return;
        }
        const csv = "Manufacturer Name,Medicine Count\n" +
            manufacturers.map(m => `${m},${getMedicineCount(m)}`).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `manufacturers_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Exported manufacturers list");
    };

    return (
        <div className="flex flex-col gap-6">
            <PageHeader
                title="Manufacture Master"
                description="Manage all medicine manufacturers in the system."
                actions={
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={exportToCSV}
                            className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-700"
                        >
                            <Download className="mr-2 h-4 w-4" /> Export CSV
                        </Button>
                        <span className="text-sm bg-emerald-600 text-white px-3 py-1 rounded-full font-semibold">
                            {manufacturers.length} Total
                        </span>
                    </div>
                }
            />

            <div className="surface-elevated rounded-2xl overflow-hidden border border-border">
                <div className="p-6 border-b border-border bg-muted/20">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                        <div className="flex-1 w-full">
                            <Label htmlFor="newManufacturer" className="text-sm font-semibold">
                                Add New Manufacturer
                            </Label>
                            <div className="flex gap-2 mt-1.5">
                                <Input
                                    id="newManufacturer"
                                    value={newManufacturer}
                                    onChange={(e) => setNewManufacturer(e.target.value)}
                                    placeholder="Enter manufacturer name"
                                    onKeyPress={(e) => e.key === "Enter" && handleAddManufacturer()}
                                    className="flex-1"
                                    disabled={isLoading}
                                />
                                <Button
                                    onClick={handleAddManufacturer}
                                    disabled={isLoading || !newManufacturer.trim()}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                    {isLoading ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Plus className="mr-2 h-4 w-4" />
                                    )}
                                    Add
                                </Button>
                            </div>
                        </div>
                        <div className="w-full sm:w-64">
                            <Label className="text-sm font-semibold">Search</Label>
                            <div className="relative mt-1.5">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search manufacturers..."
                                    className="pl-9"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-4 border border-emerald-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-emerald-600/10 rounded-lg">
                                    <Building2 className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium">Total Manufacturers</p>
                                    <p className="text-2xl font-bold text-emerald-700">{manufacturers.length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-blue-600/10 rounded-lg">
                                    <Package className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium">Total Medicines</p>
                                    <p className="text-2xl font-bold text-blue-700">{seedMedicines.length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-4 border border-purple-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-purple-600/10 rounded-lg">
                                    <Factory className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium">Avg Medicines/Manufacturer</p>
                                    <p className="text-2xl font-bold text-purple-700">
                                        {manufacturers.length > 0 ? (seedMedicines.length / manufacturers.length).toFixed(1) : "0"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-semibold text-muted-foreground">
                            Manufacturer List
                        </h4>
                        <span className="text-xs text-muted-foreground">
                            Showing {totalItems > 0 ? startIndex + 1 : 0}–{endIndex} of {totalItems}
                        </span>
                    </div>

                    <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                        {currentItems.length === 0 ? (
                            <EmptyState
                                icon={Factory}
                                title={searchQuery ? "No manufacturers match" : "No manufacturers"}
                                description={
                                    searchQuery
                                        ? `No manufacturers found matching "${searchQuery}"`
                                        : "Add your first manufacturer above."
                                }
                            />
                        ) : (
                            currentItems.map((name) => {
                                const medCount = getMedicineCount(name);
                                return (
                                    <div
                                        key={name}
                                        className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/20 px-4 py-3 hover:bg-muted/40 transition-all hover:border-emerald-200"
                                    >
                                        {editingManufacturer === name ? (
                                            <div className="flex flex-1 items-center gap-2">
                                                <Input
                                                    value={editValue}
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    className="flex-1 h-9 text-sm border-emerald-300 focus:border-emerald-500"
                                                    autoFocus
                                                    onKeyPress={(e) => e.key === "Enter" && handleSaveEdit()}
                                                    disabled={isLoading}
                                                />
                                                <Button
                                                    size="sm"
                                                    onClick={handleSaveEdit}
                                                    disabled={isLoading || !editValue.trim()}
                                                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                                >
                                                    {isLoading ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        "Save"
                                                    )}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={handleCancelEdit}
                                                    disabled={isLoading}
                                                    className="text-muted-foreground hover:text-foreground"
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <Building2 className="h-4 w-4 text-emerald-600" />
                                                        <p className="text-sm font-medium truncate">{name}</p>
                                                    </div>
                                                    <p className="text-[11px] text-muted-foreground mt-0.5">
                                                        {medCount} medicine{medCount !== 1 ? "s" : ""} in inventory
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 hover:bg-emerald-50 hover:text-emerald-600"
                                                        onClick={() => handleStartEdit(name)}
                                                        title="Edit manufacturer"
                                                        disabled={isLoading}
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        onClick={() => handleDeleteManufacturer(name)}
                                                        title="Delete manufacturer"
                                                        disabled={medCount > 0 || isLoading}
                                                    >
                                                        <PackageMinus className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Pagination */}
                    {totalItems > 0 && (
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span>
                                    Page {currentPage} of {totalPages || 1}
                                </span>
                                <span>·</span>
                                <span>
                                    Showing {startIndex + 1}–{endIndex} of {totalItems}
                                </span>
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                                    className="h-7 rounded-md border border-border bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    {[5, 10, 20, 50].map((size) => (
                                        <option key={size} value={size}>
                                            {size} / page
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-1">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-7 w-7 hover:bg-emerald-50 hover:text-emerald-600"
                                    onClick={() => goToPage(1)}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronsLeft className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-7 w-7 hover:bg-emerald-50 hover:text-emerald-600"
                                    onClick={() => goToPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-3.5 w-3.5" />
                                </Button>
                                <span className="flex items-center px-2 text-xs font-medium">
                                    {currentPage} / {totalPages || 1}
                                </span>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-7 w-7 hover:bg-emerald-50 hover:text-emerald-600"
                                    onClick={() => goToPage(currentPage + 1)}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                >
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-7 w-7 hover:bg-emerald-50 hover:text-emerald-600"
                                    onClick={() => goToPage(totalPages)}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                >
                                    <ChevronsRight className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                        {manufacturers.length} manufacturer(s) · {seedMedicines.length} medicine(s)
                    </p>
                    <div className="flex gap-2">
                        {searchQuery && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setSearchQuery("");
                                    setCurrentPage(1);
                                }}
                                className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-700"
                            >
                                Clear Search
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setCurrentPage(1);
                                setItemsPerPage(10);
                                setSearchQuery("");
                                toast.info("Reset to default view");
                            }}
                            className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-700"
                        >
                            Reset View
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}