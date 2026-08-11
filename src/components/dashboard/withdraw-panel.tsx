"use client";

import { useEffect, useState, useCallback } from "react";
import { WithdrawForm } from "./withdraw-form";
import { WithdrawHistory } from "./withdraw-history";

interface WithdrawalDTO {
  id: string;
  amount: string;
  method: string;
  status: string;
  requestedAt: string;
}

export function WithdrawPanel({ balance }: { balance: number }) {
  const [withdrawals, setWithdrawals] = useState<WithdrawalDTO[] | null>(null);
  const [currentBalance, setCurrentBalance] = useState(balance);

  const load = useCallback(async () => {
    const res = await fetch("/api/withdraw");
    const data = await res.json();
    if (res.ok) setWithdrawals(data.withdrawals);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const hasPending =
    withdrawals?.some((w) => w.status === "PENDING" || w.status === "PROCESSING") ?? false;

  async function handleSuccess(deductedAmount: number) {
    setCurrentBalance((b) => b - deductedAmount);
    await load();
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <WithdrawForm balance={currentBalance} hasPending={hasPending} onSuccess={handleSuccess} />
      <WithdrawHistory withdrawals={withdrawals} />
    </div>
  );
}
