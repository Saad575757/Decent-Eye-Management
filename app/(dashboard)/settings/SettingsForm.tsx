"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateSettingsAction } from "@/lib/actions";

interface Settings {
  shopName: string;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  email: string | null;
  currency: string;
  defaultCollectionDays: number;
  lowStockThreshold: number;
}

export function SettingsForm({ settings }: { settings: Settings }) {
  const router = useRouter();
  const [form, setForm] = useState({
    shopName: settings.shopName,
    phone: settings.phone || "",
    whatsapp: settings.whatsapp || "",
    address: settings.address || "",
    email: settings.email || "",
    currency: settings.currency,
    defaultCollectionDays: String(settings.defaultCollectionDays),
    lowStockThreshold: String(settings.lowStockThreshold),
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    const res = await updateSettingsAction(form);
    setLoading(false);
    if (!res.ok) {
      setError(res.error || "Something went wrong");
      return;
    }
    setMessage("Settings saved successfully.");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4 sm:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Shop Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="s-name">Shop Name</Label>
            <Input
              id="s-name"
              value={form.shopName}
              onChange={(e) => setForm({ ...form, shopName: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="s-email">Email</Label>
            <Input
              id="s-email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="s-phone">Phone</Label>
            <Input
              id="s-phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="s-whatsapp">WhatsApp</Label>
            <Input
              id="s-whatsapp"
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="s-address">Address</Label>
            <Textarea
              id="s-address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Order Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="s-days">Default Collection Days</Label>
              <Input
                id="s-days"
                type="number"
                min="0"
                max="365"
                value={form.defaultCollectionDays}
                onChange={(e) =>
                  setForm({ ...form, defaultCollectionDays: e.target.value })
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="s-low">Low Stock Threshold</Label>
              <Input
                id="s-low"
                type="number"
                min="0"
                value={form.lowStockThreshold}
                onChange={(e) =>
                  setForm({ ...form, lowStockThreshold: e.target.value })
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Currency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="s-currency">Currency</Label>
              <Input
                id="s-currency"
                value={form.currency}
                onChange={(e) =>
                  setForm({ ...form, currency: e.target.value })
                }
                maxLength={10}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <p className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      {message && (
        <p className="rounded-md border border-green-500/50 bg-green-500/10 px-3 py-2 text-sm text-green-700">
          {message}
        </p>
      )}

      <Button type="submit" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Settings"
        )}
      </Button>
    </form>
  );
}
