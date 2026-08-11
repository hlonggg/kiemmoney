"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Inbox } from "lucide-react";
import { TaskCard } from "./task-card";

interface TaskDTO {
  id: string;
  title: string;
  description: string | null;
  rewardAmount: string;
  dailyLimitPerUser: number;
  completedToday: number;
  exhausted: boolean;
}

export function TaskList() {
  const [tasks, setTasks] = useState<TaskDTO[] | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/tasks");
    const data = await res.json();
    if (res.ok) setTasks(data.tasks);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (tasks === null) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-mist-500" />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Inbox className="h-8 w-8 text-mist-600" />
        <p className="mt-3 text-sm text-mist-400">
          Hiện chưa có nhiệm vụ nào khả dụng. Quay lại sau nhé.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} onCompleted={load} />
      ))}
    </div>
  );
}
