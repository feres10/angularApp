import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../core/services/notification.service';
import { extractList } from '../../core/utils/api-response';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  timestamp: string;
  isRead: boolean;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
  notifications: NotificationItem[] = [];

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.notificationService.getUserNotifications(0, 100).subscribe({
      next: response => {
        this.notifications = extractList<any>(response).map(notification => ({
          id: String(notification.id),
          title: notification.title ?? '',
          message: notification.content ?? notification.message ?? '',
          type: notification.notificationType ?? 'Info',
          timestamp: notification.createdAt ?? '',
          isRead: notification.isRead ?? false
        }));
      },
      error: error => alert(error.error?.message ?? 'Unable to load notifications')
    });
  }

  getIcon(type: string): string {
    switch (type.toLowerCase()) {
      case 'warning':
        return '!';
      case 'error':
        return 'x';
      case 'success':
      case 'task_completed':
        return 'ok';
      case 'info':
      default:
        return 'i';
    }
  }

  onSendNotification(): void {
    alert('Sending custom notifications is not available in the backend yet.');
  }

  onDeleteNotification(notificationId: string): void {
    if (!confirm('Delete this notification?')) return;

    this.notificationService.deleteNotification(Number(notificationId)).subscribe({
      next: () => this.loadNotifications(),
      error: error => alert(error.error?.message ?? 'Unable to delete notification')
    });
  }
}
