/**
 * Script cấp quyền ADMIN cho một tài khoản đã tồn tại.
 *
 * CỐ Ý không xây API/giao diện web để tự phong Admin — nếu có, đó sẽ là
 * một lỗ hổng leo thang đặc quyền (privilege escalation) cực kỳ nghiêm
 * trọng. Việc cấp quyền admin phải luôn là thao tác thủ công của người
 * vận hành hệ thống, chạy trực tiếp trên server/máy có quyền truy cập DB.
 *
 * Cách dùng:
 *   npx tsx scripts/make-admin.ts <email-hoặc-username>
 *
 * Ví dụ:
 *   npx tsx scripts/make-admin.ts admin@linkearn.vn
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const identifier = process.argv[2];
  if (!identifier) {
    console.error("Thiếu tham số. Cách dùng: npx tsx scripts/make-admin.ts <email-hoặc-username>");
    process.exit(1);
  }

  const user = await prisma.user.findFirst({
    where: { OR: [{ email: identifier }, { username: identifier }] },
  });

  if (!user) {
    console.error(`Không tìm thấy tài khoản nào khớp với "${identifier}". Hãy đăng ký tài khoản này trước.`);
    process.exit(1);
  }

  if (user.role === "ADMIN") {
    console.log(`Tài khoản "${user.username}" đã là ADMIN từ trước, không cần thay đổi.`);
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { role: "ADMIN" },
  });

  console.log(`Đã cấp quyền ADMIN cho tài khoản "${user.username}" (${user.email}).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
