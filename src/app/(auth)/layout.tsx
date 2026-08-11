import { Logo } from "@/components/ui/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Cột trái: form — chiếm toàn màn hình trên mobile */}
      <div className="flex flex-col justify-center px-6 py-10 sm:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-sm">
          <Logo className="mb-10" />
          {children}
        </div>
      </div>

      {/* Cột phải: showcase thương hiệu — ẩn trên mobile để không dư thừa giao diện */}
      <div className="relative hidden overflow-hidden bg-obsidian-radial lg:block">
        <div className="bg-noise absolute inset-0 opacity-40" />
        <div className="relative flex h-full flex-col justify-between p-16">
          <div />
          <div className="max-w-md">
            <p className="font-display text-3xl font-medium leading-snug text-mist-100">
              Hoàn thành nhiệm vụ.
              <br />
              <span className="text-champagne-500">Nhận thưởng minh bạch.</span>
            </p>
            <p className="mt-4 text-sm leading-relaxed text-mist-400">
              Mọi giao dịch được ghi nhận theo thời gian thực, rút tiền nhanh
              chóng và đội ngũ hỗ trợ luôn sẵn sàng.
            </p>
          </div>
          <p className="text-xs text-mist-500">
            © {new Date().getFullYear()} LinkEarn. Bảo lưu mọi quyền.
          </p>
        </div>
      </div>
    </div>
  );
}
