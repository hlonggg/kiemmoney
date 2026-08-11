import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/auth";

export default async function RootPage() {
  const token = cookies().get("access_token")?.value;
  const payload = token ? await verifyAccessToken(token) : null;

  redirect(payload ? "/home/dashboard" : "/login");
}
