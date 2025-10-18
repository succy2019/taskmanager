export interface User {
  id: number
  userId: string
  email: string
  name: string
  password: string
  createdAt: Date
  updatedAt: Date
}

export interface Admin{
    id: number
    email: string
    password: string
    createdAt: Date
    updatedAt: Date
}

export interface TaskManager {

id: number
userId: string
name: string
description: string
status: 'pending' | 'in-progress' | 'completed'
createdAt: Date
updatedAt: Date
}