import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TuiButton, TuiDialogService, TuiIcon, TuiLoader } from '@taiga-ui/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { VesselService } from './data/vessel.service';
import { VesselCardComponent } from './components/vessel-card.component';
import { Vessel, VesselPayload, VesselStatus } from './data/vessel.model';
import { HttpErrorResponse } from '@angular/common/http';
import { EMPTY, switchMap } from 'rxjs';
import { PolymorpheusComponent } from '@taiga-ui/polymorpheus';
import { VesselDialogComponent, VesselDialogData } from './components/vessel-dialog.component';

@Component({
  selector: 'rl-vessels-page',
  imports: [ReactiveFormsModule, TuiButton, TuiIcon, TranslatePipe, TuiLoader, VesselCardComponent],
  templateUrl: './vessels-page.html',
  styleUrl: './vessels-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VesselsPage {
  private readonly api = inject(VesselService);
  private readonly dialogs = inject(TuiDialogService);
  private readonly translate = inject(TranslateService);

  protected readonly vessels = signal<Vessel[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly formError = signal<string | null>(null);
  protected readonly busyId = signal<string | null>(null);

  protected readonly availableCount = computed(
    () => this.vessels().filter((v) => v.status === VesselStatus.Available).length,
  );

  protected readonly totalCapacity = computed(() =>
    this.vessels().reduce((sum, v) => sum + v.capacity, 0),
  );

  constructor() {
    this.reload();
  }

  protected reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.formError.set(null);

    this.api.getMine().subscribe({
      next: (list) => {
        this.vessels.set(list);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(this.messageFor(err));
        this.loading.set(false);
      },
    });
  }

  protected add(): void {
    this.openDialog(null)
      .pipe(switchMap((payload) => (payload ? this.api.create(payload) : EMPTY)))
      .subscribe({
        next: (created) => this.vessels.update((list) => [...list, created]),
        error: (err: HttpErrorResponse) => this.formError.set(this.messageFor(err)),
      });
  }

  protected edit(vessel: Vessel): void {
    this.openDialog(vessel)
      .pipe(
        switchMap((payload) => {
          if (!payload) {
            return EMPTY;
          }
          this.busyId.set(vessel.id);
          return this.api.update(vessel.id, payload);
        }),
      )
      .subscribe({
        next: (updated) => {
          this.busyId.set(null);
          this.replace(updated);
        },
        error: (err: HttpErrorResponse) => {
          this.busyId.set(null);
          this.formError.set(this.messageFor(err));
        },
      });
  }

  protected toggleStatus(vessel: Vessel): void {
    const next =
      vessel.status === VesselStatus.Maintenance
        ? VesselStatus.Available
        : VesselStatus.Maintenance;

    this.busyId.set(vessel.id);
    this.formError.set(null);

    this.api.setStatus(vessel.id, next).subscribe({
      next: (updated) => {
        this.busyId.set(null);
        this.replace(updated);
      },
      error: (err: HttpErrorResponse) => {
        this.busyId.set(null);
        this.formError.set(this.messageFor(err));
      },
    });
  }

  protected archive(vessel: Vessel): void {
    this.busyId.set(vessel.id);
    this.formError.set(null);

    this.api.archive(vessel.id).subscribe({
      next: () => {
        this.busyId.set(null);
        this.vessels.update((list) => list.filter((v) => v.id !== vessel.id));
      },
      error: (err: HttpErrorResponse) => {
        this.busyId.set(null);
        this.formError.set(this.messageFor(err));
      },
    });
  }

  private openDialog(vessel: Vessel | null) {
    return this.dialogs.open<VesselPayload | null>(
      new PolymorpheusComponent(VesselDialogComponent),
      { data: { vessel } satisfies VesselDialogData, size: 'm', dismissible: true },
    );
  }

  private replace(updated: Vessel): void {
    this.vessels.update((list) => list.map((v) => (v.id === updated.id ? updated : v)));
  }

  private messageFor(err: HttpErrorResponse): string {
    const code = err.error?.code as string | undefined;

    if (code) {
      const key = `errors.${code}`;
      const translated = this.translate.instant(key);
      if (translated !== key) {
        return translated;
      }
    }

    return err.error?.message ?? this.translate.instant('errors.unknown');
  }
}
