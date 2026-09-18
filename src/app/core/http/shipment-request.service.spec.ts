import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { APP_CONFIG, appConfig } from '../config/app-config';
import { ShipmentRequestService } from './shipment-request.service';
import type { ShipmentRequestDto } from '../../models/request/shipment-request';

describe('ShipmentRequestService', () => {
  let service: ShipmentRequestService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: APP_CONFIG, useValue: { ...appConfig, apiBaseUrl: '/api' } },
      ],
    });

    service = TestBed.inject(ShipmentRequestService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('lists open requests (Carrier)', () => {
    const expected: ShipmentRequestDto[] = [requestFixture('r-1', 'Open')];
    let actual: ShipmentRequestDto[] | undefined;

    service.listOpen().subscribe((result) => (actual = result));

    const request = httpMock.expectOne('/api/shipment-requests/open');
    expect(request.request.method).toBe('GET');
    request.flush(expected);

    expect(actual).toEqual(expected);
  });

  it('lists the current owner requests', () => {
    service.listMine().subscribe();

    const request = httpMock.expectOne('/api/shipment-requests/mine');
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('creates a request with a camelCase body', () => {
    const payload = {
      cargoType: 'Grains',
      weight: 120.5,
      origin: 'Rotterdam',
      destination: 'Duisburg',
      requestedDate: '2026-10-01',
    };
    let createdId: string | undefined;

    service.create(payload).subscribe((created) => (createdId = created.id));

    const request = httpMock.expectOne('/api/shipment-requests');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush(requestFixture('r-new', 'Open'));

    expect(createdId).toBe('r-new');
  });

  it('fetches a single request by id', () => {
    let fetchedId: string | undefined;

    service.getById('r-1').subscribe((result) => (fetchedId = result.id));

    const request = httpMock.expectOne('/api/shipment-requests/r-1');
    expect(request.request.method).toBe('GET');
    request.flush(requestFixture('r-1', 'Open'));

    expect(fetchedId).toBe('r-1');
  });
});

function requestFixture(id: string, status: ShipmentRequestDto['status']): ShipmentRequestDto {
  return {
    id,
    cargoType: 'Grains',
    weight: 120,
    origin: 'Rotterdam',
    destination: 'Duisburg',
    requestedDate: '2026-10-01',
    status,
    cargoOwnerId: 'owner-1',
    offersCount: 0,
  };
}