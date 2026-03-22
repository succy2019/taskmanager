import {Hono} from 'hono'
import {verify} from 'hono/jwt'
import {getCookie} from 'hono/cookie'
import type {Context, Next} from 'hono'
import 'dotenv/config'


export const authMiddleware = async (c: Context, next: Next) => {

  // Read token from httpOnly cookie
  const token = getCookie(c, 'authToken')
  
  if (!token) {
    return c.json({message: 'Authentication token missing'}, 401)
  }

  try {
    const jwtSecret = process.env.JWT_SECRET

    if (!jwtSecret) {
      return c.json({message: 'Server configuration error'}, 500)
    }

    const decoded = await verify(token, jwtSecret)
    c.set('user', decoded)
    
    return next()

  } catch (error) {
    return c.json({message: 'Invalid or expired token'}, 401)
  }
}