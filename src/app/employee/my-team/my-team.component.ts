import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamService } from '../../core/services/team.service';
import { extractList } from '../../core/utils/api-response';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  status: string;
}

@Component({
  selector: 'app-my-team',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-team.component.html',
  styleUrls: ['./my-team.component.css']
})
export class MyTeamComponent implements OnInit {
  teamMembers: TeamMember[] = [];
  teamName = '';
  teamDescription = '';
  teamLeader = '';

  constructor(private teamService: TeamService) {}

  ngOnInit(): void {
    this.loadTeamMembers();
  }

  loadTeamMembers(): void {
    this.teamService.getAllTeams(0, 100).subscribe({
      next: response => {
        const teams = extractList<any>(response);
        const team = teams[0];
        this.teamName = team?.name ?? '';
        this.teamDescription = team?.description ?? '';
        this.teamLeader = this.employeeName(team?.leader);
        this.teamMembers = (team?.members ?? []).map((member: any) => ({
          id: String(member.id),
          name: this.employeeName(member.employee),
          role: member.employee?.category?.name ?? 'Member',
          email: member.employee?.user?.email ?? '',
          status: 'Active'
        }));
      },
      error: error => alert(error.error?.message ?? 'Unable to load team')
    });
  }

  private employeeName(employee: any): string {
    if (!employee?.user) return '';
    return `${employee.user.firstname ?? employee.user.firstName ?? ''} ${employee.user.lastname ?? employee.user.lastName ?? ''}`.trim();
  }
}
