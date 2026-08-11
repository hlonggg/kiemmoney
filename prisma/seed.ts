import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const tasks = [
    {
      title: "Xem trang giới thiệu đối tác A",
      description: "Truy cập và ở lại trang trong ít nhất 15 giây để hoàn thành.",
      destinationUrl: "https://example.com/partner-a",
      shortenerProvider: "internal",
      rewardAmount: 500,
      dailyLimitPerUser: 3,
      minAccountAgeHours: 0,
    },
    {
      title: "Khảo sát nhanh đối tác B",
      description: "Hoàn thành khảo sát ngắn 3 câu hỏi.",
      destinationUrl: "https://example.com/partner-b",
      shortenerProvider: "internal",
      rewardAmount: 1200,
      dailyLimitPerUser: 1,
      minAccountAgeHours: 24,
    },
    {
      title: "Đăng ký dùng thử đối tác C",
      description: "Nhiệm vụ giá trị cao — chỉ dành cho tài khoản đã hoạt động ổn định.",
      destinationUrl: "https://example.com/partner-c",
      shortenerProvider: "internal",
      rewardAmount: 3000,
      dailyLimitPerUser: 1,
      totalSlots: 500,
      minAccountAgeHours: 72,
    },
  ];

  for (const t of tasks) {
    await prisma.task.create({ data: t });
  }

  console.log(`Đã tạo ${tasks.length} nhiệm vụ mẫu.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
