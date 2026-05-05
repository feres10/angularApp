import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectService } from '../../core/services/project.service';
import { extractList } from '../../core/utils/api-response';

interface MyProjectItem {
  id: string;
  name: string;
  description: string;
  status: string;
  manager: string;
  dueDate: string;
  progress: number;
}

@Component({
  selector: 'app-my-projects',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-projects.component.html',
  styleUrls: ['./my-projects.component.css']
})
export class MyProjectsComponent implements OnInit {
  myProjects: MyProjectItem[] = [];

  constructor(private projectService: ProjectService) {}

  ngOnInit(): void {
    this.loadMyProjects();
  }

  loadMyProjects(): void {
    this.projectService.getMyProjects(0, 100).subscribe({
      next: response => {
        this.myProjects = extractList<any>(response).map(project => ({
          id: String(project.id),
          name: project.name ?? project.title ?? '',
          description: project.description ?? '',
          status: project.status ?? 'ACTIVE',
          manager: project.owner?.user ? `${project.owner.user.firstname ?? ''} ${project.owner.user.lastname ?? ''}`.trim() : 'No manager',
          dueDate: project.endDate ?? '',
          progress: project.progress ?? (project.status === 'COMPLETED' ? 100 : 0)
        }));
      },
      error: error => alert(error.error?.message ?? 'Unable to load projects')
    });
  }

  onViewProject(projectId: string): void {
    this.projectService.getProjectById(Number(projectId)).subscribe({
      next: response => {
        const project = (response as any).data ?? response;
        alert(`${project.title ?? project.name}\n\n${project.description ?? ''}`);
      },
      error: error => alert(error.error?.message ?? 'Unable to load project')
    });
  }

  onEditProject(projectId: string): void {
    alert('Project editing is reserved for admins.');
  }
}
