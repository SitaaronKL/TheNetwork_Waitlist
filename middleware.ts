import { NextRequest, NextResponse } from 'next/server';

function unauthorizedResponse() {
  return new Response('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Admin Dashboard", charset="UTF-8"',
    },
  });
}

export function middleware(request: NextRequest) {
  const url = new URL(request.url);
  // Protect /admin and any subpaths
  if (!url.pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  const authHeader = request.headers.get('authorization') || '';
  const expectedPassword = process.env.ADMIN_PASSWORD || 'thenetworkadmin';

  if (!authHeader.toLowerCase().startsWith('basic ')) {
    return unauthorizedResponse();
  }

  try {
    const base64Credentials = authHeader.split(' ')[1] || '';
    const decoded = atob(base64Credentials);
    const [, password] = decoded.split(':'); // accept any username, validate password only
    if (password && password === expectedPassword) {
      return NextResponse.next();
    }
    return unauthorizedResponse();
  } catch {
    return unauthorizedResponse();
  }
}

export const config = {
  matcher: ['/admin/:path*', '/admin'],
};


