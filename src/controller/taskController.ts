import { Context } from 'hono'
import dbClient from '../repository/database'
import pusherService from '../services/pusherService'

export const getUserTasks = async (c: Context) => {
  try {
    const user = c.get("user") as any;
    const userId = user.id; // JWT payload has 'id' field
    
    const tasks = dbClient.getTasksByUserId(userId);
    return c.json({ tasks }, 200);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return c.json({ message: 'Failed to fetch tasks' }, 500);
  }
}

export const createTask = async (c: Context) => {
  try {
    const user = c.get("user") as any;
    const userId = user.id; // JWT payload has 'id' field
    const { name, description } = await c.req.json();
    
    if (!name || !description) {
      return c.json({ message: "Name and description are required" }, 400);
    }
    
    const task = dbClient.createTask({
      userId: userId,
      name: name.trim(),
      description: description.trim(),
      status: 'pending'
    });
    
    // Send Pusher notification
    await pusherService.notifyTaskCreated(userId, task);
    
    return c.json({ 
      message: 'Task created successfully',
      task 
    }, 201);
  } catch (error) {
    console.error('Error creating task:', error);
    return c.json({ message: 'Failed to create task' }, 500);
  }
}

export const updateTaskStatus = async (c: Context) => {
  try {
    const user = c.get("user") as any;
    const userId = user.id;
    const taskId = parseInt(c.req.param('id'));
    const { status } = await c.req.json();
    
    if (!status || !['pending', 'in-progress', 'completed'].includes(status)) {
      return c.json({ message: "Valid status is required (pending, in-progress, completed)" }, 400);
    }
    
    if (isNaN(taskId)) {
      return c.json({ message: "Invalid task ID" }, 400);
    }
    
    // First, verify the task belongs to the user
    const tasks = dbClient.getTasksByUserId(userId);
    const userTask = tasks.find(task => task.id === taskId);
    
    if (!userTask) {
      return c.json({ message: "Task not found or you don't have permission to update it" }, 404);
    }
    
    const updated = dbClient.updateTaskStatus(taskId, status);
    
    if (!updated) {
      return c.json({ message: "Failed to update task status" }, 500);
    }
    
    // Get updated task for notification
    const updatedTask = dbClient.getTaskById(taskId);
    if (updatedTask) {
      await pusherService.notifyTaskUpdated(userId, updatedTask, 'status');
    }
    
    return c.json({ 
      message: "Task status updated successfully",
      taskId,
      newStatus: status
    }, 200);
  } catch (error) {
    console.error('Error updating task status:', error);
    return c.json({ message: 'Failed to update task status' }, 500);
  }
}

export const updateTask = async (c: Context) => {
  try {
    const user = c.get("user") as any;
    const userId = user.id;
    const taskId = parseInt(c.req.param('id'));
    const { name, description, status } = await c.req.json();
    
    if (isNaN(taskId)) {
      return c.json({ message: "Invalid task ID" }, 400);
    }
    
    // Verify the task belongs to the user
    const tasks = dbClient.getTasksByUserId(userId);
    const userTask = tasks.find(task => task.id === taskId);
    
    if (!userTask) {
      return c.json({ message: "Task not found or you don't have permission to update it" }, 404);
    }
    
    // Update task with new values or keep existing ones
    const updatedTask = {
      name: name?.trim() || userTask.name,
      description: description?.trim() || userTask.description,
      status: (status && ['pending', 'in-progress', 'completed'].includes(status)) ? status : userTask.status
    };
    
    const success = dbClient.updateTask(taskId, updatedTask.name, updatedTask.description, updatedTask.status);
    
    if (!success) {
      return c.json({ message: "Failed to update task" }, 500);
    }
    
    // Get updated task for notification
    const finalTask = dbClient.getTaskById(taskId);
    if (finalTask) {
      await pusherService.notifyTaskUpdated(userId, finalTask, 'details');
    }
    
    return c.json({ 
      message: "Task updated successfully",
      taskId
    }, 200);
  } catch (error) {
    console.error('Error updating task:', error);
    return c.json({ message: 'Failed to update task' }, 500);
  }
}

export const deleteTask = async (c: Context) => {
  try {
    const user = c.get("user") as any;
    const userId = user.id;
    const taskId = parseInt(c.req.param('id'));
    
    if (isNaN(taskId)) {
      return c.json({ message: "Invalid task ID" }, 400);
    }
    
    // Verify the task belongs to the user
    const tasks = dbClient.getTasksByUserId(userId);
    const userTask = tasks.find(task => task.id === taskId);
    
    if (!userTask) {
      return c.json({ message: "Task not found or you don't have permission to delete it" }, 404);
    }
    
    const deleted = dbClient.deleteTaskById(taskId);
    
    if (!deleted) {
      return c.json({ message: "Failed to delete task" }, 500);
    }
    
    // Send deletion notification
    await pusherService.notifyTaskDeleted(userId, userTask.name, taskId);
    
    return c.json({ 
      message: "Task deleted successfully",
      taskId
    }, 200);
  } catch (error) {
    console.error('Error deleting task:', error);
    return c.json({ message: 'Failed to delete task' }, 500);
  }
}

export const getTaskById = async (c: Context) => {
  try {
    const user = c.get("user") as any;
    const userId = user.id;
    const taskId = parseInt(c.req.param('id'));
    
    if (isNaN(taskId)) {
      return c.json({ message: "Invalid task ID" }, 400);
    }
    
    // Use the new database method
    const task = dbClient.getTaskById(taskId);
    
    if (!task) {
      return c.json({ message: "Task not found" }, 404);
    }
    
    // Verify the task belongs to the user
    if (task.userId !== userId) {
      return c.json({ message: "Task not found or you don't have permission to view it" }, 404);
    }
    
    return c.json({ task }, 200);
  } catch (error) {
    console.error('Error fetching task:', error);
    return c.json({ message: 'Failed to fetch task' }, 500);
  }
}