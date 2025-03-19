import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const publicPaths = ["/", "/login", "/api/auth"];
  
  // Check if the current path starts with any of the public paths
  const isPublicPath = publicPaths.some(publicPath => 
    path === publicPath || path.startsWith(`${publicPath}/`)
  );

  // Skip middleware for auth API routes
  if (path.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  try {
    // Get the session token
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // Redirect logic
    if (!token && !isPublicPath) {
      // Redirect to login if trying to access protected route without token
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (token && path === "/") {
      // Redirect to chat if already logged in and trying to access login page
      return NextResponse.redirect(new URL("/chat", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    // If there's an error, allow the request to continue to avoid blocking everything
    return NextResponse.next();
  }
}

// Configure which paths the middleware runs on, but EXCLUDE auth API routes
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api/auth routes (which are needed for authentication)
     * 2. /_next (static files)
     * 3. /favicon.ico, /images, etc. (static files)
     */
    "/((?!api/auth|_next/static|/madoka-icon.jpg|/hello-kitty-background.jpg|hello-kitty-backgroundv2.jpg|_next/image|favicon.ico|images).*)",
  ],
};