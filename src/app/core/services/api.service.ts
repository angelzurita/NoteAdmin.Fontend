import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

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
      .get<ApiResponse<T>>(this.buildUrl(endpoint), this.buildOptions(options))
      .pipe(map((res) => this.unwrap(res)), catchError(this.handleError));
  }

  post<T>(endpoint: string, body: unknown, options?: RequestOptions): Observable<T> {
    return this.http
      .post<ApiResponse<T>>(this.buildUrl(endpoint), body, this.buildOptions(options))
      .pipe(map((res) => this.unwrap(res)), catchError(this.handleError));
  }

  put<T>(endpoint: string, body: unknown, options?: RequestOptions): Observable<T> {
    return this.http
      .put<ApiResponse<T>>(this.buildUrl(endpoint), body, this.buildOptions(options))
      .pipe(map((res) => this.unwrap(res)), catchError(this.handleError));
  }

  patch<T>(endpoint: string, body: unknown, options?: RequestOptions): Observable<T> {
    return this.http
      .patch<ApiResponse<T>>(this.buildUrl(endpoint), body, this.buildOptions(options))
      .pipe(map((res) => this.unwrap(res)), catchError(this.handleError));
  }

  delete<T>(endpoint: string, options?: RequestOptions): Observable<T> {
    return this.http
      .delete<ApiResponse<T>>(this.buildUrl(endpoint), this.buildOptions(options))
      .pipe(map((res) => this.unwrap(res)), catchError(this.handleError));
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

  /**
   * Desenvuelve la respuesta del backend:
   * { success, message, data, errors } → data
   * Si la respuesta no tiene la estructura envolvente, la retorna tal cual.
   */
  private unwrap<T>(response: ApiResponse<T> | T): T {
    if (response && typeof response === 'object' && 'data' in response && 'success' in response) {
      return (response as ApiResponse<T>).data;
    }
    return response as T;
  }

  private handleError(error: unknown): Observable<never> {
    return throwError(() => error);
  }
}
