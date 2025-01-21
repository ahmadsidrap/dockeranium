import { IronSession } from 'iron-session'
import { NextApiRequest } from 'next'

declare module 'next' {
  interface NextApiRequest {
    session: IronSession & {
      isLoggedIn: boolean
      username?: string
    }
  }
} 