import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

const nonAuthRoutes = ['/api/v1/questionnaires', '/api/v1/hash']

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl

    if (nonAuthRoutes.some((route) => pathname.startsWith(route))) {
        return NextResponse.next()
    }

    try {
        const token = await getToken({ req, secret: process.env.JWT_SECRET })

        if (token === null) {throw new Error('No token found')}
        return NextResponse.next()
    } catch (_e) {
        return NextResponse.json({
            status: false,
            code: 401,
            message: 'Unauthorized',
            errors: null,
        })
    }
}

export const config = {
    matcher: ['/api/v1/:path*'],
}
