import { NextResponse } from "next/server";

// Routes that require a logged-in user
const USER_PROTECTED = [
  "/users/Cart",
  "/users/Checkout",
  "/users/Wishlist",
  "/users/Account",
  "/users/Dashboard",
  "/users/logout",
];

// Auth pages — redirect away if already logged in
const USER_AUTH_PAGES = ["/usersAuth/login", "/usersAuth/Register"];
const ADMIN_AUTH_PAGES = ["/adminAuth/login"];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  const userRaw = request.cookies.get("user")?.value;
  const adminRaw = request.cookies.get("admin")?.value;

  let userLoggedIn = false;
  let adminLoggedIn = false;

  try {
    if (userRaw) userLoggedIn = !!JSON.parse(decodeURIComponent(userRaw));
  } catch (_) {}

  try {
    if (adminRaw) adminLoggedIn = !!JSON.parse(decodeURIComponent(adminRaw));
  } catch (_) {}

  // Block users from accessing admin panel (exclude /adminAuth itself)
  if (pathname.startsWith("/admin") && !pathname.startsWith("/adminAuth")) {
    if (!adminLoggedIn) {
      return NextResponse.redirect(new URL("/adminAuth/login", request.url));
    }
  }

  // Protect user-only routes
  if (USER_PROTECTED.some((p) => pathname.startsWith(p))) {
    if (!userLoggedIn) {
      return NextResponse.redirect(
        new URL(`/usersAuth/login?redirect=${encodeURIComponent(pathname)}`, request.url)
      );
    }
  }

  // Redirect already-logged-in users away from auth pages
  if (USER_AUTH_PAGES.some((p) => pathname.startsWith(p)) && userLoggedIn) {
    return NextResponse.redirect(new URL("/users/Home", request.url));
  }

  if (ADMIN_AUTH_PAGES.some((p) => pathname.startsWith(p)) && adminLoggedIn) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/adminAuth/:path*",
    "/users/Cart/:path*",
    "/users/Checkout/:path*",
    "/users/Wishlist/:path*",
    "/users/Account/:path*",
    "/users/Dashboard/:path*",
    "/users/logout/:path*",
    "/usersAuth/:path*",
  ],
};
