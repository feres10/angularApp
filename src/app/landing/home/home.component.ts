import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface Technology {
  logo: string;
  name: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  features: Feature[] = [
    {
      icon: '📋',
      title: 'Project Management',
      description: 'Create, organize, and track projects with ease'
    },
    {
      icon: '✓',
      title: 'Task Tracking',
      description: 'Assign tasks and monitor progress in real-time'
    },
    {
      icon: '👥',
      title: 'Team Collaboration',
      description: 'Collaborate seamlessly with your team members'
    },
    {
      icon: '📊',
      title: 'Analytics & Reports',
      description: 'Get insights with comprehensive analytics'
    },
    {
      icon: '🔔',
      title: 'Notifications',
      description: 'Stay updated with instant notifications'
    },
    {
      icon: '🔒',
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security for your data'
    }
  ];

  technologies: Technology[] = [
    { logo: '⚡', name: 'Angular 16' },
    { logo: '🔧', name: 'Spring Boot' },
    { logo: '📦', name: 'PostgreSQL' },
    { logo: '🚀', name: 'Docker' }
  ];

  constructor() {}

  ngOnInit(): void {}
}
