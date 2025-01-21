declare module 'iron-session' {
  export interface IronSessionData {
    isLoggedIn: boolean
    username?: string
  }

  export interface SessionOptions {
    password: string
    cookieName: string
    cookieOptions: {
      secure: boolean
      maxAge?: number
      sameSite?: 'strict' | 'lax' | 'none'
      path?: string
    }
  }

  export function getIronSession<T extends IronSessionData>(
    req: Request | NextRequest,
    res: Response | NextResponse,
    options: SessionOptions
  ): Promise<T>

  export function createResponse(res: Response | NextResponse): Response
}

declare module 'next-iron-session' {
  import { NextApiHandler } from 'next'
  import { IronSessionData, SessionOptions } from 'iron-session'

  export function withIronSessionApiRoute<T extends IronSessionData>(
    handler: NextApiHandler,
    options: SessionOptions
  ): NextApiHandler

  export function withIronSession<T extends IronSessionData>(
    handler: NextApiHandler,
    options: SessionOptions
  ): NextApiHandler
} 