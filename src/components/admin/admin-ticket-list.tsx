"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Loader2, Inbox, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";

interface TicketDTO {
  id: string;
  subject: string;
  category: string;
  status: string;
  updatedAt: string;
  user: { username: string; email: string };
  _count: { messages: number };
}

const CATEGORY_LABEL: Record<string, string> = {
  WITHDRAW_ISSUE: "Vấn đề rút tiền",
  TASK_ISSUE: "Vấn đề nhiệm vụ",
  ACCOUNT_ISSUE: "Vấn đề tài khoản",
  OTHER: "Khác",
};

const FILTERS = [
  { value: "OPEN", label: "Đang mở" },
  { value: "IN_PROGRESS", label: "Đang xử lý" },
  { value: "RESOLVED", label: "Đã giải quyết" },
  { value: "CLOSED", label: "Đã đóng" },
  { value: "", label: "Tất cả" },
];

export function AdminTicketList() {
  const [filter, setFilter] = useState("OPEN");
  const [tickets, setTickets] = useState<TicketDTO[] | null>(null);

  const load = useCallback(async () => {
    setTickets(null);
    const qs = filter ? `?status=${filter}` : "";
    const res = await fetch(`/api/admin/support${qs}`);
    const data = await res.json();
    if (res.ok) setTickets(data.tickets);
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

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

      {tickets === null ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-mist-500" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Inbox className="h-8 w-8 text-mist-600" />
          <p className="mt-3 text-sm text-mist-400">Không có yêu cầu nào ở trạng thái này.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => (
            <Link key={t.id} href={`/admin/support/${t.id}`}>
              <Card className="flex items-center justify-between p-4 transition-colors hover:border-champagne-600">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-mist-100">{t.subject}</p>
                  <p className="mt-1 text-xs text-mist-500">
                    {t.user.username} · {CATEGORY_LABEL[t.category] ?? t.category} ·{" "}
                    {new Intl.DateTimeFormat("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(new Date(t.updatedAt))}
                  </p>
                </div>
                <div className="ml-4 flex shrink-0 items-center gap-3">
                  <span className="flex items-center gap-1 text-xs text-mist-500">
                    <MessageSquare className="h-3.5 w-3.5" />
                    {t._count.messages}
                  </span>
                  <StatusBadge status={t.status} />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
