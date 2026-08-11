import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Cách dùng: npm run make-admin -- user@example.com
 * Gán quyền ADMIN cho tài khoản đã tồn tại theo email. Đây là cách duy
 * nhất để tạo admin đầu tiên — không có API công khai nào cho phép tự
 * đăng ký làm admin (đúng nguyên tắc bảo mật: quyền admin chỉ được cấp
 * qua truy cập trực tiếp vào server/database, không qua giao diện web).
 */
async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Thiếu email. Cách dùng: npm run make-admin -- user@example.com");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`Không tìm thấy tài khoản với email: ${email}`);
    console.error("Hãy đăng ký tài khoản đó trước qua giao diện /register rồi chạy lại lệnh này.");
    process.exit(1);
  }

  if (user.role === "ADMIN") {
    console.log(`Tài khoản ${email} đã là ADMIN từ trước.`);
    return;
  }

  await prisma.user.update({ where: { email }, data: { role: "ADMIN" } });
  console.log(`Đã gán quyền ADMIN cho tài khoản: ${email} (username: ${user.username})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
