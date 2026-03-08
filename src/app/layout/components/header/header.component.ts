import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';

import { AuthService } from '../../../core/services';
import { AiChatService } from '../../../features/ai/services/ai-chat.service';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class HeaderComponent {
  private readonly authService = inject(AuthService);
  private readonly aiChatService = inject(AiChatService);

  readonly userName = computed(() => this.authService.user()?.name ?? '');
  readonly aiChatOpen = this.aiChatService.isOpen;

  toggleAiChat(): void {
    this.aiChatService.toggle();
  }

  logout(): void {
    this.authService.logout();
  }
}
