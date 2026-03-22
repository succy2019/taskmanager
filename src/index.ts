import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { login, register, logout, getProfile } from './controller/userController'
import { loginAdmin, logoutAdmin, getAllUsers, getAllTasks, updateProfile, updateUserById, updateTaskStatus as updateTaskStatusAdmin } from './controller/adminController'
import { getUserTasks, createTask, updateTaskStatus, updateTask, deleteTask, getTaskById } from './controller/taskController'
import { authMiddleware } from './middleware/authmiddleware'
import { initializeDatabase } from './repository/database'

type D1Database = unknown

// Cloudflare Workers environment interface
interface Env {
  DB: D1Database
}

const defaultAllowedOrigins = [
  'http://localhost:9000',
  'http://127.0.0.1:9000',
  'https://taskmanagerfront.successoghenede2.workers.dev'
]

const configuredAllowedOrigins = (process.env.FRONTEND_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

const allowedOrigins = Array.from(new Set([...defaultAllowedOrigins, ...configuredAllowedOrigins]))

const app = new Hono<{ Bindings: Env }>()

// CORS middleware should run before any database work so OPTIONS preflight
// can complete even if downstream services are unavailable.
app.use('/*', cors({
  origin: (origin) => {
    if (!origin) {
      return allowedOrigins[0]
    }

    return allowedOrigins.includes(origin) ? origin : ''
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))

// Initialize database based on environment
app.use('*', async (c, next) => {
  if (c.req.method === 'OPTIONS') {
    await next()
    return
  }

  // For Cloudflare Workers, initialize with D1 binding
  if (c.env?.DB) {
    const dbClient = initializeDatabase(c.env.DB)
    await dbClient.init()
  } else {
    // For local development, use SQLite
    const dbClient = initializeDatabase()
    await dbClient.init()
  }
  await next()
})

// Health check endpoint
app.get('/api/health', (c) => {
  return c.json({ 
    status: 'ok', 
    message: 'TaskManager API is running',
    database: process.env.DATABASE_TYPE || 'd1',
    timestamp: new Date().toISOString()
  })
})

// Auth routes
app.post('/api/auth/login', login)
app.post('/api/auth/register', register)
app.post('/api/auth/logout', logout)

// Admin routes
app.post('/api/admin/login', loginAdmin)
app.post('/api/admin/logout', logoutAdmin)
app.get('/api/admin/users', authMiddleware, getAllUsers)
app.get('/api/admin/tasks', authMiddleware, getAllTasks)
app.put('/api/admin/users/:id', authMiddleware, updateUserById)
app.put('/api/admin/tasks/:id/status', authMiddleware, updateTaskStatusAdmin)

// User routes
app.get('/api/user/profile', authMiddleware, getProfile)
app.put('/api/user/profile', authMiddleware, updateProfile)

// Task routes
app.get('/api/tasks', authMiddleware, getUserTasks)
app.get('/api/tasks/:id', authMiddleware, getTaskById)
app.post('/api/tasks', authMiddleware, createTask)
app.put('/api/tasks/:id/status', authMiddleware, updateTaskStatus)
app.put('/api/tasks/:id', authMiddleware, updateTask)
app.delete('/api/tasks/:id', authMiddleware, deleteTask)

const port = process.env.PORT || 8080

export default {
  port,
  fetch: app.fetch,
}
export const config = {
  runtime: 'bun',
};