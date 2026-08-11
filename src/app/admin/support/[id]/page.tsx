import { AdminTicketThread } from "@/components/admin/admin-ticket-thread";

export default function AdminTicketDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="mx-auto max-w-3xl">
      <AdminTicketThread ticketId={params.id} />
    </div>
  );
}
