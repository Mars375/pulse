"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

interface Customer {
  id: string;
  name: string;
  email: string;
  plan: string;
  mrrValue: number;
  signupDate: Date;
  churnedAt: Date | null;
}

interface CustomerTableProps {
  customers: Customer[];
  total: number;
  onSelect: (id: string) => void;
}

const planColors: Record<string, string> = {
  starter: "bg-info/10 text-info",
  pro: "bg-accent-primary/10 text-accent-primary",
  business: "bg-chart-2/10 text-chart-2",
};

export function CustomerTable({ customers, total, onSelect }: CustomerTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") ?? "1");
  const totalPages = Math.ceil(total / 20);

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      if (key !== "page") params.delete("page");
      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  const [searchValue, setSearchValue] = useState(searchParams.get("search") ?? "");

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
          <Input
            placeholder="Search customers..."
            className="pl-9 bg-bg-surface-1 border text-text-primary placeholder:text-text-tertiary"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") updateParam("search", searchValue);
            }}
          />
        </div>
        <Select
          defaultValue={searchParams.get("plan") ?? "all"}
          onValueChange={(v) => updateParam("plan", v)}
        >
          <SelectTrigger className="w-[140px] bg-bg-surface-1 border text-text-primary">
            <SelectValue placeholder="Plan" />
          </SelectTrigger>
          <SelectContent className="bg-bg-surface-1 border">
            <SelectItem value="all">All plans</SelectItem>
            <SelectItem value="starter">Starter</SelectItem>
            <SelectItem value="pro">Pro</SelectItem>
            <SelectItem value="business">Business</SelectItem>
          </SelectContent>
        </Select>
        <Select
          defaultValue={searchParams.get("status") ?? "all"}
          onValueChange={(v) => updateParam("status", v)}
        >
          <SelectTrigger className="w-[140px] bg-bg-surface-1 border text-text-primary">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-bg-surface-1 border">
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="churned">Churned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-bg-surface-1 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b hover:bg-transparent">
              <TableHead className="text-text-secondary">Name</TableHead>
              <TableHead className="text-text-secondary">Email</TableHead>
              <TableHead className="text-text-secondary">Plan</TableHead>
              <TableHead className="text-text-secondary text-right">MRR</TableHead>
              <TableHead className="text-text-secondary">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((c) => (
              <TableRow
                key={c.id}
                className="border-b border-border/50 cursor-pointer hover:bg-bg-surface-2/50 transition-colors duration-150"
                onClick={() => onSelect(c.id)}
              >
                <TableCell className="font-medium text-text-primary">{c.name}</TableCell>
                <TableCell className="text-text-secondary text-sm">{c.email}</TableCell>
                <TableCell>
                  <Badge className={cn("text-xs", planColors[c.plan] ?? "bg-bg-surface-2 text-text-secondary")}>
                    {c.plan}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-mono text-sm tabular-nums text-text-primary">
                  {formatCurrency(c.mrrValue)}
                </TableCell>
                <TableCell>
                  {c.churnedAt ? (
                    <Badge className="bg-negative/10 text-negative text-xs">Churned</Badge>
                  ) : (
                    <Badge className="bg-positive/10 text-positive text-xs">Active</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">
          {total} customer{total !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-border text-text-secondary hover:bg-bg-surface-2"
            disabled={page <= 1}
            onClick={() => updateParam("page", String(page - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-text-secondary font-mono tabular-nums">
            {page} / {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="border-border text-text-secondary hover:bg-bg-surface-2"
            disabled={page >= totalPages}
            onClick={() => updateParam("page", String(page + 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
