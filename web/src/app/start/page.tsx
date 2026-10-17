import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";

export default async function StartPage() {
  const user = await getCurrentUser("/start");
  if (!user) redirect("/login?next=%2Fstart");

  if (user.role === "PROVIDER") redirect("/dashboard");

  // CUSTOMER (ya ADMIN) ko home par bhejte hain
  redirect("/");

  return null;
}