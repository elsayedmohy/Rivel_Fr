// services/vessel.service.ts
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { appConfig } from '../../../core/config/app-config';
import { Vessel, VesselPayload, VesselStatus } from './vessel.model';


@Injectable({ providedIn: 'root' })
export class VesselService {
  private readonly http = inject(HttpClient);
  private readonly base = `${appConfig.apiBaseUrl}/vessels`;

  getMine(): Observable<Vessel[]> {
    return this.http.get<Vessel[]>(`${this.base}/mine`);
  }

  create(payload: VesselPayload): Observable<Vessel> {
    return this.http.post<Vessel>(this.base, payload);
  }

  update(id: string, payload: VesselPayload): Observable<Vessel> {
    return this.http.put<Vessel>(`${this.base}/${id}`, payload);
  }

  setStatus(id: string, status: VesselStatus): Observable<Vessel> {
    return this.http.patch<Vessel>(`${this.base}/${id}/status`, { status });
  }

  archive(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
