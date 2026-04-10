import { NextRequest } from "next/server";

const SESSION_COOKIE = "admin_session";

export function isAuthenticated(req: NextRequest): boolean {
  return req.cookies.get(SESSION_COOKIE)?.value === "authenticated";
}
