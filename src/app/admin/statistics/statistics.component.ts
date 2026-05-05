import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../core/services/admin.service';
import { extractList } from '../../core/utils/api-response';

interface PerformerItem {
  name: string;
  tasksCompleted: number;
  avgTime: string;
  performance: number;
}

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})
export class StatisticsComponent implements OnInit {
  topPerformers: PerformerItem[] = [];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadTopPerformers();
  }

  loadTopPerformers(): void {
    this.adminService.getEmployeeStatistics().subscribe({
      next: response => {
        const employees = extractList<any>((response as any).data?.employees ?? response);
        this.topPerformers = employees.map(employee => ({
          name: `${employee.user?.firstname ?? ''} ${employee.user?.lastname ?? ''}`.trim(),
          tasksCompleted: employee.tasksCompleted ?? 0,
          avgTime: employee.avgTime ?? 'N/A',
          performance: employee.performance ?? 0
        }));
      },
      error: error => alert(error.error?.message ?? 'Unable to load statistics')
    });
  }
}
