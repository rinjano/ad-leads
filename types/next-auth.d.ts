import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    accessToken?: string
    refreshToken?: string
    user: {
      id: string
      email: string
      name: string
      companyId: number
    }
  }

  interface User {
    id: string
    email: string
    name: string
    companyId: number
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
  }
}
