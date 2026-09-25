import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default auth((req) => {
  const { nextUrl } = req;
  const user = req.auth?.user;
  const isAdminRoute =
    nextUrl.pathname.startsWith("/admin") || nextUrl.pathname.startsWith("/invoice");
  const isAccountRoute = nextUrl.pathname.startsWith("/account");

  if (isAdminRoute && user?.role !== "ADMIN") {
    const url = new URL("/admin-login", nextUrl);
    url.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  if (isAccountRoute && !user) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/invoice/:path*"],
};
