import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import acceptLanguage from "accept-language";
import { locales, Language } from "./utils/lang";
import createIntlMiddleware from 'next-intl/middleware';

acceptLanguage.languages(locales)
const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale: Language.English,
  localePrefix: "always",
  localeDetection: true,
  pathnames: {
    '/': {
      en: '/',
      'zh-CN': '/'
    },
    '/user': {
      en: '/user',
      'zh-CN': '/user'
    },
    '/login': {
      en: '/login',
      'zh-CN': '/login'
    },
    '/register': {
      en: '/register',
      'zh-CN': '/register'
    }
  }
});

// CORS configuration
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,OPTIONS,PATCH,DELETE,POST,PUT",
  "Access-Control-Allow-Headers":
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
  "Access-Control-Allow-Credentials": "true",
} as const;


export function middleware(request: NextRequest) {
  // Skip i18n middleware for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // If this is a CORS preflight, respond immediately with OK + CORS headers
    if (request.method === 'OPTIONS') {
      const preflight = new NextResponse(null, { status: 200 });
      Object.entries(CORS_HEADERS).forEach(([key, value]) => {
        preflight.headers.set(key, value);
      });
      return preflight;
    }

    // Otherwise, continue and attach CORS headers
    const response = NextResponse.next();
    Object.entries(CORS_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }
  
  // Apply i18n middleware for non-API routes
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/",
    "/((?!api|_next/static|_next/image|favicon.ico|wedev).*)",
    "/api/:path*", // Keep this to handle CORS for API routes
    "/wedev/:path*",
  ],
  runtime: "nodejs",
}
