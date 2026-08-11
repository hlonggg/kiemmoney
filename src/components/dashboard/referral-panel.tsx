"use client";

import { useEffect, useState } from "react";
import { Copy, Check, Users, Wallet, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatVND } from "@/lib/utils";

interface ReferralUser {
  id: string;
  username: string;
  createdAt: string;
  totalEarned: string;
}

export function ReferralPanel({ referralCode }: { referralCode: string }) {
  const [copied, setCopied] = useState(false);
  const [referralUrl, setReferralUrl] = useState(""); // rỗng ở lần render đầu (SSR + client) để tránh hydration mismatch
  const [data, setData] = useState<{ referrals: ReferralUser[]; totalCommission: string } | null>(
    null
  );

  useEffect(() => {
    // Chỉ tính window.location sau khi đã mount ở client — đảm bảo HTML
    // do server render và HTML client hydrate lần đầu giống hệt nhau.
    setReferralUrl(`${window.location.origin}/register?ref=${referralCode}`);
  }, [referralCode]);

  useEffect(() => {
    fetch("/api/referral")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => toast.error("Không thể tải dữ liệu giới thiệu"));
  }, []);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      toast.success("Đã sao chép liên kết mời");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Không thể sao chép — vui lòng tự chọn và sao chép");
    }
  }

  return (
    <div className="space-y-6">
      {/* Link mời */}
      <Card className="p-5">
        <p className="text-sm font-medium text-mist-300">Liên kết mời của bạn</p>
        <div className="mt-2.5 flex flex-col gap-2 sm:flex-row">
          <div className="flex h-11 flex-1 items-center overflow-x-auto rounded-xl border border-obsidian-600 bg-obsidian-800 px-4 text-sm text-mist-300">
            <span className="whitespace-nowrap">{referralUrl || "..."}</span>
          </div>
          <Button onClick={handleCopy} variant="secondary" className="sm:w-32">
            {copied ? <Check className="h-4 w-4 text-emerald" /> : <Copy className="h-4 w-4" />}
            {copied ? "Đã chép" : "Sao chép"}
          </Button>
        </div>
        <p className="mt-3 text-xs text-mist-500">
          Mã giới thiệu:{" "}
          <span className="font-display font-semibold text-champagne-500">{referralCode}</span>
        </p>
      </Card>

      {/* Thống kê */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-2 text-mist-400">
            <Users className="h-4 w-4" />
            <span className="text-sm">Số người đã mời</span>
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-mist-100">
            {data ? data.referrals.length : "—"}
          </p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-mist-400">
            <Wallet className="h-4 w-4" />
            <span className="text-sm">Tổng hoa hồng</span>
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-champagne-500">
            {data ? formatVND(data.totalCommission) : "—"}
          </p>
        </Card>
      </div>

      {/* Danh sách */}
      <Card className="p-5">
        <h3 className="mb-4 font-display text-base font-semibold text-mist-100">
          Danh sách người được mời
        </h3>

        {!data ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-mist-500" />
          </div>
        ) : data.referrals.length === 0 ? (
          <p className="py-8 text-center text-sm text-mist-500">
            Bạn chưa mời ai. Chia sẻ liên kết ở trên để bắt đầu nhận hoa hồng.
          </p>
        ) : (
          <ul className="divide-y divide-obsidian-700">
            {data.referrals.map((r) => (
              <li key={r.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm text-mist-200">{r.username}</p>
                  <p className="mt-0.5 text-xs text-mist-500">
                    Tham gia{" "}
                    {new Intl.DateTimeFormat("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    }).format(new Date(r.createdAt))}
                  </p>
                </div>
                <span className="text-xs text-mist-400">
                  Đã kiếm: {formatVND(r.totalEarned)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
