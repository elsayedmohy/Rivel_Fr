import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  CreateRatingDto,
  RatingDto,
  RatingsResponseDto,
  RatingsSummary,
} from '../../models/rating/rating';

@Injectable({ providedIn: 'root' })
export class RatingService {
  private readonly api = inject(ApiService);

  /** POST /api/ratings/create — CargoOwner only */
  create(payload: CreateRatingDto): Observable<RatingDto> {
    return this.api.post<RatingDto>('ratings/create', payload);
  }

  /** GET /api/ratings/{carrierId} — public */
  listForCarrier(carrierId: string): Observable<RatingsResponseDto> {
    return this.api.get<RatingsResponseDto>(`ratings/${carrierId}`);
  }
}
