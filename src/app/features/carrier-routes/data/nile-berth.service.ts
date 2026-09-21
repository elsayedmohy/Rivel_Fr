import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { appConfig } from '../../../core/config/app-config';
import { NileBerth } from '../routes.model';

@Injectable({ providedIn: 'root' })
export class NileBerthService {
  private readonly http = inject(HttpClient);
  private readonly url = `${appConfig.apiBaseUrl}/berths`;

  private cached$: Observable<NileBerth[]> | null = null;

  getAll(): Observable<NileBerth[]> {
    this.cached$ ??= this.http
      .get<NileBerth[]>(this.url)
      .pipe(shareReplay({ bufferSize: 1, refCount: false }));

    return this.cached$;
  }
}
