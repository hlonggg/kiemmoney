"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Send, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";

interface MessageDTO {
  id: string;
  body: string;
  isStaff: boolean;
  createdAt: string;
  author: { username: string };
}

interface TicketDetailDTO {
  id: string;
  subject: string;
  status: string;
  category: string;
  user: { username: string; email: string };
  messages: MessageDTO[];
}

const CATEGORY_LABEL: Record<string, string> = {
  WITHDRAW_ISSUE: "Vấn đề rút tiền",
  TASK_ISSUE: "Vấn đề nhiệm vụ",
  ACCOUNT_ISSUE: "Vấn đề tài khoản",
  OTHER: "Khác",
};

const STATUS_OPTIONS = [
  { value: "OPEN", label: "Đang mở" },
  { value: "IN_PROGRESS", label: "Đang xử lý" },
  { value: "RESOLVED", label: "Đã giải quyết" },
  { value: "CLOSED", label: "Đã đóng" },
];

export function AdminTicketThread({ ticketId }: { ticketId: string }) {
  const [ticket, setTicket] = useState<TicketDetailDTO | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/support/${ticketId}`);
    if (res.status === 404) {
      setNotFound(true);
      return;
    }
    const data = await res.json();
    if (res.ok) setTicket(data.ticket);
  }, [ticketId]);

  useEffect(() => {
    load();
  }, [load]);

  async function submitReply(resolveAfter: boolean) {
    if (!reply.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/admin/support/${ticketId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: reply, resolveAfterReply: resolveAfter }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Gửi thất bại");
        return;
      }
      setReply("");
      toast.success("Đã gửi phản hồi");
      await load();
    } catch {
      toast.error("Không thể kết nối máy chủ");
    } finally {
      setSending(false);
    }
  }

  async function handleStatusChange(status: string) {
    setStatusUpdating(true);
    try {
      const res = await fetch(`/api/admin/support/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        toast.error("Cập nhật trạng thái thất bại");
        return;
      }
      await load();
    } catch {
      toast.error("Không thể kết nối máy chủ");
    } finally {
      setStatusUpdating(false);
    }
  }

  if (notFound) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-mist-400">Không tìm thấy yêu cầu hỗ trợ này.</p>
        <Link href="/admin/support" className="mt-3 inline-block text-sm text-champagne-500 hover:underline">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-mist-500" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Link
        href="/admin/support"
        className="inline-flex items-center gap-1.5 text-sm text-mist-400 hover:text-mist-100"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại danh sách
      </Link>

      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h2 className="font-display text-xl font-bold text-mist-100">{ticket.subject}</h2>
          <p className="mt-1 text-sm text-mist-400">
            {ticket.user.username} · {ticket.user.email} · {CATEGORY_LABEL[ticket.category] ?? ticket.category}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={ticket.status} />
          <Select
            value={ticket.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={statusUpdating}
            className="h-9 w-40 text-xs"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <Card className="divide-y divide-obsidian-700 p-0">
        {ticket.messages.map((m) => (
          <div key={m.id} className="p-4">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "text-xs font-semibold",
                  m.isStaff ? "text-champagne-500" : "text-mist-300"
                )}
              >
                {m.isStaff ? "Đội hỗ trợ LinkEarn" : m.author.username}
              </span>
              <span className="text-xs text-mist-500">
                {new Intl.DateTimeFormat("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(new Date(m.createdAt))}
              </span>
            </div>
            <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-mist-200">
              {m.body}
            </p>
          </div>
        ))}
      </Card>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submitReply(false);
        }}
        className="space-y-2"
      >
        <textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Nhập phản hồi cho người dùng..."
          rows={3}
          className="w-full rounded-xl border border-obsidian-600 bg-obsidian-800 p-3 text-sm text-mist-100 outline-none focus:border-champagne-500"
        />
        <div className="flex gap-2">
          <Button type="submit" loading={sending} size="sm">
            <Send className="h-3.5 w-3.5" />
            Gửi phản hồi
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            loading={sending}
            onClick={() => submitReply(true)}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Gửi và đánh dấu đã giải quyết
          </Button>
        </div>
      </form>
    </div>
  );
}
