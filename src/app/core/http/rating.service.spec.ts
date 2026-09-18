import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { APP_CONFIG, appConfig } from '../config/app-config';
import { RatingService } from './rating.service';
import type { RatingDto } from '../../models/rating/rating';

describe('RatingService', () => {
  let service: RatingService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: APP_CONFIG, useValue: { ...appConfig, apiBaseUrl: '/api' } },
      ],
    });

    service = TestBed.inject(RatingService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('creates a rating via POST on ratings/create', () => {
    const payload = { shipmentId: 's-1', score: 5, comment: 'Great service' };
    let createdId: string | undefined;

    service.create(payload).subscribe((created) => (createdId = created.id));

    const request = httpMock.expectOne('/api/ratings/create');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush(ratingFixture());

    expect(createdId).toBe('r-1');
  });

  it('lists ratings for a carrier', () => {
    const expected = [ratingFixture()];
    let actual: RatingDto[] | undefined;

    service.listForCarrier('carrier-1').subscribe((result) => (actual = result));

    const request = httpMock.expectOne('/api/ratings/carrier-1');
    expect(request.request.method).toBe('GET');
    request.flush(expected);

    expect(actual).toEqual(expected);
  });
});

function ratingFixture(): RatingDto {
  return {
    id: 'r-1',
    shipmentId: 's-1',
    score: 5,
    comment: 'Great service',
  };
}