import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isProtectedRoute = pathname.startsWith("/library") || pathname.startsWith("/settings");

  if (isAdminRoute) {
    const role = req.auth?.user?.role;
    if (!req.auth || (role !== "ADMIN" && role !== "MODERATOR")) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
  }

  if (isProtectedRoute && !req.auth) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/library/:path*", "/settings/:path*"],
};
