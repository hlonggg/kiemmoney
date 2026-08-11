"use client";

import { useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    referralCode: searchParams.get("ref") || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.fieldErrors) setErrors(data.fieldErrors);
        toast.error(data.message || "Đăng ký thất bại");
        return;
      }

      toast.success("Tạo tài khoản thành công");
      router.push("/home/dashboard");
      router.refresh();
    } catch {
      toast.error("Không thể kết nối máy chủ. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-mist-100">Tạo tài khoản</h1>
      <p className="mt-1.5 text-sm text-mist-400">
        Đã có tài khoản?{" "}
        <Link href="/login" className="text-champagne-500 hover:underline">
          Đăng nhập
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
        <Input
          label="Tên đăng nhập"
          name="username"
          autoComplete="username"
          value={form.username}
          onChange={(e) => update("username", e.target.value)}
          error={errors.username}
          hint="4–20 ký tự, chỉ gồm chữ, số và dấu gạch dưới"
          required
        />
        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          error={errors.email}
          required
        />
        <Input
          label="Mật khẩu"
          name="password"
          type="password"
          autoComplete="new-password"
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          error={errors.password}
          hint="Tối thiểu 8 ký tự, có chữ hoa và số"
          required
        />
        <Input
          label="Mã giới thiệu (nếu có)"
          name="referralCode"
          value={form.referralCode}
          onChange={(e) => update("referralCode", e.target.value)}
          error={errors.referralCode}
        />

        <Button type="submit" className="w-full" loading={loading}>
          Tạo tài khoản
        </Button>

        <p className="text-center text-xs leading-relaxed text-mist-500">
          Bằng việc tạo tài khoản, bạn đồng ý với{" "}
          <Link href="/terms" className="underline hover:text-champagne-500">
            Điều khoản dịch vụ
          </Link>{" "}
          và{" "}
          <Link href="/privacy" className="underline hover:text-champagne-500">
            Chính sách bảo mật
          </Link>
          .
        </p>
      </form>
    </div>
  );
}
