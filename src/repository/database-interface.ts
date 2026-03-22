import { User, TaskManager, Admin } from '../models/index'

// Database interface that both implementations must follow
export interface DatabaseInterface {
    // User methods
    createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> | User
    getUserByEmail(email: string): Promise<User | null> | User | null
    getUserById(userId: string): Promise<User | null> | User | null
    userlogin(email: string, password: string): Promise<User | null> | User | null
    updateUser(userId: string, name: string, email: string): Promise<boolean> | boolean
    getAllUsers(): Promise<User[]> | User[]
    
    // Task methods
    createTask(task: Omit<TaskManager, 'id' | 'createdAt' | 'updatedAt'>): Promise<TaskManager> | TaskManager
    getTasksByUserId(userId: string): Promise<TaskManager[]> | TaskManager[]
    getTaskById(id: number): Promise<TaskManager | null> | TaskManager | null
    updateTaskStatus(id: number, status: 'pending' | 'in-progress' | 'completed'): Promise<boolean> | boolean
    updateTask(id: number, name: string, description: string, status: 'pending' | 'in-progress' | 'completed'): Promise<boolean> | boolean
    deleteTaskById(id: number): Promise<boolean> | boolean
    getAllTasks(): Promise<TaskManager[]> | TaskManager[]
    getTasksForUser(userId: string): Promise<TaskManager[]> | TaskManager[]
    
    // Admin methods
    getAdminByEmailAndPassword(email: string, password: string): Promise<Admin | null> | Admin | null
    createAdmin(admin: Omit<Admin, 'id' | 'createdAt' | 'updatedAt'>): Promise<Admin> | Admin
    loginAdmin(email: string, password: string): Promise<Admin | null> | Admin | null
}