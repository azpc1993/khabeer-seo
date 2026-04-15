import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || '';
  
  console.log(`Middleware: hostname=${hostname}, pathname=${url.pathname}`);

  // نطاقاتك المخصصة
  const blogDomain = 'khabeerseo.com';
  const appDomain = 'ap.khabeerseo.com';

  // 1. التعامل مع نطاق المدونة (khabeerseo.com)
  if (hostname === blogDomain || hostname === `www.${blogDomain}`) {
    // إذا كان الزائر في الصفحة الرئيسية للنطاق، نعرض له المدونة
    if (url.pathname === '/') {
      return NextResponse.rewrite(new URL('/blog', request.url));
    }
    
    // السماح بالوصول للمسارات النظامية
    const systemPaths = ['/admin-studio', '/api', '/_next', '/favicon.ico', '/blog'];
    if (systemPaths.some(path => url.pathname.startsWith(path))) {
      return NextResponse.next();
    }

    // أي مسار آخر (مثل khabeerseo.com/slug) يتم توجيهه للمدونة
    return NextResponse.rewrite(new URL(`/blog${url.pathname}`, request.url));
  }

  // 2. التعامل مع نطاق التطبيق (ap.khabeerseo.com)
  if (hostname === appDomain || hostname === `www.${appDomain}`) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * استثناء المسارات التي لا تحتاج لمعالجة:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
