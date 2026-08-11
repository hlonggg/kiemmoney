"use client";

import { Loader2, Inbox } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatVND } from "@/lib/utils";

interface WithdrawalDTO {
  id: string;
  amount: string;
  method: string;
  status: string;
  requestedAt: string;
}

const METHOD_LABEL: Record<string, string> = {
  BANK_TRANSFER: "Chuyển khoản ngân hàng",
  MOMO: "Ví MoMo",
  ZALOPAY: "ZaloPay",
  USDT_TRC20: "USDT (TRC-20)",
};

export function WithdrawHistory({ withdrawals }: { withdrawals: WithdrawalDTO[] | null }) {
  return (
    <Card className="p-5">
      <h3 className="mb-4 font-display text-base font-semibold text-mist-100">
        Lịch sử rút tiền
      </h3>

      {withdrawals === null ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-mist-500" />
        </div>
      ) : withdrawals.length === 0 ? (
        <div className="flex flex-col items-center py-10 text-center">
          <Inbox className="h-7 w-7 text-mist-600" />
          <p className="mt-3 text-sm text-mist-500">Bạn chưa có yêu cầu rút tiền nào.</p>
        </div>
      ) : (
        <ul className="divide-y divide-obsidian-700">
          {withdrawals.map((w) => (
            <li key={w.id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm text-mist-200">{METHOD_LABEL[w.method] ?? w.method}</p>
                <p className="mt-0.5 text-xs text-mist-500">
                  {new Intl.DateTimeFormat("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(new Date(w.requestedAt))}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-display text-sm font-semibold text-mist-100">
                  {formatVND(w.amount)}
                </span>
                <StatusBadge status={w.status} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
