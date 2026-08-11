import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { WithdrawPanel } from "@/components/dashboard/withdraw-panel";

export default async function WithdrawPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-mist-100">Rút tiền</h2>
        <p className="mt-1 text-sm text-mist-400">
          Yêu cầu rút tiền được xử lý trong vòng 24 giờ làm việc.
        </p>
      </div>
      <WithdrawPanel balance={Number(user.balance)} />
    </div>
  );
}
