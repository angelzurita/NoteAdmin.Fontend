import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

import { AuthUser, JwtPayload, LoginRequest } from '../models';
import { environment } from '../../../environments/environment';
import { ConfigService } from './config.service';

const ACCESS_TOKEN_KEY = 'access_token';
const NAME_CLAIM = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name';
const LAB_FRAGMENT = '#lab=';

/** Decodes a JWT payload (base64url + UTF-8). Returns null if it is not a JWT. */
export function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const bytes = Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes)) as JwtPayload;
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly configService = inject(ConfigService);
  private readonly currentUser = signal<AuthUser | null>(null);
  private readonly tokenExpiration = signal<number>(0);
  private redirecting = false;

  readonly user = this.currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUser() !== null && this.tokenExpiration() > Date.now());

  /** True when the server signs in with the lab account (no local form) */
  get usesLabAccount(): boolean {
    return this.configService.config().sso;
  }

  constructor() {
    this.takeTokenFromFragment();
    this.restoreSession();
  }

  /** Local sign-in (only when the server does not use the lab account) */
  login(credentials: LoginRequest): Observable<unknown> {
    return this.http
      .post<{ data?: { token?: string } }>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap((response) => {
          const token = response?.data?.token;
          if (!token || !this.applyToken(token)) {
            throw new Error('No se recibió un token válido del servidor');
          }
        }),
      );
  }

  /** Goes to the lab account to sign in (it comes back with the token in the fragment) */
  signInWithLabAccount(): void {
    if (this.redirecting || typeof window === 'undefined') return;
    this.redirecting = true;
    window.location.assign('/auth/sso');
  }

  /** Closes the session here (server side) and, with the lab account, there too */
  logout(): void {
    const hadToken = !!this.getAccessToken();
    const done = () => {
      this.clearSession();
      if (this.usesLabAccount && typeof window !== 'undefined') {
        window.location.assign('/auth/salir');
      } else {
        this.router.navigate(['/auth/login']);
      }
    };
    if (!hadToken) {
      done();
      return;
    }
    this.http.post(`${environment.apiUrl}/auth/logout`, null).subscribe({ next: done, error: done });
  }

  /** The session ended (401): sign in again */
  sessionExpired(): void {
    this.clearSession();
    if (this.usesLabAccount) {
      this.signInWithLabAccount();
    } else {
      this.router.navigate(['/auth/login']);
    }
  }

  getAccessToken(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  private clearSession(): void {
    this.currentUser.set(null);
    this.tokenExpiration.set(0);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
  }

  /** The lab account callback redirects to /#lab=<token>: keep it and clean the address bar */
  private takeTokenFromFragment(): void {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash;
    if (!hash.startsWith(LAB_FRAGMENT)) return;
    const token = decodeURIComponent(hash.slice(LAB_FRAGMENT.length));
    history.replaceState(null, '', window.location.pathname + window.location.search);
    this.applyToken(token);
  }

  private restoreSession(): void {
    const token = this.getAccessToken();
    if (token && !this.applyToken(token)) {
      this.clearSession();
    }
  }

  /** Validates the token locally (shape and expiry), stores it and sets the user */
  private applyToken(token: string): boolean {
    const claims = decodeJwt(token) as Record<string, unknown> | null;
    if (!claims) return false;

    const exp = Number(claims['exp']);
    if (!Number.isFinite(exp) || exp * 1000 <= Date.now()) return false;

    const str = (key: string) => (typeof claims[key] === 'string' ? (claims[key] as string) : '');
    const email = str('email');
    this.currentUser.set({
      id: str('uid') || str('sub'),
      email,
      name: str(NAME_CLAIM) || str('name') || email,
    });
    this.tokenExpiration.set(exp * 1000);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
    }
    return true;
  }
}
