import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { APP_CONFIG, appConfig } from '../config/app-config';
import { OfferService } from './offer.service';
import type { OfferDto } from '../../models/offer/offer';

describe('OfferService', () => {
  let service: OfferService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: APP_CONFIG, useValue: { ...appConfig, apiBaseUrl: '/api' } },
      ],
    });

    service = TestBed.inject(OfferService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('lists offers for a shipment request', () => {
    const expected = [offerFixture()];
    let actual: OfferDto[] | undefined;

    service.listForRequest('r-1').subscribe((result) => (actual = result));

    const request = httpMock.expectOne('/api/shipment-requests/r-1/offers');
    expect(request.request.method).toBe('GET');
    request.flush(expected);

    expect(actual).toEqual(expected);
  });

  it('creates an offer via POST on the shipment request', () => {
    const payload = { price: 1500, proposedPickupDate: '2026-10-05', vesselId: 'vessel-1' };
    let result: OfferDto | undefined;

    service.create('r-1', payload).subscribe((value) => (result = value));

    const request = httpMock.expectOne('/api/shipment-requests/r-1/offers');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush(offerFixture());

    expect(result).toEqual(offerFixture());
  });

  it('accepts an offer via POST with an empty body', () => {
    let status: OfferDto['status'] | undefined;

    service.accept('offer-1').subscribe((result) => (status = result.status));

    const request = httpMock.expectOne('/api/offers/offer-1/accept');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toBeNull();
    request.flush({ ...offerFixture(), status: 'Accepted' });

    expect(status).toBe('Accepted');
  });
});

function offerFixture(): OfferDto {
  return {
    id: 'offer-1',
    shipmentRequestId: 'r-1',
    carrierId: 'carrier-1',
    vesselId: 'vessel-1',
    price: 1500,
    proposedPickupDate: '2026-10-05',
    status: 'Pending',
    carrierName: 'Bob',
    companyName: 'River Freight Co.',
  };
}