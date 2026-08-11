"use client";

import { useEffect, useState, useCallback, FormEvent } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  messages: MessageDTO[];
}

const CATEGORY_LABEL: Record<string, string> = {
  WITHDRAW_ISSUE: "Vấn đề rút tiền",
  TASK_ISSUE: "Vấn đề nhiệm vụ",
  ACCOUNT_ISSUE: "Vấn đề tài khoản",
  OTHER: "Khác",
};

export function TicketThread({ ticketId }: { ticketId: string }) {
  const [ticket, setTicket] = useState<TicketDetailDTO | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/support/${ticketId}`);
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

  async function handleReply(e: FormEvent) {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/support/${ticketId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: reply }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Gửi thất bại");
        return;
      }
      setReply("");
      await load();
    } catch {
      toast.error("Không thể kết nối máy chủ");
    } finally {
      setSending(false);
    }
  }

  if (notFound) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-mist-400">Không tìm thấy yêu cầu hỗ trợ này.</p>
        <Link href="/home/support" className="mt-3 inline-block text-sm text-champagne-500 hover:underline">
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

  const isClosed = ticket.status === "CLOSED";

  return (
    <div className="space-y-5">
      <Link
        href="/home/support"
        className="inline-flex items-center gap-1.5 text-sm text-mist-400 hover:text-mist-100"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại danh sách
      </Link>

      <div className="flex items-start justify-between gap-3">
        <h2 className="font-display text-xl font-bold text-mist-100">{ticket.subject}</h2>
        <StatusBadge status={ticket.status} />
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

      {isClosed ? (
        <p className="text-center text-xs text-mist-500">
          Yêu cầu hỗ trợ này đã được đóng. Tạo yêu cầu mới nếu bạn cần hỗ trợ thêm.
        </p>
      ) : (
        <form onSubmit={handleReply} className="flex gap-2">
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Nhập phản hồi của bạn..."
            rows={2}
            className="flex-1 rounded-xl border border-obsidian-600 bg-obsidian-800 p-3 text-sm text-mist-100 outline-none focus:border-champagne-500"
          />
          <Button type="submit" loading={sending} className="shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      )}
    </div>
  );
}
