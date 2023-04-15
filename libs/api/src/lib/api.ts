import { Express, Request, Response } from 'express'
import { auth, logger } from './utils/firebase'

export function setupAPIEndpoints(api: Express) {

  api.get('/api', async (req: Request, res: Response) => {
    return res.status(200).send({ message: 'Hello achiever!' })
  })

  api.get('/api/**', async (req: Request, res: Response) => {

    const currentUser = await decodeJWT(req)
    logger.log('current user: ', currentUser)
    if (!currentUser) return res.status(401).send({ message: 'Unauthorized' })

    return res.status(200).send({ message: 'Hello from API!' })
  })

}

async function decodeJWT(req: Request) {
  const token = req.headers?.authorization?.split('Bearer ')[1]
  if (!token) return

  return auth.verifyIdToken(token)
}