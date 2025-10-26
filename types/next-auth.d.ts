import 'next-auth'

declare module 'next-auth' {
  interface Session {
    accessToken?: string
    refreshToken?: string
    user: {
      id: string
      email: string
      name: string
      companyId: number
      role?: string
      kodeAds?: string[]
    }
  }

  interface User {
    id: string
    email: string
    name: string
    companyId: number
    role?: string
    kodeAds?: string[]
    accessToken: string
    refreshToken: string
    accessTokenExpires: number
    photo?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    accessToken?: string
    refreshToken?: string
    companyId?: number
    email?: string
    name?: string
    role?: string
    kodeAds?: string[]
  }
}
