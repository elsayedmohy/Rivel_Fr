import { TestBed } from '@angular/core/testing';
import { APP_CONFIG, appConfig } from '../config/app-config';
import { TokenService } from '../http/token.service';
import { VesselService } from './vessel.service';
import type { User } from '../../models/user/user';

describe('VesselService (mock)', () => {
  const storageKey = 'rl:vessels:test';
  let service: VesselService;
  let tokens: TokenService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [{ provide: APP_CONFIG, useValue: { ...appConfig, vesselsStorageKey: storageKey } }],
    });

    tokens = TestBed.inject(TokenService);
    tokens.save('token', carrier('carrier-1'));
    service = TestBed.inject(VesselService);
  });

  afterEach(() => localStorage.clear());

  it('starts empty', () => {
    expect(service.list()).toEqual([]);
  });

  it('creates a vessel and persists it', () => {
    const vessel = service.create({ type: 'Barge', capacity: 1000, status: 'Available' });

    expect(vessel.id).toBeTruthy();
    expect(service.list()).toEqual([vessel]);
    expect(localStorage.getItem(`${storageKey}:carrier-1`)).toContain('Barge');
  });

  it('updates status and removes a vessel', () => {
    const vessel = service.create({ type: 'Barge', capacity: 1000, status: 'Available' });

    service.updateStatus(vessel.id, 'OnTrip');
    expect(service.list()[0].status).toBe('OnTrip');

    service.remove(vessel.id);
    expect(service.list()).toEqual([]);
  });

  it('keeps vessels isolated per user', () => {
    service.create({ type: 'Barge', capacity: 1000, status: 'Available' });

    tokens.save('token-2', carrier('carrier-2'));

    expect(service.list()).toEqual([]);
  });

  it('falls back to an empty list when storage is corrupt', () => {
    localStorage.setItem(`${storageKey}:carrier-1`, 'not-json');

    expect(service.list()).toEqual([]);
  });
});

function carrier(id: string): User {
  return { id, name: id, email: `${id}@example.com`, role: 'Carrier' };
}