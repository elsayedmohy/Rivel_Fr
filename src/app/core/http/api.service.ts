import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../config/app-config';

export interface RequestOptions {
  readonly params?: HttpParams;
  readonly context?: HttpContext;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);

  get<T>(path: string, options?: RequestOptions): Observable<T> {
    return this.http.get<T>(this.url(path), options);
  }

  post<T>(path: string, body?: unknown, options?: RequestOptions): Observable<T> {
    return this.http.post<T>(this.url(path), body, options);
  }

  patch<T>(path: string, body?: unknown, options?: RequestOptions): Observable<T> {
    return this.http.patch<T>(this.url(path), body, options);
  }

  delete<T>(path: string, options?: RequestOptions): Observable<T> {
    return this.http.delete<T>(this.url(path), options);
  }

  private url(path: string): string {
    const normalized = path.replace(/^\/+/, '');
    return `${this.config.apiBaseUrl}/${normalized}`;
  }
}