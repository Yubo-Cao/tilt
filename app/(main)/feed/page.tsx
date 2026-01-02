import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { FeedClient } from "./feed-client";

export default async function FeedPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login?callbackUrl=/feed");
  }

  return <FeedClient userId={user.id} />;
}
