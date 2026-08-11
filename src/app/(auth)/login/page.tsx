import { Suspense } from "react";
import { LoginForm } from "./login-form";

// useSearchParams() trong LoginForm bắt buộc phải nằm trong <Suspense>,
// nếu không Next.js sẽ bail toàn bộ route sang client-side rendering
// và cảnh báo lỗi lúc build (`useSearchParams() should be wrapped in a
// suspense boundary`).
export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
