import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { ApiService } from '../../../core/services';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface AiChatResponse {
  response: string;
  sessionId: string;
}

@Injectable({ providedIn: 'root' })
export class AiChatService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'ai/chat';

  readonly isOpen = signal(false);
  readonly messages = signal<ChatMessage[]>([]);
  readonly isLoading = signal(false);

  private readonly sessionId = signal<string | null>(null);

  toggle(): void {
    this.isOpen.update((v) => !v);
  }

  open(): void {
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }

  sendMessage(message: string): Observable<AiChatResponse> {
    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date(),
    };
    this.messages.update((msgs) => [...msgs, userMessage]);
    this.isLoading.set(true);

    const body: Record<string, string> = { message };
    const sid = this.sessionId();
    if (sid) {
      body['sessionId'] = sid;
    }

    return this.api.post<AiChatResponse>(this.endpoint, body).pipe(
      tap({
        next: (res) => {
          this.sessionId.set(res.sessionId);
          const assistantMessage: ChatMessage = {
            role: 'assistant',
            content: res.response,
            timestamp: new Date(),
          };
          this.messages.update((msgs) => [...msgs, assistantMessage]);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        },
      }),
    );
  }

  clearMessages(): void {
    this.messages.set([]);
    this.sessionId.set(null);
  }
}
