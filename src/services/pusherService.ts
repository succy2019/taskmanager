const Pusher = require('pusher');

class PusherService {
  private pusher: any;

  constructor() {
    this.pusher = new Pusher({
      appId: process.env.PUSHER_APP_ID || '',
      key: process.env.PUSHER_KEY || '',
      secret: process.env.PUSHER_SECRET || '',
      cluster: process.env.PUSHER_CLUSTER || 'us2',
      useTLS: true,
    });
  }

  // Task-related notifications
  async notifyTaskCreated(userId: string, task: any) {
    try {
      await this.pusher.trigger(`user-${userId}`, 'task-created', {
        message: `New task "${task.name}" created`,
        task: task,
        timestamp: new Date().toISOString()
      });

      // Also notify admins
      await this.pusher.trigger('admin-channel', 'task-created', {
        message: `User ${userId} created task "${task.name}"`,
        task: task,
        userId: userId,
        timestamp: new Date().toISOString()
      });

      console.log(`✅ Pusher: Task created notification sent for user ${userId}`);
    } catch (error) {
      console.error('❌ Pusher: Error sending task created notification:', error);
    }
  }

  async notifyTaskUpdated(userId: string, task: any, updateType: 'status' | 'details') {
    try {
      const message = updateType === 'status' 
        ? `Task "${task.name}" status changed to ${task.status}`
        : `Task "${task.name}" details updated`;

      await this.pusher.trigger(`user-${userId}`, 'task-updated', {
        message: message,
        task: task,
        updateType: updateType,
        timestamp: new Date().toISOString()
      });

      // Also notify admins
      await this.pusher.trigger('admin-channel', 'task-updated', {
        message: `User ${userId}: ${message}`,
        task: task,
        userId: userId,
        updateType: updateType,
        timestamp: new Date().toISOString()
      });

      console.log(`✅ Pusher: Task ${updateType} notification sent for user ${userId}`);
    } catch (error) {
      console.error('❌ Pusher: Error sending task updated notification:', error);
    }
  }

  async notifyTaskDeleted(userId: string, taskName: string, taskId: number) {
    try {
      await this.pusher.trigger(`user-${userId}`, 'task-deleted', {
        message: `Task "${taskName}" deleted`,
        taskId: taskId,
        taskName: taskName,
        timestamp: new Date().toISOString()
      });

      // Also notify admins
      await this.pusher.trigger('admin-channel', 'task-deleted', {
        message: `User ${userId} deleted task "${taskName}"`,
        taskId: taskId,
        taskName: taskName,
        userId: userId,
        timestamp: new Date().toISOString()
      });

      console.log(`✅ Pusher: Task deleted notification sent for user ${userId}`);
    } catch (error) {
      console.error('❌ Pusher: Error sending task deleted notification:', error);
    }
  }

  // Admin-specific notifications
  async notifyUserAction(action: 'login' | 'register', user: any) {
    try {
      await this.pusher.trigger('admin-channel', 'user-action', {
        message: `User ${user.name} ${action === 'login' ? 'logged in' : 'registered'}`,
        action: action,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        },
        timestamp: new Date().toISOString()
      });

      console.log(`✅ Pusher: User ${action} notification sent to admins`);
    } catch (error) {
      console.error(`❌ Pusher: Error sending user ${action} notification:`, error);
    }
  }

  async notifyAdminAction(adminId: string, action: string, details: any) {
    try {
      await this.pusher.trigger('admin-channel', 'admin-action', {
        message: `Admin performed: ${action}`,
        action: action,
        adminId: adminId,
        details: details,
        timestamp: new Date().toISOString()
      });

      console.log(`✅ Pusher: Admin action notification sent`);
    } catch (error) {
      console.error('❌ Pusher: Error sending admin action notification:', error);
    }
  }

  // General system notifications
  async sendCustomNotification(channel: string, event: string, data: any) {
    try {
      await this.pusher.trigger(channel, event, {
        ...data,
        timestamp: new Date().toISOString()
      });

      console.log(`✅ Pusher: Custom notification sent to ${channel}`);
    } catch (error) {
      console.error('❌ Pusher: Error sending custom notification:', error);
    }
  }

  // Health check for Pusher connection
  async testConnection() {
    try {
      await this.pusher.trigger('test-channel', 'test-event', {
        message: 'Pusher connection test',
        timestamp: new Date().toISOString()
      });
      console.log('✅ Pusher: Connection test successful');
      return true;
    } catch (error) {
      console.error('❌ Pusher: Connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const pusherService = new PusherService();
export default pusherService;