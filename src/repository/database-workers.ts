import { DatabaseInterface } from './database-interface'
import { D1DbClient } from './d1-db'

// Database factory for Cloudflare Workers - only supports D1
function createDatabase(d1Database?: D1Database): DatabaseInterface {
  if (d1Database) {
    console.log('🔗 Using Cloudflare D1 database')
    return new D1DbClient(d1Database)
  } else {
    throw new Error('D1 database binding required for Cloudflare Workers')
  }
}

// Wrapper class to handle async/await uniformly
export class DbClient {
    private client: DatabaseInterface
    
    constructor(d1Database?: D1Database) {
        this.client = createDatabase(d1Database)
    }

    async init() {
        // Initialize D1 tables
        if (this.client instanceof D1DbClient) {
            await (this.client as D1DbClient).init()
        }
    }

    // User methods
    async createUser(user: Parameters<DatabaseInterface['createUser']>[0]) {
        const result = this.client.createUser(user)
        return result instanceof Promise ? await result : result
    }

    async getUserByEmail(email: string) {
        const result = this.client.getUserByEmail(email)
        return result instanceof Promise ? await result : result
    }

    async getUserById(userId: string) {
        const result = this.client.getUserById(userId)
        return result instanceof Promise ? await result : result
    }

    async userlogin(email: string, password: string) {
        const result = this.client.userlogin(email, password)
        return result instanceof Promise ? await result : result
    }

    async getAllUsers() {
        const result = this.client.getAllUsers()
        return result instanceof Promise ? await result : result
    }

    async updateUser(userId: string, name: string, email: string) {
        const result = this.client.updateUser(userId, name, email)
        return result instanceof Promise ? await result : result
    }

    // Task methods
    async createTask(task: Parameters<DatabaseInterface['createTask']>[0]) {
        const result = this.client.createTask(task)
        return result instanceof Promise ? await result : result
    }

    async getTasksByUserId(userId: string) {
        const result = this.client.getTasksByUserId(userId)
        return result instanceof Promise ? await result : result
    }

    async getTaskById(id: number) {
        const result = this.client.getTaskById(id)
        return result instanceof Promise ? await result : result
    }

    async updateTaskStatus(id: number, status: 'pending' | 'in-progress' | 'completed') {
        const result = this.client.updateTaskStatus(id, status)
        return result instanceof Promise ? await result : result
    }

    async updateTask(id: number, name: string, description: string, status: 'pending' | 'in-progress' | 'completed') {
        const result = this.client.updateTask(id, name, description, status)
        return result instanceof Promise ? await result : result
    }

    async deleteTaskById(id: number) {
        const result = this.client.deleteTaskById(id)
        return result instanceof Promise ? await result : result
    }

    async getAllTasks() {
        const result = this.client.getAllTasks()
        return result instanceof Promise ? await result : result
    }

    async getTasksForUser(userId: string) {
        const result = this.client.getTasksForUser(userId)
        return result instanceof Promise ? await result : result
    }

    // Admin methods
    async getAdminByEmailAndPassword(email: string, password: string) {
        const result = this.client.getAdminByEmailAndPassword(email, password)
        return result instanceof Promise ? await result : result
    }

    async createAdmin(admin: Parameters<DatabaseInterface['createAdmin']>[0]) {
        const result = this.client.createAdmin(admin)
        return result instanceof Promise ? await result : result
    }

    async loginAdmin(email: string, password: string) {
        const result = this.client.loginAdmin(email, password)
        return result instanceof Promise ? await result : result
    }
}

// Create singleton instance
let dbClient: DbClient

export function initializeDatabase(d1Database?: D1Database) {
    if (!dbClient) {
        dbClient = new DbClient(d1Database)
    }
    return dbClient
}

export function getDbClient() {
    if (!dbClient) {
        throw new Error('Database not initialized. Call initializeDatabase first.')
    }
    return dbClient
}

// For backward compatibility - create default instance when needed
let defaultDbClient: DbClient | null = null

export { 
    defaultDbClient as dbClient,
    defaultDbClient as default
}

// Initialize default client when imported (fallback)
if (!defaultDbClient) {
    try {
        defaultDbClient = new DbClient()
    } catch (e) {
        // Will be initialized later with D1 binding
    }
}