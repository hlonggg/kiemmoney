"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const CATEGORY_OPTIONS = [
  { value: "WITHDRAW_ISSUE", label: "Vấn đề rút tiền" },
  { value: "TASK_ISSUE", label: "Vấn đề nhiệm vụ" },
  { value: "ACCOUNT_ISSUE", label: "Vấn đề tài khoản" },
  { value: "OTHER", label: "Khác" },
];

export function NewTicketForm({ onCreated }: { onCreated: () => void }) {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("OTHER");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, category, message }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.fieldErrors) setErrors(data.fieldErrors);
        toast.error(data.message || "Gửi yêu cầu thất bại");
        return;
      }
      toast.success("Đã gửi yêu cầu hỗ trợ");
      setSubject("");
      setMessage("");
      setOpen(false);
      onCreated();
      router.push(`/home/support/${data.ticket.id}`);
    } catch {
      toast.error("Không thể kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="w-full sm:w-auto">
        Tạo yêu cầu hỗ trợ mới
      </Button>
    );
  }

  return (
    <Card className="p-5">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="Tiêu đề"
          name="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          error={errors.subject}
          required
        />
        <Select
          label="Danh mục"
          name="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
        <div>
          <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-mist-300">
            Nội dung
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full rounded-xl border border-obsidian-600 bg-obsidian-800 p-4 text-sm text-mist-100 outline-none focus:border-champagne-500"
            required
          />
          {errors.message && <p className="mt-1.5 text-xs text-ruby">{errors.message}</p>}
        </div>
        <div className="flex gap-3">
          <Button type="submit" loading={loading}>
            Gửi yêu cầu
          </Button>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            Hủy
          </Button>
        </div>
      </form>
    </Card>
  );
}
