"use client";

import { useEffect } from "react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Trong production, nối thêm việc gửi lỗi này tới hệ thống giám sát
    // (Sentry, LogRocket, ...) — hiện tại mới log ra console phía server.
    console.error("[unhandled-error]", error);
  }, [error]);

  return (
    <html lang="vi">
      <body className="bg-obsidian-950">
        <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <Logo className="mb-8" />
          <p className="font-display text-xl font-bold text-mist-100">Đã có lỗi xảy ra</p>
          <p className="mt-2 max-w-sm text-sm text-mist-400">
            Rất tiếc, hệ thống gặp sự cố ngoài ý muốn. Vui lòng thử lại hoặc liên hệ hỗ trợ nếu vấn
            đề tiếp diễn.
          </p>
          <Button variant="secondary" className="mt-6" onClick={reset}>
            Thử lại
          </Button>
        </div>
      </body>
    </html>
  );
}
