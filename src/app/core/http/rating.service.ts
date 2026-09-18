import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import type { CreateRatingDto, RatingDto } from '../../models/rating/rating';

@Injectable({ providedIn: 'root' })
export class RatingService {
  private readonly api = inject(ApiService);

  /** POST /api/ratings/create — CargoOwner only */
  create(payload: CreateRatingDto): Observable<RatingDto> {
    return this.api.post<RatingDto>('ratings/create', payload);
  }

  /** GET /api/ratings/{carrierId} — public */
  listForCarrier(carrierId: string): Observable<RatingDto[]> {
    return this.api.get<RatingDto[]>(`ratings/${carrierId}`);
  }
}