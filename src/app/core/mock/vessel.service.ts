import { inject, Injectable, signal } from '@angular/core';
import { APP_CONFIG } from '../config/app-config';
import { TokenService } from '../http/token.service';
import type { Vessel } from '../../models/vessel/vessel';
import type { VesselStatus } from '../../models/enums';

export interface CreateVesselDto {
  readonly type: string;
  readonly capacity: number;
  readonly status: VesselStatus;
}

/**
 * MOCK vessel store.
 *
 * The backend validates that an offer's `vesselId` exists, is owned by the
 * carrier and is `Available`, but exposes no vessels endpoint — so vessels are
 * kept in localStorage, keyed per carrier, mirroring the intended
 * `GET/POST/PATCH/DELETE /api/vessels` contract.
 *
 * NOTE: offers created against the real backend with these locally generated
 * ids will be rejected ("Vessel not found") until a vessels endpoint exists.
 *
 * TODO(pending-backend): replace with an HTTP VesselService and delete this file.
 */
@Injectable({ providedIn: 'root' })
export class VesselService {
  private readonly config = inject(APP_CONFIG);
  private readonly user = inject(TokenService).userSignal;

  readonly vessels = signal<Vessel[]>([]);
  private loadedKey: string | null = null;

  list(): Vessel[] {
    this.syncWithUser();
    return this.vessels();
  }

  create(payload: CreateVesselDto): Vessel {
    const vessel: Vessel = { id: newId(), ...payload };
    this.write([...this.list(), vessel]);
    return vessel;
  }

  updateStatus(id: string, status: VesselStatus): void {
    this.write(this.list().map((vessel) => (vessel.id === id ? { ...vessel, status } : vessel)));
  }

  remove(id: string): void {
    this.write(this.list().filter((vessel) => vessel.id !== id));
  }

  private syncWithUser(): void {
    const key = this.storageKey();
    if (key !== this.loadedKey) {
      this.loadedKey = key;
      this.vessels.set(this.read(key));
    }
  }

  private write(vessels: Vessel[]): void {
    this.vessels.set(vessels);
    localStorage.setItem(this.storageKey(), JSON.stringify(vessels));
  }

  private storageKey(): string {
    return `${this.config.vesselsStorageKey}:${this.user()?.id ?? 'anonymous'}`;
  }

  private read(key: string): Vessel[] {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as Vessel[]) : [];
    } catch {
      return [];
    }
  }
}

function newId(): string {
  const cryptoRef = globalThis.crypto;
  return cryptoRef?.randomUUID
    ? cryptoRef.randomUUID()
    : `vessel-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}