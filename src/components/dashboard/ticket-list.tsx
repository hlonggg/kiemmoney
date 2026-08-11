"use client";

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
  _count: { messages: number };
}

const CATEGORY_LABEL: Record<string, string> = {
  WITHDRAW_ISSUE: "Vấn đề rút tiền",
  TASK_ISSUE: "Vấn đề nhiệm vụ",
  ACCOUNT_ISSUE: "Vấn đề tài khoản",
  OTHER: "Khác",
};

export function TicketList({ tickets }: { tickets: TicketDTO[] | null }) {
  if (tickets === null) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-mist-500" />
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Inbox className="h-8 w-8 text-mist-600" />
        <p className="mt-3 text-sm text-mist-400">Bạn chưa có yêu cầu hỗ trợ nào.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tickets.map((t) => (
        <Link key={t.id} href={`/home/support/${t.id}`}>
          <Card className="flex items-center justify-between p-4 transition-colors hover:border-champagne-600">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-mist-100">{t.subject}</p>
              <p className="mt-1 text-xs text-mist-500">
                {CATEGORY_LABEL[t.category] ?? t.category} ·{" "}
                {new Intl.DateTimeFormat("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
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
  );
}
