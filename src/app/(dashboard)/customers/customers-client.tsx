"use client";

import { useState } from "react";
import { CustomerTable } from "@/components/dashboard/customer-table";
import { CustomerDetail } from "@/components/dashboard/customer-detail";

interface Customer {
  id: string;
  name: string;
  email: string;
  plan: string;
  mrrValue: number;
  signupDate: Date;
  churnedAt: Date | null;
}

export function CustomersClient({
  customers,
  total,
}: {
  customers: Customer[];
  total: number;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <>
      <CustomerTable
        customers={customers}
        total={total}
        onSelect={(id) => setSelectedId(id)}
      />
      <CustomerDetail
        customerId={selectedId}
        onClose={() => setSelectedId(null)}
      />
    </>
  );
}
