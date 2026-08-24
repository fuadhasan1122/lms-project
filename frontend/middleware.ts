import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 1. Get the token and role from cookies 
  // (You will set these in the browser cookie when the user logs in)
  const token = request.cookies.get('jwt')?.value
  const userRole = request.cookies.get('role')?.value 

  const path = request.nextUrl.pathname

  // 2. If the user is NOT logged in and tries to access protected pages, kick them to login
  if (!token && (path.startsWith('/dashboard') || path.includes('/lessons') || path.includes('/quiz'))) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 3. Strict Role-Based Routing Enforcement
  // Admin Panel: Accessible ONLY to the Admin role
  if (path.startsWith('/dashboard/admin') && userRole !== 'Admin') {
    return NextResponse.redirect(new URL('/dashboard/' + (userRole?.toLowerCase() || 'student'), request.url))
  }

  // Content Manager Dashboard
  if (path.startsWith('/dashboard/content-manager') && userRole !== 'Content Manager' && userRole !== 'Admin') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Instructor Dashboard
  if (path.startsWith('/dashboard/instructor') && userRole !== 'Instructor' && userRole !== 'Admin') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Allow the request to proceed if all checks pass
  return NextResponse.next()
}

// 4. Configure which routes this middleware should run on
export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/courses/:path*/lessons/:path*',
    '/courses/:path*/quiz'
  ],
}