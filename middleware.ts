import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const JOB_MAPPER_ORIGIN = 'https://job-map-express.vercel.app'

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  // Legacy path → canonical
  if (pathname === '/jobmapper' || pathname.startsWith('/jobmapper/')) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.replace(/^\/jobmapper/, '/job-mapper') || '/job-mapper'
    return NextResponse.redirect(url, 308)
  }

  // Proxy Job Mapper Express (keeps browser URL on app.jtbd.one)
  if (pathname === '/job-mapper' || pathname.startsWith('/job-mapper/')) {
    const target = new URL(pathname + search, JOB_MAPPER_ORIGIN)
    return NextResponse.rewrite(target)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/job-mapper', '/job-mapper/:path*', '/jobmapper', '/jobmapper/:path*'],
}
