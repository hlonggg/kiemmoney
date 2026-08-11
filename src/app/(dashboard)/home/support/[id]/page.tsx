import { TicketThread } from "@/components/dashboard/ticket-thread";

export default function TicketDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="mx-auto max-w-3xl">
      <TicketThread ticketId={params.id} />
    </div>
  );
}
