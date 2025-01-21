import { withSession } from '@/lib/session'
import type { NextApiRequest, NextApiResponse } from 'next'

export default withSession(async function loginRoute(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { username, password } = req.body

  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    req.session.isLoggedIn = true
    req.session.username = username
    await req.session.save()
    res.json({ isLoggedIn: true, username })
  } else {
    res.status(401).json({ error: 'Invalid credentials' })
  }
}) 