import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { ReferralPanel } from "@/components/dashboard/referral-panel";

export default async function ReferralPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-mist-100">Mời bạn bè</h2>
        <p className="mt-1 text-sm text-mist-400">
          Nhận 10% hoa hồng trên mọi phần thưởng nhiệm vụ mà người bạn mời kiếm được — vĩnh viễn.
        </p>
      </div>
      <ReferralPanel referralCode={user.referralCode} />
    </div>
  );
}
