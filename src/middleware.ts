import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// SEMENTARA DISABLE MIDDLEWARE UNTUK BYPASS LOGIN
export function middleware(request: NextRequest) {
    // const isAuthenticated = request.cookies.get('session_key')

    // if (!isAuthenticated && request.nextUrl.pathname !== '/login') {
    //     return NextResponse.redirect(new URL('/login', request.url))
    // }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|login|favicon.ico).*)'],
}
