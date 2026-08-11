import { z } from "zod";

// Số tiền rút tối thiểu — tránh spam yêu cầu rút những khoản quá nhỏ khiến
// đội vận hành quá tải khi xử lý thủ công.
export const MIN_WITHDRAW_AMOUNT = 50_000;

export const withdrawSchema = z.object({
  amount: z
    .number({ invalid_type_error: "Số tiền không hợp lệ" })
    .int("Số tiền phải là số nguyên")
    .min(MIN_WITHDRAW_AMOUNT, `Số tiền rút tối thiểu là ${MIN_WITHDRAW_AMOUNT.toLocaleString("vi-VN")}đ`),
  method: z.enum(["BANK_TRANSFER", "MOMO", "ZALOPAY", "USDT_TRC20"], {
    errorMap: () => ({ message: "Vui lòng chọn phương thức rút tiền" }),
  }),
  destination: z.string().min(4, "Vui lòng nhập số tài khoản / số ví hợp lệ").max(100),
  destinationName: z.string().min(2, "Vui lòng nhập tên chủ tài khoản").max(100).optional(),
});

export type WithdrawInput = z.infer<typeof withdrawSchema>;
