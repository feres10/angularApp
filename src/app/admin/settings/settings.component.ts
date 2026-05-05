import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="settings-page">
      <h1>Settings</h1>
      <p>Application settings will be available here.</p>
    </section>
  `,
  styles: [`
    .settings-page {
      padding: 24px;
    }

    h1 {
      margin: 0 0 8px;
      color: var(--text-primary);
    }

    p {
      color: var(--text-secondary);
    }
  `]
})
export class SettingsComponent {}
