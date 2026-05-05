import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../core/services/task.service';
import { extractList } from '../../core/utils/api-response';

interface EventItem {
  id: string;
  title: string;
  date: string;
  time: string;
  type: string;
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {
  currentMonth = new Date().toLocaleString('en-US', { month: 'long' });
  currentYear = String(new Date().getFullYear());
  calendarDays: number[] = [];
  upcomingEvents: EventItem[] = [];

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.initializeCalendar();
    this.loadUpcomingEvents();
  }

  initializeCalendar(): void {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    this.calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }

  loadUpcomingEvents(): void {
    this.taskService.getAllTasks(0, 100).subscribe({
      next: response => {
        this.upcomingEvents = extractList<any>(response)
          .filter(task => task.dueDate)
          .map(task => ({
            id: String(task.id),
            title: task.title ?? '',
            date: task.dueDate,
            time: 'Deadline',
            type: task.priority ?? 'Task'
          }));
      },
      error: error => alert(error.error?.message ?? 'Unable to load calendar')
    });
  }

  onNewEvent(): void {
    alert('Create events by creating tasks with due dates.');
  }

  onDeleteEvent(eventId: string): void {
    if (!confirm('Delete this task deadline?')) return;
    this.taskService.deleteTask(Number(eventId)).subscribe({
      next: () => this.loadUpcomingEvents(),
      error: error => alert(error.error?.message ?? 'Unable to delete task')
    });
  }

  hasEvent(day: number): boolean {
    const suffix = `-${day < 10 ? '0' + day : day}`;
    return this.upcomingEvents.some(event => event.date.endsWith(suffix));
  }
}
