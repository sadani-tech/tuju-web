import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = ["/", "/login", "/register"];
const authPaths = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const token =
    request.cookies.get("tuju_token")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");

  const path = request.nextUrl.pathname;
  const isPublic = publicPaths.some((p) => path === p);
  const isAuthPath = authPaths.some((p) => path.startsWith(p));
  const isDashboard =
    path.startsWith("/dashboard") ||
    path.startsWith("/profile") ||
    path.startsWith("/report") ||
    path.startsWith("/onboarding") ||
    path.startsWith("/roadmap") ||
    path.startsWith("/chat") ||
    path.startsWith("/points") ||
    path.startsWith("/explore");

  // No redirect based on token from middleware since token is in localStorage not cookies
  // Just let the client-side handle it
  void isPublic;
  void isAuthPath;
  void isDashboard;
  void token;

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
