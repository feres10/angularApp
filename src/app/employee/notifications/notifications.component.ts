import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../core/services/notification.service';
import { extractList } from '../../core/utils/api-response';

interface MyNotificationItem {
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
  myNotifications: MyNotificationItem[] = [];

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.loadMyNotifications();
  }

  loadMyNotifications(): void {
    this.notificationService.getUserNotifications(0, 100).subscribe({
      next: response => {
        this.myNotifications = extractList<any>(response).map(notification => ({
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
      case 'task_assigned':
        return 'T';
      case 'task_overdue':
      case 'deadline':
        return '!';
      case 'message_new':
      case 'comment':
        return 'M';
      default:
        return 'N';
    }
  }

  onDeleteNotification(notifId: string): void {
    if (!confirm('Delete this notification?')) return;

    this.notificationService.deleteNotification(Number(notifId)).subscribe({
      next: () => this.loadMyNotifications(),
      error: error => alert(error.error?.message ?? 'Unable to delete notification')
    });
  }

  onMarkAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => this.loadMyNotifications(),
      error: error => alert(error.error?.message ?? 'Unable to mark notifications as read')
    });
  }
}
