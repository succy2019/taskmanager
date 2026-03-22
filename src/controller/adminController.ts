import { Context, Next } from 'hono'
import { sign } from 'hono/jwt'
import { setCookie } from 'hono/cookie'
import dbClient from '../repository/database'
import pusherService from '../services/pusherService'

function getAuthCookieOptions(c: Context) {
  const isSecureRequest = new URL(c.req.url).protocol === 'https:'

  return {
    httpOnly: true,
    secure: isSecureRequest,
    sameSite: (isSecureRequest ? 'None' : 'Lax') as 'None' | 'Lax',
    maxAge: 60 * 60 * 24,
    path: '/'
  }
}


export const loginAdmin = async (c: Context, next: Next) => {

    const { email, password } = await c.req.json()
    const admin = await dbClient.getAdminByEmailAndPassword(email, password)
    if (!admin) {
        return c.json({ message: 'Invalid email or password' }, 401)
    }
    try {
      const jwtSecret = c.env?.JWT_SECRET

      if (!jwtSecret) {
            console.error('JWT_SECRET environment variable is not set');
            return c.json({ message: 'Server configuration error' }, 500);
        }

        const payload = {
            id: admin.id,
            email: admin.email
        }
          const token = await sign(payload, jwtSecret, 'HS256')
          setCookie(c, 'authToken', token, getAuthCookieOptions(c))

        return c.json({
            message: 'Login successful',
            user: {
                id: admin.id,
                email: admin.email
            }
        }, 200)

    } catch (error) {
        console.error('Admin login error:', error);
        return c.json({ message: 'Internal server error' }, 500)
    }
}

export const logoutAdmin = async (c: Context) => {
    // Clear the authentication cookie
    setCookie(c, 'authToken', '', {
    ...getAuthCookieOptions(c),
        maxAge: 0, // Expire immediately
    })

    return c.json({ message: 'Logout successful' }, 200)
}

//admin to get all users
export const getAllUsers = async (c: Context) => {
    const users = await dbClient.getAllUsers()
    return c.json({ users }, 200)
}

//admin to get all tasks
export const getAllTasks = async (c: Context) => {
    const tasks = await dbClient.getAllTasks()
    return c.json({ tasks }, 200)
}

export const updateProfile = async (c: Context) => {
  const user = c.get("user") as { id: string; email: string };
  const { name } = await c.req.json();    
  if (!user) {
    return c.json({ message: "User not found" }, 404);
  }
  const updatedUser = await dbClient.updateUser(user.id, name, user.email);
  if (!updatedUser) {
    return c.json({ message: "Failed to update user" }, 500);
  }
  return c.json({ user: updatedUser }, 200);
};

//admin to update any user's profile
export const updateUserById = async (c: Context) => {
  try {
    const userId = c.req.param('id');
    const { name } = await c.req.json();    
    
    if (!userId || !name) {
      return c.json({ error: "User ID and name are required" }, 400);
    }
    
    // Get current user data first
    const currentUser = await dbClient.getUserById(userId);
    if (!currentUser) {
      return c.json({ error: "User not found" }, 404);
    }
    
    const updatedUser = await dbClient.updateUser(userId, name, currentUser.email);
    if (!updatedUser) {
      return c.json({ error: "Failed to update user" }, 500);
    }
    
    return c.json({ 
      message: "User updated successfully",
      user: updatedUser 
    }, 200);
  } catch (error) {
    console.error('Update user error:', error);
    return c.json({ error: "Internal server error" }, 500);
  }
};

//admin to update any task's status
export const updateTaskStatus = async (c: Context) => {
  try {
    const taskId = c.req.param('id');
    const { status } = await c.req.json();    
    
    if (!taskId || !status) {
      return c.json({ error: "Task ID and status are required" }, 400);
    }

    // Validate status
    const validStatuses = ['pending', 'in-progress', 'completed'];
    if (!validStatuses.includes(status)) {
      return c.json({ error: "Invalid status. Must be 'pending', 'in-progress', or 'completed'" }, 400);
    }
    
    const task = await dbClient.getTaskById(parseInt(taskId));
    if (!task) {
      return c.json({ error: "Task not found" }, 404);
    }
    
    const updatedTask = await dbClient.updateTaskStatus(parseInt(taskId), status);
    if (!updatedTask) {
      return c.json({ error: "Failed to update task status" }, 500);
    }
    
    // Send admin action notification
    const admin = c.get("user") as { id: string; email: string };
    await pusherService.notifyAdminAction(admin.id, `Updated task status to ${status}`, {
      taskId: parseInt(taskId),
      newStatus: status,
      taskName: task.name
    });
    
    // Also notify the task owner
    await pusherService.notifyTaskUpdated(task.userId, updatedTask, 'status');
    
    return c.json({ 
      message: "Task status updated successfully",
      task: updatedTask 
    }, 200);
  } catch (error) {
    console.error('Update task status error:', error);
    return c.json({ error: "Internal server error" }, 500);
  }
};