"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Loader2, Check, X, Send, Inbox } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatVND } from "@/lib/utils";

interface WithdrawalDTO {
  id: string;
  amount: string;
  method: string;
  destination: string;
  destinationName: string | null;
  status: string;
  requestedAt: string;
  user: { username: string; email: string };
}

const METHOD_LABEL: Record<string, string> = {
  BANK_TRANSFER: "Chuyển khoản ngân hàng",
  MOMO: "Ví MoMo",
  ZALOPAY: "ZaloPay",
  USDT_TRC20: "USDT (TRC-20)",
};

const FILTERS = [
  { value: "PENDING", label: "Chờ duyệt" },
  { value: "APPROVED", label: "Đã duyệt · chờ chuyển" },
  { value: "COMPLETED", label: "Hoàn tất" },
  { value: "REJECTED", label: "Đã từ chối" },
  { value: "", label: "Tất cả" },
];

export function WithdrawalsTable() {
  const [filter, setFilter] = useState("PENDING");
  const [withdrawals, setWithdrawals] = useState<WithdrawalDTO[] | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setWithdrawals(null);
    const qs = filter ? `?status=${filter}` : "";
    const res = await fetch(`/api/admin/withdrawals${qs}`);
    const data = await res.json();
    if (res.ok) setWithdrawals(data.withdrawals);
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAction(id: string, action: "APPROVE" | "COMPLETE" | "REJECT") {
    if (action === "REJECT") {
      const confirmed = window.confirm(
        "Từ chối yêu cầu này sẽ hoàn lại tiền cho người dùng. Tiếp tục?"
      );
      if (!confirmed) return;
    }

    setProcessingId(id);
    try {
      const res = await fetch(`/api/admin/withdrawals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Thao tác thất bại");
        return;
      }
      toast.success("Đã cập nhật");
      await load();
    } catch {
      toast.error("Không thể kết nối máy chủ");
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
              filter === f.value
                ? "border-champagne-600 bg-champagne-500/10 text-champagne-500"
                : "border-obsidian-600 text-mist-400 hover:text-mist-100"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {withdrawals === null ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-mist-500" />
        </div>
      ) : withdrawals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Inbox className="h-8 w-8 text-mist-600" />
          <p className="mt-3 text-sm text-mist-400">Không có yêu cầu nào ở trạng thái này.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {withdrawals.map((w) => (
            <Card key={w.id} className="p-4">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-base font-bold text-mist-100">
                      {formatVND(w.amount)}
                    </span>
                    <StatusBadge status={w.status} />
                  </div>
                  <p className="mt-1 text-sm text-mist-300">
                    {w.user.username} · {w.user.email}
                  </p>
                  <p className="mt-1 text-xs text-mist-500">
                    {METHOD_LABEL[w.method] ?? w.method} → {w.destination}
                    {w.destinationName ? ` (${w.destinationName})` : ""}
                  </p>
                  <p className="mt-1 text-xs text-mist-600">
                    {new Intl.DateTimeFormat("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(new Date(w.requestedAt))}
                  </p>
                </div>

                <div className="flex shrink-0 gap-2">
                  {w.status === "PENDING" && (
                    <>
                      <Button
                        size="sm"
                        variant="secondary"
                        loading={processingId === w.id}
                        onClick={() => handleAction(w.id, "APPROVE")}
                      >
                        <Check className="h-3.5 w-3.5" />
                        Duyệt
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        loading={processingId === w.id}
                        onClick={() => handleAction(w.id, "REJECT")}
                      >
                        <X className="h-3.5 w-3.5" />
                        Từ chối
                      </Button>
                    </>
                  )}
                  {(w.status === "APPROVED" || w.status === "PROCESSING") && (
                    <>
                      <Button
                        size="sm"
                        loading={processingId === w.id}
                        onClick={() => handleAction(w.id, "COMPLETE")}
                      >
                        <Send className="h-3.5 w-3.5" />
                        Đã chuyển khoản
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        loading={processingId === w.id}
                        onClick={() => handleAction(w.id, "REJECT")}
                      >
                        <X className="h-3.5 w-3.5" />
                        Từ chối
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
