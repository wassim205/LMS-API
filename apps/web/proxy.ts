import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
  const authCookie = request.cookies.get('Authentication')
  const roleCookie = request.cookies.get('Role')

  const isAuth = !!authCookie
  const role = roleCookie?.value
  const { pathname } = request.nextUrl

  const isTeacherRoute = pathname.startsWith('/teacher')
  const isStudentRoute = pathname.startsWith('/student')
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register')

  if ((isTeacherRoute || isStudentRoute) && !isAuth) {
    const url = new URL('/login', request.url)
    url.searchParams.set('callbackUrl', encodeURI(request.url))
    return NextResponse.redirect(url)
  }

  if (isTeacherRoute && role !== 'formateur') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (isStudentRoute && role !== 'apprenant') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (isAuthRoute && isAuth) {
    const dashboard = role === 'formateur' ? '/teacher' : '/'
    return NextResponse.redirect(new URL(dashboard, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/teacher/:path*', '/student/:path*', '/login', '/register'],
}
