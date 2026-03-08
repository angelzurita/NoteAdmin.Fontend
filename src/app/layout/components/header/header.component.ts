import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';

import { AuthService } from '../../../core/services';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class HeaderComponent {
  private readonly authService = inject(AuthService);

  readonly userName = computed(() => this.authService.user()?.name ?? '');

  logout(): void {
    this.authService.logout();
  }
}
