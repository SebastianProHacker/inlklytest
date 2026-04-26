import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { DialogRef, DIALOG_DATA, Dialog, DialogModule } from '@angular/cdk/dialog';
import { ActionButtonComponent } from '../../../../components/shared/action-button/action-button.component';
import { DynamicModalComponent } from '../../../../components/shared/dynamic-modal/dynamic-modal.component';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { Appointment } from '../../../../core/models/appointment.model';
import { ChangeStatusFormComponent } from '../change-status-form/change-status-form.component';

@Component({
  selector: 'app-appointment-detail',
  standalone: true,
  imports: [CommonModule, DatePipe, ActionButtonComponent, DynamicModalComponent, DialogModule],
  template: `
    <app-dynamic-modal [data]="{ title: 'Detalle de Cita' }">
      <div class="detail-body" *ngIf="appointment">

        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Cliente</span>
            <span class="info-value">{{ appointment.client?.fullName ?? '—' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Artista</span>
            <span class="info-value">{{ appointment.tattooArtist?.fullName ?? '—' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Estado</span>
            <span class="status-badge" [class]="statusClass">{{ appointment.status?.name }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Inicio</span>
            <span class="info-value">{{ appointment.appointmentStart | date:'dd/MM/yyyy HH:mm' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Fin</span>
            <span class="info-value">{{ appointment.appointmentEnd | date:'dd/MM/yyyy HH:mm' }}</span>
          </div>
          <div class="info-item full-width" *ngIf="appointment.notes">
            <span class="info-label">Notas</span>
            <span class="info-value">{{ appointment.notes }}</span>
          </div>
        </div>

        <!-- Material consumptions -->
        <div class="section" *ngIf="appointment.tattooMaterialConsumptions?.length">
          <h4 class="section-title">Materiales utilizados</h4>
          <div class="material-row" *ngFor="let c of appointment.tattooMaterialConsumptions">
            <span>{{ c.material?.name }}</span>
            <span class="material-qty">{{ c.quantityUsed }} {{ c.material?.unitMeasure }}</span>
          </div>
        </div>

        <!-- Status history -->
        <div class="section">
          <h4 class="section-title">Historial de estados</h4>
          <div *ngIf="appointment.appointmentStatusHistories?.length; else noHistory">
            <div class="history-item" *ngFor="let h of appointment.appointmentStatusHistories">
              <div class="history-dot"></div>
              <div class="history-content">
                <span class="history-status">{{ h.status?.name }}</span>
                <span class="history-meta">
                  {{ h.createdAt | date:'dd/MM/yyyy HH:mm' }}
                  <span *ngIf="h.changedByNavigation"> · {{ h.changedByNavigation.fullName }}</span>
                </span>
              </div>
            </div>
          </div>
          <ng-template #noHistory>
            <p class="empty-text">Sin historial registrado.</p>
          </ng-template>
        </div>

        <footer class="form-actions">
          <app-action-button text="Cerrar" variant="secondary" (click)="close()"></app-action-button>
          <app-action-button text="Cambiar Estado" variant="primary" (click)="openChangeStatus()"></app-action-button>
        </footer>
      </div>

      <div *ngIf="!appointment" class="loading-text">Cargando...</div>
    </app-dynamic-modal>
  `,
  styles: [`
    .detail-body { display: flex; flex-direction: column; gap: 20px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .info-item { display: flex; flex-direction: column; gap: 4px; }
    .info-item.full-width { grid-column: 1 / -1; }
    .info-label { font-size: 12px; color: var(--text-muted, #888); font-weight: 500; text-transform: uppercase; letter-spacing: 0.04em; }
    .info-value { font-size: 14px; color: var(--text-main); }
    .status-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 13px; font-weight: 500; background: var(--border-color, #eee); }
    .status-badge.pendiente { background: #fff3cd; color: #856404; }
    .status-badge.confirmada { background: #cce5ff; color: #004085; }
    .status-badge.completada { background: #d4edda; color: #155724; }
    .status-badge.cancelada { background: #f8d7da; color: #721c24; }
    .section { border-top: 1px solid var(--border-color, #eee); padding-top: 16px; }
    .section-title { font-size: 13px; font-weight: 600; margin: 0 0 10px; color: var(--text-main); }
    .material-row { display: flex; justify-content: space-between; font-size: 14px; padding: 4px 0; border-bottom: 1px dashed var(--border-color, #eee); }
    .material-qty { color: var(--text-muted, #888); }
    .history-item { display: flex; gap: 12px; align-items: flex-start; padding: 6px 0; }
    .history-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--primary-purple, #7c5cbf); margin-top: 4px; flex-shrink: 0; }
    .history-content { display: flex; flex-direction: column; gap: 2px; }
    .history-status { font-size: 14px; font-weight: 500; }
    .history-meta { font-size: 12px; color: var(--text-muted, #888); }
    .empty-text { font-size: 13px; color: var(--text-muted, #888); }
    .loading-text { padding: 20px; text-align: center; color: var(--text-muted, #888); }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; padding-top: 16px; border-top: 1px solid var(--border-color, #eee); }
  `]
})
export class AppointmentDetailComponent implements OnInit {
  appointment: Appointment | null = null;

  get statusClass(): string {
    return this.appointment?.status?.name?.toLowerCase() ?? '';
  }

  constructor(
    public dialogRef: DialogRef,
    @Inject(DIALOG_DATA) public data: { appointmentId: number },
    private appointmentService: AppointmentService,
    private dialog: Dialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.appointmentService.getAppointment(this.data.appointmentId).subscribe({
      next: (a) => { this.appointment = a; this.cdr.markForCheck(); },
      error: () => { this.appointment = null; this.cdr.markForCheck(); }
    });
  }

  openChangeStatus() {
    const ref = this.dialog.open(ChangeStatusFormComponent, {
      width: '480px',
      disableClose: true,
      data: { appointmentId: this.data.appointmentId }
    });
    ref.closed.subscribe((changed: any) => {
      if (changed) this.load();
    });
  }

  close() {
    this.dialogRef.close(this.appointment);
  }
}
