import { User, TaskManager, Admin } from '../models/index'
import { DatabaseInterface } from './database-interface'

type D1PreparedStatement = {
    bind(...values: unknown[]): D1PreparedStatement
    run(): Promise<{ success: boolean; meta: { last_row_id: number; changes: number } }>
    first(): Promise<unknown>
    all(): Promise<{ results: unknown[] }>
}

type D1Database = {
    prepare(query: string): D1PreparedStatement
}

export class D1DbClient implements DatabaseInterface {
    private db: D1Database
    private initialized = false
    
    constructor(database: D1Database) {
        this.db = database
    }

    async init() {
        if (this.initialized) {
            return
        }

        // Create tables if they don't exist
        await this.db.prepare('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, userId TEXT UNIQUE NOT NULL, email TEXT UNIQUE NOT NULL, name TEXT NOT NULL, password TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP)').run()

        await this.db.prepare('CREATE TABLE IF NOT EXISTS admins (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP)').run()

        await this.db.prepare("CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, userId TEXT NOT NULL, name TEXT NOT NULL, description TEXT NOT NULL, status TEXT NOT NULL CHECK (status IN ('pending', 'in-progress', 'completed')), created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (userId) REFERENCES users (userId) ON DELETE CASCADE)").run()

        this.initialized = true
    }

    // User methods
    async createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
        const result = await this.db.prepare(
            'INSERT INTO users (userId, email, name, password) VALUES (?, ?, ?, ?)'
        ).bind(user.userId, user.email, user.name, user.password).run()
        
        const createdUser = await this.db.prepare('SELECT * FROM users WHERE id = ?').bind(result.meta.last_row_id).first() as User
        return createdUser
    }

    async getUserByEmail(email: string): Promise<User | null> {
        const user = await this.db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first() as User
        return user || null
    }

    async getUserById(userId: string): Promise<User | null> {
        const user = await this.db.prepare(`
            SELECT id, userId, email, name, password, 
                   created_at as createdAt, updated_at as updatedAt 
            FROM users WHERE userId = ?
        `).bind(userId).first() as User
        return user || null
    }

    async userlogin(email: string, password: string): Promise<User | null> {
        const user = await this.db.prepare(`
            SELECT id, userId, email, name, password, 
                   created_at as createdAt, updated_at as updatedAt 
            FROM users WHERE email = ? AND password = ?
        `).bind(email, password).first() as User
        return user || null
    }

    async getAllUsers(): Promise<User[]> {
        const result = await this.db.prepare(`
            SELECT id, userId, email, name, password, 
                   created_at as createdAt, updated_at as updatedAt 
            FROM users
        `).all()
        return result.results as User[]
    }

    async updateUser(userId: string, name: string, email: string): Promise<boolean> {
        const result = await this.db.prepare(
            'UPDATE users SET name = ?, email = ?, updated_at = CURRENT_TIMESTAMP WHERE userId = ?'
        ).bind(name, email, userId).run()
        return result.success && result.meta.changes > 0
    }

    // Task methods
    async createTask(task: Omit<TaskManager, 'id' | 'createdAt' | 'updatedAt'>): Promise<TaskManager> {
        const result = await this.db.prepare(
            'INSERT INTO tasks (userId, name, description, status) VALUES (?, ?, ?, ?)'
        ).bind(task.userId, task.name, task.description, task.status).run()
        
        const createdTask = await this.db.prepare(`
            SELECT id, userId, name, description, status, 
                   created_at as createdAt, updated_at as updatedAt 
            FROM tasks WHERE id = ?
        `).bind(result.meta.last_row_id).first() as TaskManager
        return createdTask
    }

    async getTasksByUserId(userId: string): Promise<TaskManager[]> {
        const result = await this.db.prepare(`
            SELECT id, userId, name, description, status, 
                   created_at as createdAt, updated_at as updatedAt 
            FROM tasks WHERE userId = ?
        `).bind(userId).all()
        return result.results as TaskManager[]
    }

    async getTaskById(id: number): Promise<TaskManager | null> {
        const task = await this.db.prepare(`
            SELECT id, userId, name, description, status, 
                   created_at as createdAt, updated_at as updatedAt 
            FROM tasks WHERE id = ?
        `).bind(id).first() as TaskManager
        return task || null
    }

    async updateTaskStatus(id: number, status: 'pending' | 'in-progress' | 'completed'): Promise<boolean> {
        const result = await this.db.prepare(
            'UPDATE tasks SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
        ).bind(status, id).run()
        return result.success && result.meta.changes > 0
    }

    async updateTask(id: number, name: string, description: string, status: 'pending' | 'in-progress' | 'completed'): Promise<boolean> {
        const result = await this.db.prepare(
            'UPDATE tasks SET name = ?, description = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
        ).bind(name, description, status, id).run()
        return result.success && result.meta.changes > 0
    }

    async deleteTaskById(id: number): Promise<boolean> {
        const result = await this.db.prepare('DELETE FROM tasks WHERE id = ?').bind(id).run()
        return result.success && result.meta.changes > 0
    }

    async getAllTasks(): Promise<TaskManager[]> {
        const result = await this.db.prepare(`
            SELECT id, userId, name, description, status, 
                   created_at as createdAt, updated_at as updatedAt 
            FROM tasks
        `).all()
        return result.results as TaskManager[]
    }

    async getTasksForUser(userId: string): Promise<TaskManager[]> {
        return this.getTasksByUserId(userId)
    }

    // Admin methods
    async getAdminByEmailAndPassword(email: string, password: string): Promise<Admin | null> {
        const admin = await this.db.prepare(
            'SELECT * FROM admins WHERE email = ? AND password = ?'
        ).bind(email, password).first() as Admin
        return admin || null
    }

    async createAdmin(admin: Omit<Admin, 'id' | 'createdAt' | 'updatedAt'>): Promise<Admin> {
        const result = await this.db.prepare(
            'INSERT INTO admins (email, password) VALUES (?, ?)'
        ).bind(admin.email, admin.password).run()
        
        const createdAdmin = await this.db.prepare('SELECT * FROM admins WHERE id = ?').bind(result.meta.last_row_id).first() as Admin
        return createdAdmin
    }

    async loginAdmin(email: string, password: string): Promise<Admin | null> {
        return this.getAdminByEmailAndPassword(email, password)
    }
}