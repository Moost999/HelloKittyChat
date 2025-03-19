import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const publicPaths = ["/"]
  const isPublicPath = publicPaths.includes(path)

  // Get the session token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET || "your-secret-key-for-development",
  })

  // Redirect logic
  if (!token && !isPublicPath) {
    // Redirect to login if trying to access protected route without token
    return NextResponse.redirect(new URL("/", request.url))
  }

  if (token && isPublicPath) {
    // Redirect to chat if already logged in and trying to access login page
    return NextResponse.redirect(new URL("/chat", request.url))
  }

  return NextResponse.next()
}

// Configure which paths the middleware runs on
export const config = {
  matcher: ["/", "/chat/:path*", "/hello-kitty-background.jpg"],
}

