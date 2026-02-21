import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-loading',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center justify-center p-8">
      <div class="flex flex-col items-center gap-3">
        <div class="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600"></div>
        <span class="text-sm text-gray-500">Cargando...</span>
      </div>
    </div>
  `,
})
export class LoadingComponent {}
