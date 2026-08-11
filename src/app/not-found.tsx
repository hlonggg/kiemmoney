import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-obsidian-950 px-6 text-center">
      <Logo className="mb-8" />
      <p className="font-display text-6xl font-bold text-champagne-500">404</p>
      <p className="mt-3 text-mist-300">Trang bạn tìm không tồn tại hoặc đã được di chuyển.</p>
      <Link href="/" className="mt-6">
        <Button variant="secondary">Về trang chủ</Button>
      </Link>
    </div>
  );
}
