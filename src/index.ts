import 'dotenv/config'
import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'
import { cors } from 'hono/cors'
import { login, register, logout, getProfile } from './controller/userController'
import { loginAdmin, logoutAdmin, getAllUsers, getAllTasks, updateProfile, updateUserById, updateTaskStatus as updateTaskStatusAdmin } from './controller/adminController'
import { getUserTasks, createTask, updateTaskStatus, updateTask, deleteTask, getTaskById } from './controller/taskController'
import { authMiddleware } from './middleware/authmiddleware'

const app = new Hono()

// CORS middleware
app.use('/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))

// Serve static files
app.use('/static/*', serveStatic({ root: './' }))
app.get('/', serveStatic({ path: './public/index.html' }))

// Serve dashboard pages
app.get('/admin-login.html', serveStatic({ path: './public/admin-login.html' }))
app.get('/admin-dashboard.html', serveStatic({ path: './public/admin-dashboard.html' }))
app.get('/user-dashboard.html', serveStatic({ path: './public/user-dashboard.html' }))

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