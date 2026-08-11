import { SupportPanel } from "@/components/dashboard/support-panel";

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-mist-100">Hỗ trợ</h2>
        <p className="mt-1 text-sm text-mist-400">
          Gặp vấn đề với nhiệm vụ, rút tiền hoặc tài khoản? Gửi yêu cầu để được hỗ trợ.
        </p>
      </div>
      <SupportPanel />
    </div>
  );
}
