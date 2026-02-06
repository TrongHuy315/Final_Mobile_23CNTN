import { AlarmManager, Alarm, AlarmTask } from './alarm-manager';
import { SoundManager } from './sound-manager';
import { NotificationManager } from './notification-manager';

/**
 * Task Orchestrator - Manages the complete task completion flow
 * Ensures all tasks are completed before alarm stops
 */
export class TaskOrchestrator {
  private static taskTimeouts: { [key: string]: NodeJS.Timeout } = {};
  private static completedTasks: Set<string> = new Set();

  /**
   * Start task sequence for an alarm
   */
  static async startTaskSequence(
    alarm: Alarm,
    onTaskStart?: (task: AlarmTask, index: number) => void,
    onTaskComplete?: () => void,
    onAllTasksComplete?: () => void
  ): Promise<void> {
    try {
      if (!alarm.tasks || alarm.tasks.length === 0) {
        console.log('✅ No tasks for this alarm');
        return;
      }

      this.completedTasks.clear();

      console.log(`🚀 Starting task sequence with ${alarm.tasks.length} tasks`);

      // Process tasks sequentially
      for (let i = 0; i < alarm.tasks.length; i++) {
        const task = alarm.tasks[i];
        console.log(`📋 Task ${i + 1}/${alarm.tasks.length}: ${task.type}`);

        if (onTaskStart) {
          onTaskStart(task, i);
        }

        // Send notification for this task
        await NotificationManager.sendTaskNotification(
          alarm.id,
          task.type,
          `Nhiệm vụ ${i + 1}/${alarm.tasks.length}`,
          task.name || `Hoàn thành nhiệm vụ: ${this.getTaskLabel(task.type)}`
        );

        // Wait for task completion (handled by UI component)
        // The UI component will call markTaskComplete()
        // Set timeout for task (default 5 minutes)
        const taskTimeout = task.settings?.timeLimit || 300000; // 5 minutes default

        await this.waitForTaskCompletion(task.id, taskTimeout, alarm.id);

        if (onTaskComplete) {
          onTaskComplete();
        }

        // Add slight delay before next task
        await this.delay(500);
      }

      // All tasks completed
      console.log('🎉 All tasks completed!');
      if (onAllTasksComplete) {
        onAllTasksComplete();
      }

      // Stop alarm completely
      await SoundManager.stopAlarm();
    } catch (error) {
      console.error('Error in task sequence:', error);
    }
  }

  /**
   * Mark a task as complete
   */
  static markTaskComplete(taskId: string): void {
    this.completedTasks.add(taskId);
    console.log(`✅ Task marked complete: ${taskId}`);
  }

  /**
   * Get task completion status
   */
  static isTaskComplete(taskId: string): boolean {
    return this.completedTasks.has(taskId);
  }

  /**
   * Wait for task completion with timeout
   */
  private static async waitForTaskCompletion(
    taskId: string,
    timeoutMs: number,
    alarmId: string
  ): Promise<void> {
    return new Promise((resolve) => {
      let completed = false;

      // Check for completion periodically
      const checkInterval = setInterval(() => {
        if (this.completedTasks.has(taskId)) {
          completed = true;
          clearInterval(checkInterval);
          clearTimeout(timeout);
          resolve();
        }
      }, 100);

      // Timeout handler
      const timeout = setTimeout(async () => {
        if (!completed) {
          console.warn(`⏱️ Task ${taskId} timed out, triggering alarm again`);
          clearInterval(checkInterval);

          // Restart alarm sound/vibration
          const alarms = await AlarmManager.loadAlarms();
          const alarm = alarms.find(a => a.id === alarmId);
          if (alarm) {
            await SoundManager.playAlarmSound(
              alarm.gentleWake === 'off' ? 'ringing' : 'gentle',
              alarm.volume / 100,
              true
            );
            if (alarm.vibration) {
              await SoundManager.playAlarmVibration();
            }
          }

          // Continue to next task or retry
          resolve();
        }
      }, timeoutMs);
    });
  }

  /**
   * Get human-readable task label
   */
  private static getTaskLabel(taskType: string): string {
    const labels: { [key: string]: string } = {
      'math': 'Giải toán',
      'tap_challenge': 'Nhấn nút',
      'shake': 'Lắc điện thoại',
      'face_detection': 'Quét khuôn mặt',
      'flash': 'Flash đèn',
    };
    return labels[taskType] || 'Nhiệm vụ';
  }

  /**
   * Reset orchestrator state
   */
  static reset(): void {
    this.completedTasks.clear();
    Object.values(this.taskTimeouts).forEach(timeout => clearTimeout(timeout));
    this.taskTimeouts = {};
    console.log('🔄 Task orchestrator reset');
  }

  /**
   * Helper delay function
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
