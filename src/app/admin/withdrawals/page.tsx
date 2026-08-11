import { WithdrawalsTable } from "@/components/admin/withdrawals-table";

export default function AdminWithdrawalsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-mist-100">Duyệt rút tiền</h2>
        <p className="mt-1 text-sm text-mist-400">
          Xem xét và xử lý các yêu cầu rút tiền của người dùng.
        </p>
      </div>
      <WithdrawalsTable />
    </div>
  );
}
