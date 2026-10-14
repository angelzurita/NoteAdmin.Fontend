import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { AuthService, decodeJwt } from './auth.service';
import { environment } from '../../../environments/environment';

/** Builds an unsigned JWT with the given payload (base64url, like the server) */
function fakeJwt(payload: Record<string, unknown>): string {
  const enc = (o: unknown) => {
    const bytes = new TextEncoder().encode(JSON.stringify(o));
    return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  };
  return `${enc({ alg: 'HS256', typ: 'JWT' })}.${enc(payload)}.firma`;
}

const NAME = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name';

describe('decodeJwt', () => {
  it('decodes base64url payloads with accents', () => {
    const token = fakeJwt({ [NAME]: 'Ángel Zúñiga ~?>', exp: 1 });
    expect(decodeJwt(token)?.[NAME]).toBe('Ángel Zúñiga ~?>');
  });

  it('returns null for something that is not a JWT', () => {
    expect(decodeJwt('no-es-un-token')).toBeNull();
    expect(decodeJwt('a.@@@.c')).toBeNull();
  });
});

describe('AuthService', () => {
  const future = Math.floor(Date.now() / 1000) + 3600;

  function setup(): AuthService {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    return TestBed.inject(AuthService);
  }

  afterEach(() => {
    localStorage.clear();
    history.replaceState(null, '', '/');
  });

  it('takes the token from the #lab= fragment and cleans the address bar', () => {
    const token = fakeJwt({ uid: 'u-1', email: 'ana@lab.zuritaserver.com', [NAME]: 'Ana', exp: future });
    history.replaceState(null, '', `/#lab=${encodeURIComponent(token)}`);

    const auth = setup();

    expect(auth.isAuthenticated()).toBe(true);
    expect(auth.user()).toEqual({ id: 'u-1', email: 'ana@lab.zuritaserver.com', name: 'Ana' });
    expect(auth.getAccessToken()).toBe(token);
    expect(window.location.hash).toBe('');
  });

  it('ignores an expired stored token', () => {
    localStorage.setItem('access_token', fakeJwt({ uid: 'u-1', exp: Math.floor(Date.now() / 1000) - 10 }));
    const auth = setup();
    expect(auth.isAuthenticated()).toBe(false);
    expect(auth.getAccessToken()).toBeNull();
  });

  it('logout closes the session on the server and forgets the token', () => {
    localStorage.setItem('access_token', fakeJwt({ uid: 'u-1', exp: future }));
    const auth = setup();
    const http = TestBed.inject(HttpTestingController);

    auth.logout();
    http.expectOne(`${environment.apiUrl}/auth/logout`).flush(null, { status: 204, statusText: 'No Content' });

    expect(auth.isAuthenticated()).toBe(false);
    expect(auth.getAccessToken()).toBeNull();
    http.verify();
  });
});
