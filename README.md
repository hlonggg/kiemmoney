# LinkEarn Platform

Nền tảng kiếm tiền qua hoàn thành nhiệm vụ (vượt link rút gọn). Stack: **Next.js 14 (App Router) + TypeScript + Tailwind + Prisma + PostgreSQL**.

## Tiến độ

- [x] **Đợt 1** — Khởi tạo project, database schema toàn hệ thống, hệ thống Auth (đăng ký / đăng nhập / refresh token / logout), giao diện auth responsive.
- [x] **Đợt 2** — Layout chính responsive (Sidebar desktop + Bottom Nav mobile dùng chung 1 nguồn điều hướng), Dashboard tổng quan, hệ thống Nhiệm vụ (bắt đầu → đếm ngược → xác nhận, có khoá chống cộng tiền 2 lần), hệ thống Mời bạn bè (link giới thiệu, hoa hồng 10% tự động).
- [x] **Đợt 3** — Rút tiền (khoá nguyên tử chống âm số dư), Hỗ trợ (ticket + hội thoại nhiều lượt), trang 404/error đồng bộ thiết kế, icon/manifest/robots.txt, rà soát toàn bộ hệ thống.
- [x] **Đợt 4** — Trang Admin: duyệt/từ chối rút tiền (hoàn tiền tự động khi từ chối), trả lời ticket hỗ trợ, phân quyền ADMIN/MODERATOR ở cả middleware lẫn Server Component.

## Tạo tài khoản Admin đầu tiên

Không có API công khai nào cấp quyền admin (đúng nguyên tắc bảo mật). Sau khi đăng ký tài khoản thường qua `/register`, chạy:

```bash
npm run make-admin -- your-email@example.com
```

Sau đó đăng nhập lại và truy cập trực tiếp `/admin` (khu vực admin có sidebar/menu điều hướng riêng, tách biệt hoàn toàn khỏi giao diện người dùng thường — xem link "← Về giao diện người dùng" ở cuối sidebar admin để quay lại).

## Tính năng đầy đủ

| Khu vực | Đường dẫn | Mô tả |
|---|---|---|
| Đăng ký / Đăng nhập | `/register`, `/login` | JWT qua cookie httpOnly, hỗ trợ mã giới thiệu khi đăng ký |
| Dashboard | `/home/dashboard` | Số dư, tổng đã kiếm, thống kê, lịch sử giao dịch |
| Nhiệm vụ | `/home/tasks` | Danh sách nhiệm vụ, luồng bắt đầu → xác nhận → nhận thưởng |
| Mời bạn bè | `/home/referral` | Link giới thiệu, hoa hồng 10%, danh sách người được mời |
| Rút tiền | `/home/withdraw` | Yêu cầu rút qua ngân hàng/MoMo/ZaloPay/USDT, lịch sử trạng thái |
| Hỗ trợ | `/home/support`, `/home/support/[id]` | Tạo ticket, hội thoại nhiều lượt với đội hỗ trợ |
| **Admin** — Duyệt rút tiền | `/admin/withdrawals` | Duyệt / từ chối (hoàn tiền tự động) / đánh dấu đã chuyển khoản |
| **Admin** — Hỗ trợ | `/admin/support`, `/admin/support/[id]` | Xem toàn bộ ticket, trả lời với vai trò đội hỗ trợ, đổi trạng thái |

## Chạy thử ngay với dữ liệu mẫu

Sau bước `npx prisma db push`, chạy thêm:

```bash
npx prisma db seed
```

Lệnh này tạo sẵn 3 nhiệm vụ mẫu để bạn test luồng "Bắt đầu → Xác nhận" ngay tại `/home/tasks` mà không cần tự tạo dữ liệu qua Prisma Studio.


## Cài đặt (chạy thật trên máy / server)

