import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { APP_CONFIG, appConfig } from '../config/app-config';
import { ShipmentService } from './shipment.service';
import type { ShipmentDto } from '../../models/shipment/shipment';

describe('ShipmentService', () => {
  let service: ShipmentService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: APP_CONFIG, useValue: { ...appConfig, apiBaseUrl: '/api' } },
      ],
    });

    service = TestBed.inject(ShipmentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('lists the user shipments', () => {
    const expected = [shipmentFixture()];
    let actual: ShipmentDto[] | undefined;

    service.list().subscribe((result) => (actual = result));

    const request = httpMock.expectOne('/api/shipments');
    expect(request.request.method).toBe('GET');
    request.flush(expected);

    expect(actual).toEqual(expected);
  });

  it('fetches a shipment by id', () => {
    let fetchedId: string | undefined;

    service.getById('s-1').subscribe((result) => (fetchedId = result.id));

    const request = httpMock.expectOne('/api/shipments/s-1');
    expect(request.request.method).toBe('GET');
    request.flush(shipmentFixture());

    expect(fetchedId).toBe('s-1');
  });

  it('updates the status via PATCH with a newStatus body', () => {
    let status: string | undefined;

    service.updateStatus('s-1', 'PickedUp').subscribe((result) => (status = result.shipmentStatus));

    const request = httpMock.expectOne('/api/shipments/s-1/status');
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({ newStatus: 'PickedUp' });
    request.flush({ ...shipmentFixture(), shipmentStatus: 'PickedUp' });

    expect(status).toBe('PickedUp');
  });
});

function shipmentFixture(): ShipmentDto {
  return {
    id: 's-1',
    shipmentStatus: 'Matched',
    shipmentRequestId: 'r-1',
    cargoType: 'Grains',
    weight: 120,
    origin: 'Rotterdam',
    destination: 'Duisburg',
    requestedDate: '2026-10-01',
    cargoOwnerId: 'owner-1',
    cargoOwnerName: 'Alice',
    offerId: 'offer-1',
    offeredPrice: 1500,
    proposedPickupDate: '2026-10-05',
    vesselId: 'vessel-1',
    vesselType: 'Barge',
    carrierCompanyName: 'River Freight Co.',
    rating: null,
  };
}