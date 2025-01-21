import { withSession } from '@/lib/session'
import type { NextApiRequest, NextApiResponse } from 'next'

export default withSession(async function logoutRoute(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  req.session.destroy()
  
  res.setHeader('Set-Cookie', [
    'dockeranium_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
    'dockeranium_session.sig=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT'
  ])

  res.json({ success: true })
}) 