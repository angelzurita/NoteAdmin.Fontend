import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';

@Component({
  selector: 'app-error',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rounded-lg border border-red-200 bg-red-50 p-4">
      <div class="flex items-center gap-2">
        <svg class="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-sm font-medium text-red-800">{{ message() }}</p>
      </div>
      @if (retryable()) {
        <button
          class="mt-3 rounded-md bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200 transition-colors"
          (click)="retry.emit()"
        >
          Reintentar
        </button>
      }
    </div>
  `,
})
export class ErrorComponent {
  readonly message = input.required<string>();
  readonly retryable = input(true);
  readonly retry = output<void>();
}
