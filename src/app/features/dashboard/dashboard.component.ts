import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/services';

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent {
  private readonly authService = inject(AuthService);

  readonly greeting = computed(() => {
    const name = this.authService.user()?.name ?? 'Usuario';
    return `¡Bienvenido, ${name}!`;
  });
}
