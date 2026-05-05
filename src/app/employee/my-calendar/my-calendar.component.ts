import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../core/services/task.service';
import { extractList } from '../../core/utils/api-response';

interface EventItem {
  id: string;
  title: string;
  date: string;
  time: string;
}

@Component({
  selector: 'app-my-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-calendar.component.html',
  styleUrls: ['./my-calendar.component.css']
})
export class MyCalendarComponent implements OnInit {
  currentMonth = new Date().toLocaleString('en-US', { month: 'long' });
  currentYear = String(new Date().getFullYear());
  calendarDays: number[] = [];
  myEvents: EventItem[] = [];

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.initializeCalendar();
    this.loadMyEvents();
  }

  initializeCalendar(): void {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    this.calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }

  loadMyEvents(): void {
    this.taskService.getMyTasks(0).subscribe({
      next: response => {
        this.myEvents = extractList<any>(response)
          .filter(task => task.dueDate)
          .map(task => ({
            id: String(task.id),
            title: task.title ?? '',
            date: task.dueDate,
            time: 'Deadline'
          }));
      },
      error: error => alert(error.error?.message ?? 'Unable to load calendar')
    });
  }

  hasEvent(day: number): boolean {
    const suffix = `-${day < 10 ? '0' + day : day}`;
    return this.myEvents.some(event => event.date.endsWith(suffix));
  }
}
