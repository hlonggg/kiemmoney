import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

// Space Grotesk: font hình học, sắc nét — dùng cho tiêu đề, số dư, con số lớn.
// Đây là lựa chọn "trừu tượng-thương mại" thay vì serif cổ điển, tạo cảm giác
// fintech hiện đại chứ không phải "ngân hàng truyền thống".
const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-display",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "LinkEarn — Nền tảng nhiệm vụ trả thưởng",
    template: "%s · LinkEarn",
  },
  description:
    "Hoàn thành nhiệm vụ, nhận thưởng minh bạch, rút tiền nhanh chóng.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0A0B0E",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${display.variable} ${body.variable}`}>
      <body className="bg-obsidian-950 font-body antialiased">
        {children}
        <Toaster
          theme="dark"
          position="top-center"
          toastOptions={{
            style: {
              background: "#171A22",
              border: "1px solid #2C3140",
              color: "#F5F6F8",
            },
          }}
        />
      </body>
    </html>
  );
}
