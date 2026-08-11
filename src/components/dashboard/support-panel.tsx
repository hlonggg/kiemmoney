"use client";

import { useEffect, useState, useCallback } from "react";
import { NewTicketForm } from "./new-ticket-form";
import { TicketList } from "./ticket-list";

interface TicketDTO {
  id: string;
  subject: string;
  category: string;
  status: string;
  updatedAt: string;
  _count: { messages: number };
}

export function SupportPanel() {
  const [tickets, setTickets] = useState<TicketDTO[] | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/support");
    const data = await res.json();
    if (res.ok) setTickets(data.tickets);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <NewTicketForm onCreated={load} />
      <TicketList tickets={tickets} />
    </div>
  );
}
