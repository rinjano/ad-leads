import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import { verifyPassword, generateToken } from '@/lib/auth-utils'

type PayloadProps =
    | {
          email: string
          password: string
      }
    | undefined

export const authOptions: NextAuthOptions = {
    debug: true,
    logger: {
        error(code, metadata) {
            console.error('NextAuth Error:', code, metadata)
        },
        warn(code) {
            console.warn('NextAuth Warning:', code)
        },
        debug(code, metadata) {
            // eslint-disable-next-line no-console
            console.log('NextAuth Debug:', code, metadata)
        }
    },
    providers: [
        CredentialsProvider({
            name: 'loginByCredential',
            id: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            authorize: async (credentials: PayloadProps) => {
                
                try {

                    console.log('email', credentials)
                    if (!credentials?.email || !credentials?.password) {
                        throw new Error('Please enter your email and password')
                    }

                    // Find user by email using Prisma
                    const user = await prisma.user.findUnique({
                        where: {
                            email: credentials.email,
                        },
                    })

                    if (!user) {
                        return null
                    }

                    // Verify password
                    const isValidPassword = await verifyPassword(
                        credentials.password,
                        user.password
                    )

                    if (!isValidPassword) {
                        return null
                    }

                    // Generate tokens
                    const accessToken = generateToken({
                        id: user.id,
                        email: user.email,
                        companyId: user.companyId || undefined,
                    })

                    const refreshToken = generateToken({
                        id: user.id,
                        email: user.email,
                        companyId: user.companyId || undefined,
                    })

                    // Return user object
                    return {
                        id: user.id.toString(),
                        name: user.name,
                        email: user.email,
                        companyId: user.companyId || 0,
                        accessToken: accessToken,
                        refreshToken: refreshToken,
                        accessTokenExpires: Date.now() + 6 * 60 * 60 * 1000, // 6 hours
                        photo: undefined,
                    }
                } catch (error) {
                    console.error('Auth error:', error)
                    return null
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, account, trigger, session }) {        
            
            if (user && account) {
                token.id = user.id
                token.accessToken = user.accessToken
                token.refreshToken = user.refreshToken
                token.companyId = user.companyId
                token.name = user.name
                token.email = user.email
            }

            if (trigger === 'update' && session) {
                if (session.accessToken) {token.accessToken = session.accessToken}
                if (session.refreshToken) {token.refreshToken = session.refreshToken}
            }

            return token
        },
        async session({ session, token }) {
            
            if (token.accessToken) {
                session.accessToken = token.accessToken as string
                session.refreshToken = token.refreshToken as string
            }

            session.user = {
                id: token.id as unknown as string,
                email: token.email as string,
                name: token.name as string,
                companyId: token.companyId as unknown as number,
            }

            return session
        }
    },
    pages: {
        signIn: '/login',
        error: '/login',
    },
    secret: process.env.JWT_SECRET,
    session: {
        strategy: 'jwt',
        maxAge: 6 * 60 * 60, //6 hours, if user still have transaction, we can extend the session
        // maxAge: 1 * 60 //6 hours, if user still have transaction, we can extend the session
    },
    jwt: {
        secret: process.env.JWT_SECRET,
    },
}
