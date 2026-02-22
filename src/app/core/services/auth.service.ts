import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';

import { AuthUser, JwtPayload, LoginRequest } from '../models';
import { environment } from '../../../environments/environment';

const ACCESS_TOKEN_KEY = 'access_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly currentUser = signal<AuthUser | null>(null);
  private readonly tokenExpiration = signal<number>(0);

  readonly user = this.currentUser.asReadonly();
  readonly isAuthenticated = computed(() => {
    const user = this.currentUser();
    const exp = this.tokenExpiration();
    return user !== null && exp > Date.now();
  });

  constructor() {
    this.restoreSession();
  }

  /**
   * Llama al endpoint real POST /auth/login.
   * La respuesta puede devolver el token en distintas formas;
   * se normaliza buscando 'token', 'accessToken' o 'access_token'.
   */
  login(credentials: LoginRequest): Observable<unknown> {
    return this.http
      .post<Record<string, unknown>>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap((response) => {
          const token = this.extractToken(response);
          if (!token) {
            throw new Error('No se recibió token del servidor');
          }
          this.storeToken(token);

          const payload = this.decodeJwt(token);
          const claims = (payload ?? {}) as Record<string, unknown>;

          const expValue = claims['exp'];
          const expSeconds =
            typeof expValue === 'number'
              ? expValue
              : typeof expValue === 'string'
                ? Number(expValue)
                : NaN;

          const email =
            typeof claims['email'] === 'string' ? claims['email'] : credentials.email;

          const nameClaim =
            claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
          const name =
            typeof nameClaim === 'string'
              ? nameClaim
              : typeof claims['name'] === 'string'
                ? claims['name']
                : email;

          const id =
            typeof claims['sub'] === 'string'
              ? claims['sub']
              : typeof claims['uid'] === 'string'
                ? claims['uid']
                : '';

          if (payload && Number.isFinite(expSeconds) && expSeconds > 0) {
            const expirationMs = expSeconds * 1000;
            this.currentUser.set({
              id,
              email,
              name,
            });
            this.tokenExpiration.set(expirationMs);
          } else {
            // Si no se puede decodificar, confiamos en que es válido 1h
            this.currentUser.set({
              id: '',
              email: credentials.email,
              name: credentials.email,
            });
            this.tokenExpiration.set(Date.now() + 3600 * 1000);
          }
        }),
        catchError((error) => {
          return throwError(() => error);
        }),
      );
  }

  logout(): void {
    this.currentUser.set(null);
    this.tokenExpiration.set(0);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
    this.router.navigate(['/auth/login']);
  }

  getAccessToken(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  private storeToken(token: string): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  }

  private restoreSession(): void {
    const token = this.getAccessToken();
    if (!token) return;

    const payload = this.decodeJwt(token);
    if (!payload) return;

    const claims = payload as Record<string, unknown>;
    const expValue = claims['exp'];
    const expSeconds =
      typeof expValue === 'number'
        ? expValue
        : typeof expValue === 'string'
          ? Number(expValue)
          : NaN;

    if (!Number.isFinite(expSeconds) || expSeconds <= 0) {
      this.logout();
      return;
    }

    const expirationMs = expSeconds * 1000;
    if (expirationMs <= Date.now()) {
      this.logout();
      return;
    }

    const email = typeof claims['email'] === 'string' ? claims['email'] : '';
    const nameClaim = claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
    const name =
      typeof nameClaim === 'string'
        ? nameClaim
        : typeof claims['name'] === 'string'
          ? claims['name']
          : email;

    this.currentUser.set({
      id:
        typeof claims['sub'] === 'string'
          ? claims['sub']
          : typeof claims['uid'] === 'string'
            ? claims['uid']
            : '',
      email,
      name,
    });
    this.tokenExpiration.set(expirationMs);
  }

  private extractToken(response: Record<string, unknown>): string | null {
    // Soporta: { token }, { accessToken }, { access_token }, { data: { token } }
    if (typeof response['token'] === 'string') return response['token'];
    if (typeof response['accessToken'] === 'string') return response['accessToken'];
    if (typeof response['access_token'] === 'string') return response['access_token'];
    const data = response['data'];
    if (data && typeof data === 'object') {
      const d = data as Record<string, unknown>;
      if (typeof d['token'] === 'string') return d['token'];
      if (typeof d['accessToken'] === 'string') return d['accessToken'];
    }
    return null;
  }

  private decodeJwt(token: string): JwtPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      return JSON.parse(atob(parts[1])) as JwtPayload;
    } catch {
      return null;
    }
  }
}
