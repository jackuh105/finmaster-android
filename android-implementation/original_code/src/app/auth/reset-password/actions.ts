"use server";

import { cookies } from "next/headers";

export async function clearRestrictedCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("auth-restricted");
}
