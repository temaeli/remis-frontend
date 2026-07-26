import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { settings$ } from '@core/settings/settings.store';

interface FeatureCard {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-home',
  imports: [MatIconModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  animation = settings$.value.animations?.auth;

  private router = inject(Router);

  goToLogin() {
    this.router.navigate(['/auth/login']);
  }

  lodgeFeedback() {
    this.router.navigate(['/anonymous/inquiry']);
  }

  features: FeatureCard[] = [
    {
      icon: 'petroleum',
      title: 'Gas Distribution & Operations Management',
      description:
        'Monitor, manage, and control gas distribution networks, operational activities, and service areas through a centralized and integrated platform.',
    },
    {
      icon: 'desk',
      title: 'Asset & Infrastructure Management',
      description:
        'Track pipelines, regulators, meters, stations, and maintenance schedules with full lifecycle visibility and preventive maintenance controls.',
    },
    {
      icon: 'report',
      title: 'Billing, Reporting & Compliance',
      description:
        'Automate customer billing, consumption tracking, operational reporting, and regulatory compliance with accurate, real-time insights.',
    },
  ];

  stats = [
    { value: '1', label: 'Integrated GASCO Enterprise Platform' },
    { value: '8+', label: 'Core Operational & Administrative Modules' },
    { value: '100%', label: 'Safety & Regulatory Compliance Focused' },
  ];
}
