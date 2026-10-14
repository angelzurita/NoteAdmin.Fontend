import { Component, ChangeDetectionStrategy, inject, computed, input, output } from '@angular/core';

import { AuthService, ConfigService } from '../../../core/services';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class HeaderComponent {
  private readonly authService = inject(AuthService);
  private readonly configService = inject(ConfigService);

  /** The side drawer is open (phones) */
  readonly menuOpen = input(false);
  /** Open/close the side drawer */
  readonly menuToggle = output<void>();

  readonly userName = computed(() => this.authService.user()?.name ?? '');
  /** Lab portal (Disciplina) for the back button; hidden when the server does not set one */
  readonly portalUrl = computed(() => this.configService.config().portal ?? null);

  logout(): void {
    this.authService.logout();
  }
}
