"use client";

import { useMemo, useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchInput } from "@/components/SearchInput";
import { EmptyState } from "@/components/EmptyState";
import { ProductFormDialog } from "@/components/products/ProductFormDialog";
import { formatCurrency, cn } from "@/lib/utils";

type ProductRow = {
  id: string;
  name: string;
  category: string;
  brand: string | null;
  description: string | null;
  sellingPrice: number;
  purchasePrice: number | null;
  stock: number;
};

export function ProductsClient({
  products,
  currency,
  lowStockThreshold,
}: {
  products: ProductRow[];
  currency: string;
  lowStockThreshold: number;
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ProductRow | null>(null);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (category !== "ALL" && p.category !== category) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          (p.brand || "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [products, category, search]);

  function stockStatus(stock: number) {
    if (stock === 0) {
      return { label: "Out of Stock", cls: "bg-red-100 text-red-800 border-red-200" };
    }
    if (stock <= lowStockThreshold) {
      return { label: "Low Stock", cls: "bg-yellow-100 text-yellow-800 border-yellow-200" };
    }
    return { label: "In Stock", cls: "bg-green-100 text-green-800 border-green-200" };
  }

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <SearchInput
            placeholder="Search products..."
            value={search}
            onChange={setSearch}
          />
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              <SelectItem value="FRAME">Frame</SelectItem>
              <SelectItem value="LENS">Lens</SelectItem>
              <SelectItem value="SUNGLASSES">Sunglasses</SelectItem>
              <SelectItem value="ACCESSORY">Accessory</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="No products found"
                description="Add your first product to use it in orders."
                actionLabel="+ Add Product"
                onAction={() => {
                  setEditing(null);
                  setDialogOpen(true);
                }}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((p) => {
                    const status = stockStatus(p.stock);
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell className="capitalize">
                          {p.category.toLowerCase()}
                        </TableCell>
                        <TableCell>{p.brand || "—"}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(p.sellingPrice, currency)}
                        </TableCell>
                        <TableCell className="text-right">{p.stock}</TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold",
                              status.cls
                            )}
                          >
                            {status.label}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditing(p);
                              setDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <ProductFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={editing as any}
      />
    </div>
  );
}
