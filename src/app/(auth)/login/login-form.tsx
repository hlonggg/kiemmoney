"use client";

import { useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.fieldErrors) setErrors(data.fieldErrors);
        toast.error(data.message || "Đăng nhập thất bại");
        return;
      }

      toast.success("Đăng nhập thành công");
      const redirect = searchParams.get("redirect") || "/home/dashboard";
      router.push(redirect);
      router.refresh();
    } catch {
      toast.error("Không thể kết nối máy chủ. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-mist-100">Đăng nhập</h1>
      <p className="mt-1.5 text-sm text-mist-400">
        Chưa có tài khoản?{" "}
        <Link href="/register" className="text-champagne-500 hover:underline">
          Đăng ký ngay
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
        <Input
          label="Email hoặc tên đăng nhập"
          name="identifier"
          autoComplete="username"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          error={errors.identifier}
          required
        />
        <Input
          label="Mật khẩu"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          required
        />

        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-xs text-mist-400 hover:text-champagne-500">
            Quên mật khẩu?
          </Link>
        </div>

        <Button type="submit" className="w-full" loading={loading}>
          Đăng nhập
        </Button>
      </form>
    </div>
  );
}