```bash
# 1. Cài dependencies
npm install

# 2. Tạo file .env từ mẫu, điền thông tin thật
cp .env.example .env

# 3. Khởi tạo database (cần PostgreSQL đang chạy)
npx prisma generate
npx prisma db push

# 4. Chạy dev server
npm run dev
```

Mở http://localhost:3000 — sẽ tự chuyển tới `/login`.

## Việc cần làm trước khi lên production (rất quan trọng)

1. **Đổi 2 secret** `JWT_ACCESS_SECRET` và `JWT_REFRESH_SECRET` trong `.env` thành chuỗi random mạnh (≥ 64 ký tự), KHÔNG dùng giá trị mẫu.
2. **Refresh token đang lưu raw trong DB** (xem ghi chú trong `src/lib/cookies.ts`) — trước khi go-live, đổi sang lưu SHA-256 hash của token thay vì token gốc, để nếu DB bị lộ thì token cũ không dùng lại được.
3. Bật **HTTPS** — cookie đang đặt `secure: true` khi `NODE_ENV=production`, nếu chạy HTTP thuần thì cookie sẽ không được set.
4. Cấu hình **rate-limit** thật (Redis/Upstash) cho endpoint login và endpoint xác nhận hoàn thành nhiệm vụ (đợt 2) — hiện tại mới có giới hạn cơ bản, chưa đủ chống brute-force/bot ở quy mô lớn.
5. Với mô hình nhiệm vụ trả thưởng bằng tiền thật: cần tuân thủ quy định pháp luật hiện hành về trung gian thanh toán / thương mại điện tử tại nơi vận hành, và có điều khoản dịch vụ rõ ràng cho người dùng.
6. **Xác nhận hoàn thành nhiệm vụ hiện đang là "self-report"** (client tự báo đã xong sau khi đợi đủ 20 giây) — xem ghi chú chi tiết trong `src/app/api/tasks/verify/route.ts`. Trước khi vận hành thật với ngân sách lớn, nên tích hợp postback/webhook từ nhà cung cấp dịch vụ rút gọn link để xác thực phía server-to-server, tránh bị giả lập gọi thẳng API.
7. **Khi admin bấm "Đã chuyển khoản" (COMPLETE), hệ thống chỉ cập nhật trạng thái trong DB — KHÔNG tự động gọi API ngân hàng/ví điện tử nào.** Admin vẫn phải tự thực hiện chuyển khoản thủ công (hoặc qua ứng dụng ngân hàng riêng) TRƯỚC khi bấm nút này. Nếu muốn tự động hoá, cần tích hợp thêm cổng thanh toán (SePay, Casso, hoặc API ngân hàng) ở bước COMPLETE trong `src/app/api/admin/withdrawals/[id]/route.ts`.
8. **`role: ADMIN` chỉ nên cấp cho người thật sự tin cậy** — tài khoản Admin có quyền duyệt rút tiền (di chuyển tiền thật) và xem toàn bộ nội dung ticket hỗ trợ của mọi người dùng. Xem mục "Tạo tài khoản Admin đầu tiên" phía trên.

## Cấu trúc thư mục

```
src/
  app/
    (auth)/login, (auth)/register      # trang công khai
    (dashboard)/home/...               # khu vực người dùng sau đăng nhập
    admin/...                          # khu vực quản trị (yêu cầu role ADMIN/MODERATOR)
    api/auth/...                       # register, login, logout, refresh, me
    api/admin/...                      # API quản trị — MỌI route đều gọi requireAdmin()
  components/ui/                       # Button, Input, Select, Card, Logo, StatusBadge — dùng chung toàn hệ thống
  components/admin/                    # component riêng khu vực quản trị
  lib/                                 # prisma client, auth (JWT), admin-auth, validators, cookies, utils
  middleware.ts                        # bảo vệ route, redirect theo trạng thái đăng nhập + phân quyền /admin
scripts/make-admin.ts                  # CLI cấp quyền admin — KHÔNG có API/UI tương đương vì lý do bảo mật
prisma/schema.prisma                   # toàn bộ database schema
```
