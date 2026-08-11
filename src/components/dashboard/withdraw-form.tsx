"use client";

import { useState, FormEvent } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { formatVND } from "@/lib/utils";
import { MIN_WITHDRAW_AMOUNT } from "@/lib/withdraw-validators";

const METHOD_OPTIONS = [
  { value: "BANK_TRANSFER", label: "Chuyển khoản ngân hàng" },
  { value: "MOMO", label: "Ví MoMo" },
  { value: "ZALOPAY", label: "ZaloPay" },
  { value: "USDT_TRC20", label: "USDT (TRC-20)" },
];

export function WithdrawForm({
  balance,
  hasPending,
  onSuccess,
}: {
  balance: number;
  hasPending: boolean;
  onSuccess: (deductedAmount: number) => void;
}) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("BANK_TRANSFER");
  const [destination, setDestination] = useState("");
  const [destinationName, setDestinationName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const isCrypto = method === "USDT_TRC20";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});

    const numericAmount = parseInt(amount, 10);
    if (!numericAmount || numericAmount < MIN_WITHDRAW_AMOUNT) {
      setErrors({ amount: `Số tiền rút tối thiểu là ${formatVND(MIN_WITHDRAW_AMOUNT)}` });
      return;
    }
    if (numericAmount > balance) {
      setErrors({ amount: "Số dư không đủ để thực hiện yêu cầu này" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: numericAmount,
          method,
          destination,
          destinationName: isCrypto ? undefined : destinationName,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.fieldErrors) setErrors(data.fieldErrors);
        toast.error(data.message || "Gửi yêu cầu thất bại");
        return;
      }
      toast.success("Đã gửi yêu cầu rút tiền, vui lòng chờ duyệt");
      setAmount("");
      setDestination("");
      setDestinationName("");
      onSuccess(numericAmount);
    } catch {
      toast.error("Không thể kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  }

  if (hasPending) {
    return (
      <Card className="p-5">
        <p className="text-sm text-mist-300">
          Bạn đang có một yêu cầu rút tiền chưa được xử lý xong. Vui lòng chờ hoàn tất trước khi
          gửi yêu cầu mới.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="Số tiền muốn rút (VNĐ)"
          name="amount"
          type="number"
          inputMode="numeric"
          min={MIN_WITHDRAW_AMOUNT}
          step={1000}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          error={errors.amount}
          hint={`Số dư khả dụng: ${formatVND(balance)} · Tối thiểu ${formatVND(MIN_WITHDRAW_AMOUNT)}`}
          required
        />

        <Select
          label="Phương thức nhận tiền"
          name="method"
          value={method}
          onChange={(e) => setMethod(e.target.value)}
        >
          {METHOD_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>

        <Input
          label={isCrypto ? "Địa chỉ ví USDT (TRC-20)" : "Số tài khoản / số điện thoại ví"}
          name="destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          error={errors.destination}
          required
        />

        {!isCrypto && (
          <Input
            label="Tên chủ tài khoản"
            name="destinationName"
            value={destinationName}
            onChange={(e) => setDestinationName(e.target.value)}
            error={errors.destinationName}
            required
          />
        )}

        <Button type="submit" className="w-full" loading={loading}>
          Gửi yêu cầu rút tiền
        </Button>
      </form>
    </Card>
  );
}
