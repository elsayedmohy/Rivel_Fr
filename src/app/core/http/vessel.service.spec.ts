import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { APP_CONFIG, appConfig } from '../config/app-config';
import { VesselService } from './vessel.service';
import type { VesselDto } from '../../models/vessel/vessel';

describe('VesselService', () => {
  let service: VesselService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: APP_CONFIG, useValue: { ...appConfig, apiBaseUrl: '/api' } },
      ],
    });

    service = TestBed.inject(VesselService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('lists the current carrier vessels', () => {
    const expected = [vesselFixture()];
    let actual: VesselDto[] | undefined;

    service.list().subscribe((result) => (actual = result));

    const request = httpMock.expectOne('/api/vessels');
    expect(request.request.method).toBe('GET');
    request.flush(expected);

    expect(actual).toEqual(expected);
  });

  it('creates a vessel via POST with a camelCase body', () => {
    const payload = {
      name: 'MV River Star',
      type: 'Barge' as const,
      registrationNumber: 'IMO-9876543',
      capacity: 1200,
    };
    let createdId: string | undefined;

    service.create(payload).subscribe((created) => (createdId = created.id));

    const request = httpMock.expectOne('/api/vessels');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush(vesselFixture());

    expect(createdId).toBe('vessel-1');
  });
});

function vesselFixture(): VesselDto {
  return {
    id: 'vessel-1',
    name: 'MV River Star',
    type: 'Barge',
    registrationNumber: 'IMO-9876543',
    capacity: 1200,
    capacityUnit: 'Tons',
    status: 'Available',
  };
}