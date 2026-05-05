import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent {
  @Input() title: string = 'Notification';
  @Input() message: string = '';
  @Input() type: string = 'info'; // success, error, warning, info
  @Input() duration: number = 5000; // ms

  isVisible: boolean = false;

  show(): void {
    this.isVisible = true;
    setTimeout(() => {
      this.close();
    }, this.duration);
  }

  close(): void {
    this.isVisible = false;
  }

  getIcon(type: string): string {
    switch (type.toLowerCase()) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '🔔';
    }
  }
}
