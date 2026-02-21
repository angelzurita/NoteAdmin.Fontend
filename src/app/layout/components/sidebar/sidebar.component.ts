import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../../../core/services';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class SidebarComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly collapsed = signal(false);
  readonly user = this.authService.user;
  readonly userInitial = computed(() => this.user()?.name?.charAt(0).toUpperCase() ?? '?');

  readonly navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1', route: '/dashboard' },
    { label: 'Notas', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', route: '/notes' },
  ];

  toggleCollapse(): void {
    this.collapsed.update((v) => !v);
  }

  logout(): void {
    this.authService.logout();
  }
}
