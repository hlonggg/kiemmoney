"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalLink, CheckCircle2, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatVND } from "@/lib/utils";

interface TaskDTO {
  id: string;
  title: string;
  description: string | null;
  rewardAmount: string;
  dailyLimitPerUser: number;
  completedToday: number;
  exhausted: boolean;
}

type Phase = "idle" | "waiting" | "ready" | "verifying" | "done";

export function TaskCard({ task, onCompleted }: { task: TaskDTO; onCompleted: () => void }) {
  const [phase, setPhase] = useState<Phase>(task.exhausted ? "done" : "idle");
  const [secondsLeft, setSecondsLeft] = useState(20);
  const sessionTokenRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  async function handleStart() {
    try {
      const res = await fetch("/api/tasks/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: task.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Không thể bắt đầu nhiệm vụ");
        return;
      }

      sessionTokenRef.current = data.sessionToken;
      window.open(data.destinationUrl, "_blank", "noopener,noreferrer");

      setPhase("waiting");
      setSecondsLeft(data.minWaitSeconds ?? 20);
      timerRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setPhase("ready");
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } catch {
      toast.error("Không thể kết nối máy chủ");
    }
  }

  async function handleVerify() {
    if (!sessionTokenRef.current) return;
    setPhase("verifying");
    try {
      const res = await fetch("/api/tasks/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionToken: sessionTokenRef.current }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Xác nhận thất bại");
        setPhase("ready");
        return;
      }
      toast.success(`Nhận thưởng ${formatVND(data.rewardAmount)}`);
      setPhase("done");
      onCompleted();
    } catch {
      toast.error("Không thể kết nối máy chủ");
      setPhase("ready");
    }
  }

  const remaining = task.dailyLimitPerUser - task.completedToday;

  return (
    <Card className="flex flex-col justify-between p-5">
      <div>
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-medium text-mist-100">{task.title}</h3>
          <span className="shrink-0 font-display text-base font-bold text-champagne-500">
            {formatVND(task.rewardAmount)}
          </span>
        </div>
        {task.description && (
          <p className="mt-1.5 text-xs leading-relaxed text-mist-400">{task.description}</p>
        )}
        <p className="mt-2 text-xs text-mist-500">
          Còn lại hôm nay: {Math.max(remaining, 0)}/{task.dailyLimitPerUser} lượt
        </p>
      </div>

      <div className="mt-4">
        {phase === "idle" && (
          <Button className="w-full" size="sm" onClick={handleStart}>
            <ExternalLink className="h-4 w-4" />
            Bắt đầu nhiệm vụ
          </Button>
        )}
        {phase === "waiting" && (
          <Button className="w-full" size="sm" variant="secondary" disabled>
            <Clock className="h-4 w-4" />
            Đợi {secondsLeft}s rồi quay lại xác nhận
          </Button>
        )}
        {phase === "ready" && (
          <Button className="w-full" size="sm" onClick={handleVerify}>
            <CheckCircle2 className="h-4 w-4" />
            Tôi đã hoàn thành
          </Button>
        )}
        {phase === "verifying" && (
          <Button className="w-full" size="sm" loading disabled>
            Đang xác nhận...
          </Button>
        )}
        {phase === "done" && (
          <Button className="w-full" size="sm" variant="secondary" disabled>
            <CheckCircle2 className="h-4 w-4 text-emerald" />
            Đã hoàn thành hôm nay
          </Button>
        )}
      </div>
    </Card>
  );
}
