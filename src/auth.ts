import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import { verifyPassword, generateToken } from '@/lib/auth-utils'

type PayloadProps =
    | {
          email: string
          password: string
      }
    | undefined

export const { handlers, auth, signIn, signOut } = NextAuth({
    debug: true,
    logger: {
        error(error) {
            console.error('NextAuth Error:', error)
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
        Credentials({
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

                    // Demo accounts for testing
                    const demoAccounts = [
                        { email: 'admin@demo.com', password: 'demo123', name: 'Super Admin', role: 'super_admin', kodeAds: [] },
                        { email: 'representative@demo.com', password: 'demo123', name: 'CS Representative', role: 'cs_representative', kodeAds: [] },
                        { email: 'advertiser@demo.com', password: 'demo123', name: 'Advertiser', role: 'advertiser', kodeAds: ['202', '204'] },
                        { email: 'support@demo.com', password: 'demo123', name: 'CS Support', role: 'cs_support', kodeAds: [] },
                        { email: 'retention@demo.com', password: 'demo123', name: 'Retention Specialist', role: 'retention', kodeAds: [] },
                    ]

                    // Check if it's a demo account
                    const demoUser = demoAccounts.find(
                        account => account.email === credentials.email && account.password === credentials.password
                    )

                    if (demoUser) {
                        // Return demo user
                        return {
                            id: demoUser.email,
                            name: demoUser.name,
                            email: demoUser.email,
                            role: demoUser.role,
                            kodeAds: demoUser.kodeAds,
                            accessToken: 'demo-token-' + Date.now(),
                            refreshToken: 'demo-refresh-' + Date.now(),
                            accessTokenExpires: Date.now() + 6 * 60 * 60 * 1000, // 6 hours
                            photo: undefined,
                            companyId: 0,
                        }
                    }

                    // If not a demo account, try database lookup
                    const user = await prisma.user.findUnique({
                        where: {
                            email: credentials.email,
                        },
                        include: {
                            userKodeAds: {
                                include: {
                                    kodeAds: true
                                }
                            }
                        }
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
                        role: user.role,
                        kodeAds: user.userKodeAds?.map(uka => uka.kodeAds.kode) || [],
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
                token.role = user.role // Add role to token
                token.kodeAds = user.kodeAds // Add kodeAds to token
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

            // Properly assign user properties to session
            session.user.id = token.id as string
            session.user.email = token.email as string
            session.user.name = token.name as string
            session.user.companyId = token.companyId as number
            session.user.role = token.role as string
            session.user.kodeAds = token.kodeAds as string[]

            return session
        }
    },
    basePath: '/api/auth',
    secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET,
})
