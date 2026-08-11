import { z } from "zod";

export const registerSchema = z.object({
  username: z
    .string()
    .min(4, "Tên đăng nhập tối thiểu 4 ký tự")
    .max(20, "Tên đăng nhập tối đa 20 ký tự")
    .regex(/^[a-zA-Z0-9_]+$/, "Chỉ dùng chữ, số và dấu gạch dưới"),
  email: z.string().email("Email không hợp lệ"),
  password: z
    .string()
    .min(8, "Mật khẩu tối thiểu 8 ký tự")
    .regex(/[A-Z]/, "Mật khẩu cần ít nhất 1 chữ hoa")
    .regex(/[0-9]/, "Mật khẩu cần ít nhất 1 chữ số"),
  referralCode: z.string().optional().nullable(),
});

export const loginSchema = z.object({
  identifier: z.string().min(1, "Vui lòng nhập email hoặc tên đăng nhập"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
