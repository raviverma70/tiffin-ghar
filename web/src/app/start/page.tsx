import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";

export default async function StartPage() {
  const user = await getCurrentUser("/start");
  const target = !user
    ? "/login?next=%2Fstart"
    : user.role === "PROVIDER"
      ? "/dashboard"
      : user.role === "ADMIN"
        ? "/admin"
        : "/";

  redirect(target);

  return <p>Ruko...</p>;
}