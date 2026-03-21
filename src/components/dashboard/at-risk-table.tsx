"use client";

import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface AtRiskCustomer {
  id: string;
  name: string;
  email: string;
  plan: string;
  mrrValue: number;
  riskSignal: string;
}

export function AtRiskTable({ customers }: { customers: AtRiskCustomer[] }) {
  if (customers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-text-secondary">
        <AlertTriangle className="h-8 w-8 mb-2 text-text-tertiary" />
        <p className="text-sm">No at-risk customers detected.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-bg-surface-1 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-b hover:bg-transparent">
            <TableHead className="text-text-secondary">Customer</TableHead>
            <TableHead className="text-text-secondary">Plan</TableHead>
            <TableHead className="text-text-secondary text-right">MRR</TableHead>
            <TableHead className="text-text-secondary">Risk Signal</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((c, i) => (
            <motion.tr
              key={c.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.04 }}
              className="border-b border-border/50"
            >
              <TableCell>
                <div>
                  <p className="font-medium text-text-primary">{c.name}</p>
                  <p className="text-text-tertiary text-xs">{c.email}</p>
                </div>
              </TableCell>
              <TableCell>
                <Badge className="bg-bg-surface-2 text-text-secondary text-xs">
                  {c.plan}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-mono text-sm tabular-nums text-text-primary">
                {formatCurrency(c.mrrValue)}
              </TableCell>
              <TableCell>
                <Badge className="bg-warning/10 text-warning text-xs">
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  {c.riskSignal}
                </Badge>
              </TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
