import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-calendar-wrapper',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar-wrapper.component.html',
  styleUrls: ['./calendar-wrapper.component.css']
})
export class CalendarWrapperComponent {
  @Input() calendarTitle: string = 'Calendar';
  @Input() viewMode: string = 'Month';
  @Input() events: any[] = [];

  constructor() {}

  ngOnInit(): void {
    // Initialize FullCalendar here
    // new Calendar(document.getElementById('calendar'), {
    //   initialView: 'dayGridMonth',
    //   events: this.events
    // }).render();
  }
}
