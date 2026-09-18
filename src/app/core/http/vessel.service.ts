import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import type { CreateVesselDto, VesselDto } from '../../models/vessel/vessel';

@Injectable({ providedIn: 'root' })
export class VesselService {
  private readonly api = inject(ApiService);

  /** GET /api/vessels — Carrier only */
  list(): Observable<VesselDto[]> {
    return this.api.get<VesselDto[]>('vessels');
  }

  /** POST /api/vessels — Carrier only */
  create(payload: CreateVesselDto): Observable<VesselDto> {
    return this.api.post<VesselDto>('vessels', payload);
  }
}