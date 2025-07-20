import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /, /admin/phone-vendor)
  const path = request.nextUrl.pathname;

  // Check if the path is for admin routes
  if (path.startsWith('/admin/')) {
    // For now, we'll let the client-side handle authentication
    // In a production app, you might want to verify JWT tokens here
    return NextResponse.next();
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
