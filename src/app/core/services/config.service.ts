import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../environments/environment';

/** What the server has enabled (GET /api/config) */
export interface AppConfig {
  /** Sign-in with the lab account (Cuenta Lab) instead of the local form */
  sso: boolean;
  /** Public URL of the lab account */
  cuenta?: string | null;
  /** Lab portal (Disciplina): where the "back" button goes */
  portal?: string | null;
}

const DEFAULT_CONFIG: AppConfig = { sso: false };

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private readonly http = inject(HttpClient);
  private readonly current = signal<AppConfig>(DEFAULT_CONFIG);

  readonly config = this.current.asReadonly();

  /** Loaded once before the app starts (provideAppInitializer) */
  async load(): Promise<void> {
    try {
      const cfg = await firstValueFrom(this.http.get<AppConfig>(`${environment.apiUrl}/config`));
      this.current.set({ ...DEFAULT_CONFIG, ...cfg });
    } catch {
      this.current.set(DEFAULT_CONFIG);
    }
  }
}
