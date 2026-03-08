import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../../../environments/environment';

export interface RequestOptions {
  headers?: HttpHeaders;
  params?: HttpParams | Record<string, string | string[]>;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  get<T>(endpoint: string, options?: RequestOptions): Observable<T> {
    return this.http
      .get<T>(this.buildUrl(endpoint), this.buildOptions(options))
      .pipe(catchError(this.handleError));
  }

  post<T>(endpoint: string, body: unknown, options?: RequestOptions): Observable<T> {
    return this.http
      .post<T>(this.buildUrl(endpoint), body, this.buildOptions(options))
      .pipe(catchError(this.handleError));
  }

  put<T>(endpoint: string, body: unknown, options?: RequestOptions): Observable<T> {
    return this.http
      .put<T>(this.buildUrl(endpoint), body, this.buildOptions(options))
      .pipe(catchError(this.handleError));
  }

  patch<T>(endpoint: string, body: unknown, options?: RequestOptions): Observable<T> {
    return this.http
      .patch<T>(this.buildUrl(endpoint), body, this.buildOptions(options))
      .pipe(catchError(this.handleError));
  }

  delete<T>(endpoint: string, options?: RequestOptions): Observable<T> {
    return this.http
      .delete<T>(this.buildUrl(endpoint), this.buildOptions(options))
      .pipe(catchError(this.handleError));
  }

  private buildUrl(endpoint: string): string {
    return `${this.baseUrl}/${endpoint}`;
  }

  private buildOptions(options?: RequestOptions): { headers?: HttpHeaders; params?: HttpParams } {
    const result: { headers?: HttpHeaders; params?: HttpParams } = {};
    if (options?.headers) {
      result.headers = options.headers;
    }
    if (options?.params) {
      result.params =
        options.params instanceof HttpParams
          ? options.params
          : new HttpParams({ fromObject: options.params });
    }
    return result;
  }

  private handleError(error: unknown): Observable<never> {
    return throwError(() => error);
  }
}
