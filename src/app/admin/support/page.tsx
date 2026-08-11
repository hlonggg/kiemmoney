import { AdminTicketList } from "@/components/admin/admin-ticket-list";

export default function AdminSupportPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-mist-100">Yêu cầu hỗ trợ</h2>
        <p className="mt-1 text-sm text-mist-400">Trả lời và xử lý yêu cầu hỗ trợ từ người dùng.</p>
      </div>
      <AdminTicketList />
    </div>
  );
}
