import Link from "next/link";
import { Wallet, TrendingUp, Users, ListChecks, ArrowRight } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { formatVND, cn } from "@/lib/utils";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [referralCount, recentTransactions, todayCompletions] = await Promise.all([
    prisma.user.count({ where: { referredById: user.id } }),
    prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.taskCompletion.count({
      where: {
        userId: user.id,
        status: "VERIFIED",
        verifiedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    }),
  ]);

  const TX_LABEL: Record<string, string> = {
    TASK_REWARD: "Thưởng hoàn thành nhiệm vụ",
    REFERRAL_BONUS: "Hoa hồng giới thiệu",
    WITHDRAWAL: "Yêu cầu rút tiền",
    WITHDRAWAL_REFUND: "Hoàn tiền rút thất bại",
    ADMIN_ADJUSTMENT: "Điều chỉnh bởi quản trị viên",
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Chào mừng */}
      <div>
        <h2 className="font-display text-xl font-bold text-mist-100">
          Chào mừng trở lại, {user.fullName || user.username}
        </h2>
        <p className="mt-1 text-sm text-mist-400">
          Đây là tổng quan hoạt động tài khoản của bạn.
        </p>
      </div>

      {/* Thống kê chính */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Số dư khả dụng" value={formatVND(user.balance)} icon={Wallet} accent />
        <StatCard label="Tổng đã kiếm được" value={formatVND(user.totalEarned)} icon={TrendingUp} />
        <StatCard label="Nhiệm vụ hôm nay" value={String(todayCompletions)} icon={ListChecks} />
        <StatCard label="Bạn đã mời" value={String(referralCount)} icon={Users} />
      </div>

      {/* Hành động nhanh */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link href="/home/tasks">
          <Card className="group flex items-center justify-between p-5 transition-colors hover:border-champagne-600">
            <div>
              <p className="font-medium text-mist-100">Làm nhiệm vụ</p>
              <p className="mt-0.5 text-xs text-mist-400">Kiếm thêm thu nhập ngay</p>
            </div>
            <ArrowRight className="h-4 w-4 text-mist-500 transition-transform group-hover:translate-x-1 group-hover:text-champagne-500" />
          </Card>
        </Link>
        <Link href="/home/referral">
          <Card className="group flex items-center justify-between p-5 transition-colors hover:border-champagne-600">
            <div>
              <p className="font-medium text-mist-100">Mời bạn bè</p>
              <p className="mt-0.5 text-xs text-mist-400">Nhận hoa hồng trọn đời</p>
            </div>
            <ArrowRight className="h-4 w-4 text-mist-500 transition-transform group-hover:translate-x-1 group-hover:text-champagne-500" />
          </Card>
        </Link>
        <Link href="/home/withdraw">
          <Card className="group flex items-center justify-between p-5 transition-colors hover:border-champagne-600">
            <div>
              <p className="font-medium text-mist-100">Rút tiền</p>
              <p className="mt-0.5 text-xs text-mist-400">Chuyển thu nhập về ví</p>
            </div>
            <ArrowRight className="h-4 w-4 text-mist-500 transition-transform group-hover:translate-x-1 group-hover:text-champagne-500" />
          </Card>
        </Link>
      </div>

      {/* Giao dịch gần đây */}
      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-base font-semibold text-mist-100">
            Giao dịch gần đây
          </h3>
        </div>

        {recentTransactions.length === 0 ? (
          <p className="py-8 text-center text-sm text-mist-500">
            Chưa có giao dịch nào. Hoàn thành nhiệm vụ đầu tiên để bắt đầu kiếm tiền.
          </p>
        ) : (
          <ul className="divide-y divide-obsidian-700">
            {recentTransactions.map((tx) => {
              const positive = Number(tx.amount) >= 0;
              return (
                <li key={tx.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm text-mist-200">{TX_LABEL[tx.type] ?? tx.type}</p>
                    <p className="mt-0.5 text-xs text-mist-500">
                      {new Intl.DateTimeFormat("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }).format(tx.createdAt)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "font-display text-sm font-semibold",
                      positive ? "text-emerald" : "text-ruby"
                    )}
                  >
                    {positive ? "+" : ""}
                    {formatVND(tx.amount)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
