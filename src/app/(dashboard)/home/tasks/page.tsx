import { TaskList } from "@/components/dashboard/task-list";

export default function TasksPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-mist-100">Nhiệm vụ khả dụng</h2>
        <p className="mt-1 text-sm text-mist-400">
          Hoàn thành các bước trên trang liên kết để nhận thưởng ngay vào số dư.
        </p>
      </div>
      <TaskList />
    </div>
  );
}
