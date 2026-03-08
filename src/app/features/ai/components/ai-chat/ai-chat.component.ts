import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  ViewChild,
  ElementRef,
  AfterViewChecked,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AiChatService, ChatMessage } from '../../services/ai-chat.service';

@Component({
  selector: 'app-ai-chat',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, DatePipe],
  templateUrl: './ai-chat.html',
  styleUrl: './ai-chat.css',
})
export class AiChatComponent implements AfterViewChecked {
  private readonly aiChatService = inject(AiChatService);

  @ViewChild('messagesContainer') messagesContainer!: ElementRef<HTMLDivElement>;

  readonly messages = this.aiChatService.messages;
  readonly isLoading = this.aiChatService.isLoading;
  readonly isOpen = this.aiChatService.isOpen;

  readonly inputMessage = signal('');
  private shouldScrollToBottom = false;

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  close(): void {
    this.aiChatService.close();
  }

  clearMessages(): void {
    this.aiChatService.clearMessages();
  }

  sendMessage(): void {
    const msg = this.inputMessage().trim();
    if (!msg || this.isLoading()) return;

    this.inputMessage.set('');
    this.shouldScrollToBottom = true;

    this.aiChatService.sendMessage(msg).subscribe({
      next: () => {
        this.shouldScrollToBottom = true;
      },
      error: (err: unknown) => {
        console.error('Error al enviar mensaje:', err);
      },
    });
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  trackByIndex(index: number, _item: ChatMessage): number {
    return index;
  }

  private scrollToBottom(): void {
    if (this.messagesContainer) {
      const el = this.messagesContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }
}
