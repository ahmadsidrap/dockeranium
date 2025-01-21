import type { IronSessionData } from 'iron-session'
import { getIronSession } from 'iron-session'
import type { NextApiHandler } from 'next'
import type { NextRequest, NextResponse } from 'next/server'

export interface SessionData extends IronSessionData {
  isLoggedIn: boolean
  username?: string
}

const sessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD || 'complex_password_at_least_32_characters_long',
  cookieName: 'dockeranium_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7 // 1 week
  },
}

export async function getSession(req: NextRequest, res: NextResponse) {
  const session = await getIronSession<SessionData>(req, res, sessionOptions)
  return session
}

export function withSession(handler: NextApiHandler) {
  return async function withSessionHandler(req: any, res: any) {
    const session = await getIronSession(req, res, sessionOptions)
    req.session = session
    return handler(req, res)
  }
} 