import { Database } from 'bun:sqlite'
import { User, TaskManager, Admin } from '../models/index'
// Initialize database connection


export class DbClient {
    private db: Database
    constructor() {
        this.db = new Database('taskmanager.db')
        this.db.run('PRAGMA foreign_keys = ON')
        this.db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    this.db.run(`
      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

        this.db.run(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('pending', 'in-progress', 'completed')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users (userId) ON DELETE CASCADE
      )
    `)

    }

    // User methods
    createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User {
        const stmt = this.db.prepare(
            'INSERT INTO users (userId, email, name, password) VALUES (?, ?, ?, ?)'
        )
        const result = stmt.run(user.userId, user.email, user.name, user.password)
        const createdUser = this.db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid) as User
        return createdUser
    }

    getUserByEmail(email: string): User | null {
        const stmt = this.db.prepare('SELECT * FROM users WHERE email = ?')
        const user = stmt.get(email) as User
        return user || null
    }
    
    getUserById(userId: string): User | null {
        const stmt = this.db.prepare(`
            SELECT id, userId, email, name, password, 
                   created_at as createdAt, updated_at as updatedAt 
            FROM users WHERE userId = ?
        `)
        const user = stmt.get(userId) as User
        return user || null
    }

    userlogin(email: string, password: string): User | null {
        const stmt = this.db.prepare(`
            SELECT id, userId, email, name, password, 
                   created_at as createdAt, updated_at as updatedAt 
            FROM users WHERE email = ? AND password = ?
        `)
        const user = stmt.get(email, password) as User
        return user || null
    }
    // Task methods
    createTask(task: Omit<TaskManager, 'id' | 'createdAt' | 'updatedAt'>): TaskManager {
        const stmt = this.db.prepare(
            'INSERT INTO tasks (userId, name, description, status) VALUES (?, ?, ?, ?)'
        )
        const result = stmt.run(task.userId, task.name, task.description, task.status)
        const createdTask = this.db.prepare(`
            SELECT id, userId, name, description, status, 
                   created_at as createdAt, updated_at as updatedAt 
            FROM tasks WHERE id = ?
        `).get(result.lastInsertRowid) as TaskManager
        return createdTask
    }

    getTasksByUserId(userId: string): TaskManager[] {
        const stmt = this.db.prepare(`
            SELECT id, userId, name, description, status, 
                   created_at as createdAt, updated_at as updatedAt 
            FROM tasks WHERE userId = ?
        `)
        const tasks = stmt.all(userId) as TaskManager[]
        return tasks
    }

    getTaskById(id: number): TaskManager | null {
        const stmt = this.db.prepare(`
            SELECT id, userId, name, description, status, 
                   created_at as createdAt, updated_at as updatedAt 
            FROM tasks WHERE id = ?
        `)
        const task = stmt.get(id) as TaskManager
        return task || null
    }
    updateTaskStatus(id: number, status: 'pending' | 'in-progress' | 'completed'): boolean {
        const stmt = this.db.prepare('UPDATE tasks SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        const result = stmt.run(status, id)
        return result.changes > 0
    }

    updateTask(id: number, name: string, description: string, status: 'pending' | 'in-progress' | 'completed'): boolean {
        const stmt = this.db.prepare('UPDATE tasks SET name = ?, description = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        const result = stmt.run(name, description, status, id)
        return result.changes > 0
    }

    deleteTaskById(id: number): boolean {
        const stmt = this.db.prepare('DELETE FROM tasks WHERE id = ?')
        const result = stmt.run(id)
        return result.changes > 0
    }

    // Admin methods
    getAdminByEmailAndPassword(email: string, password: string): Admin | null {
        const stmt = this.db.prepare('SELECT * FROM admins WHERE email = ? AND password = ?')
        const admin = stmt.get(email, password) as Admin
        return admin || null
    }

    createAdmin(admin: Omit<Admin, 'id' | 'createdAt' | 'updatedAt'>): Admin {
        const stmt = this.db.prepare('INSERT INTO admins (email, password) VALUES (?, ?)')
        const result = stmt.run(admin.email, admin.password)
        
        // Get the created admin with timestamps
        const createdAdmin = this.db.prepare('SELECT * FROM admins WHERE id = ?').get(result.lastInsertRowid) as Admin
        return createdAdmin
    }

    loginAdmin(email: string, password: string): Admin | null {
        return this.getAdminByEmailAndPassword(email, password)
    }

   //admin to get all users
   getAllUsers(): User[] {
    const stmt = this.db.prepare(`
        SELECT id, userId, email, name, password, 
               created_at as createdAt, updated_at as updatedAt 
        FROM users
    `)
    const users = stmt.all() as User[]
    return users
  }
  getAllTasks(): TaskManager[] {
    const stmt = this.db.prepare(`
        SELECT id, userId, name, description, status, 
               created_at as createdAt, updated_at as updatedAt 
        FROM tasks
    `)
    const tasks = stmt.all() as TaskManager[]
    return tasks
  }
  //get all task associated with a user
  getTasksForUser(userId: string): TaskManager[] {
    const stmt = this.db.prepare(`
        SELECT id, userId, name, description, status, 
               created_at as createdAt, updated_at as updatedAt 
        FROM tasks WHERE userId = ?
    `)
    const tasks = stmt.all(userId) as TaskManager[]
    return tasks
  }

  updateUser(userId: string, name: string, email: string): boolean {  
    const stmt = this.db.prepare('UPDATE users SET name = ?, email = ?, updated_at = CURRENT_TIMESTAMP WHERE userId = ?')
    const result = stmt.run(name, email, userId)
    return result.changes > 0
  }
}
export const dbClient = new DbClient()
export default dbClient