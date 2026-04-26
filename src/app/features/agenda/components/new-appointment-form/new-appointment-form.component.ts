import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogRef } from '@angular/cdk/dialog';
import { forkJoin } from 'rxjs';
import { ActionButtonComponent } from '../../../../components/shared/action-button/action-button.component';
import { DynamicModalComponent } from '../../../../components/shared/dynamic-modal/dynamic-modal.component';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { ClientService } from '../../../../core/services/client.service';
import { QuotationService } from '../../../../core/services/quotation.service';
import { AppointmentStatus, AppUser, Appointment } from '../../../../core/models/appointment.model';
import { Client } from '../../../../core/models/client.model';
import { Quotation, QuotationDesignAnalysis } from '../../../../core/models/quotation.model';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-new-appointment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ActionButtonComponent, DynamicModalComponent],
  template: `
    <app-dynamic-modal [data]="{ title: 'Nueva Cita' }">
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="appointment-form">

        <div class="form-group">
          <label>Cliente *</label>
          <select formControlName="clientId" (change)="onClientChange()">
            <option value="">Seleccionar cliente...</option>
            <option *ngFor="let c of clients" [value]="c.id">{{ c.fullName }}</option>
          </select>
        </div>

        <div class="form-group">
          <label>Quote vinculada</label>
          <select formControlName="quotationId" (change)="onQuoteChange()"
            [disabled]="!form.get('clientId')?.value">
            <option value="">Sin quote (opcional)</option>
            <option *ngFor="let q of clientQuotations" [value]="q.id">
              Quote #{{ q.id }} — {{ q.estimatedTotalPrice ? ('$' + q.estimatedTotalPrice) : 'Sin precio' }}
            </option>
          </select>
          <span class="hint" *ngIf="!form.get('clientId')?.value">Selecciona primero un cliente.</span>
        </div>

        <!-- Info de la quote seleccionada -->
        <div class="quote-info" *ngIf="selectedAnalysis">
          <div class="quote-info-row">
            <span class="info-label">Sesiones estimadas:</span>
            <span class="info-value">{{ selectedAnalysis.estimatedSessions ?? '—' }}</span>
          </div>
          <div class="quote-info-row">
            <span class="info-label">Horas por sesión:</span>
            <span class="info-value">{{ selectedAnalysis.estimatedHours ?? '—' }} hrs</span>
          </div>
          <div class="quote-info-row" *ngIf="sessionsInfo.total !== null">
            <span class="info-label">Citas creadas para esta quote:</span>
            <span class="info-value" [class.warning]="sessionsInfo.existing >= sessionsInfo.total!">
              {{ sessionsInfo.existing }} / {{ sessionsInfo.total }}
            </span>
          </div>
        </div>

        <!-- Guardrail: alerta si se exceden las sesiones -->
        <div class="alert alert-warning"
          *ngIf="sessionsInfo.total !== null && sessionsInfo.existing >= sessionsInfo.total!">
          ⚠️ Esta quote tiene {{ sessionsInfo.total }} sesión(es) y ya hay {{ sessionsInfo.existing }} cita(s) registrada(s).
          Considera revisar la quote antes de agregar más citas.
        </div>

        <div class="form-group">
          <label>Artista *</label>
          <select formControlName="tattooArtistId">
            <option value="">Seleccionar artista...</option>
            <option *ngFor="let u of users" [value]="u.id">{{ u.fullName }}</option>
          </select>
        </div>

        <div class="form-group">
          <label>Estado *</label>
          <select formControlName="statusId">
            <option value="">Seleccionar estado...</option>
            <option *ngFor="let s of statuses" [value]="s.id">{{ s.name }}</option>
          </select>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Inicio *</label>
            <input type="datetime-local" formControlName="appointmentStart" (change)="onStartChange()">
          </div>
          <div class="form-group">
            <label>Fin *</label>
            <input type="datetime-local" formControlName="appointmentEnd">
            <span class="hint" *ngIf="selectedAnalysis?.estimatedHours">
              Calculado: {{ selectedAnalysis!.estimatedHours }} hrs desde inicio
            </span>
          </div>
        </div>

        <div class="form-group">
          <label>Notas</label>
          <textarea formControlName="notes" rows="3" placeholder="Notas adicionales..."></textarea>
        </div>

        <div *ngIf="errorMsg" class="error-msg">{{ errorMsg }}</div>

        <footer class="form-actions">
          <app-action-button text="Cancelar" variant="secondary" (click)="onCancel()"></app-action-button>
          <app-action-button
            text="Crear"
            variant="primary"
            type="submit"
            [disabled]="form.invalid || isSubmitting">
          </app-action-button>
        </footer>
      </form>
    </app-dynamic-modal>
  `,
  styles: [`
    .hint { font-size: 11px; color: var(--text-secondary, #888); margin-top: 2px; }
    .quote-info {
      background: var(--surface-hover, #f8fafc);
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: var(--radius-md, 6px);
      padding: 10px 14px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .quote-info-row { display: flex; justify-content: space-between; font-size: 13px; }
    .info-label { color: var(--text-secondary, #64748b); }
    .info-value { font-weight: 600; color: var(--text-main); }
    .info-value.warning { color: #d97706; }
    .alert {
      padding: 10px 14px;
      border-radius: var(--radius-md, 6px);
      font-size: 13px;
    }
    .alert-warning { background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; }
  `],
  styleUrls: ['./new-appointment-form.component.css']
})
export class NewAppointmentFormComponent implements OnInit {
  form: FormGroup;
  clients: Client[] = [];
  users: AppUser[] = [];
  statuses: AppointmentStatus[] = [];
  allQuotations: Quotation[] = [];
  allAnalyses: QuotationDesignAnalysis[] = [];
  allAppointments: Appointment[] = [];
  clientQuotations: Quotation[] = [];
  selectedAnalysis: QuotationDesignAnalysis | null = null;
  sessionsInfo: { existing: number; total: number | null } = { existing: 0, total: null };
  isSubmitting = false;
  errorMsg = '';

  constructor(
    private fb: FormBuilder,
    private dialogRef: DialogRef,
    private appointmentService: AppointmentService,
    private clientService: ClientService,
    private quotationService: QuotationService,
    private authService: AuthService,
    private notifications: NotificationService,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      clientId: ['', Validators.required],
      quotationId: [''],
      tattooArtistId: ['', Validators.required],
      statusId: ['', Validators.required],
      appointmentStart: ['', Validators.required],
      appointmentEnd: ['', Validators.required],
      notes: ['']
    });
  }

  ngOnInit() {
    forkJoin({
      clients: this.clientService.getClients(),
      users: this.appointmentService.getUsers(),
      statuses: this.appointmentService.getStatuses(),
      quotations: this.quotationService.getQuotations(),
      analyses: this.quotationService.getDesignAnalyses(),
      appointments: this.appointmentService.getAppointments(),
    }).subscribe({
      next: ({ clients, users, statuses, quotations, analyses, appointments }) => {
        this.clients = clients;
        this.users = users;
        this.statuses = statuses;
        this.allQuotations = quotations;
        this.allAnalyses = analyses;
        this.allAppointments = appointments;
        this.cdr.markForCheck();
      }
    });
  }

  onClientChange() {
    const clientId = Number(this.form.get('clientId')?.value);
    this.clientQuotations = clientId
      ? this.allQuotations.filter(q => q.clientId === clientId)
      : [];
    this.form.patchValue({ quotationId: '' });
    this.selectedAnalysis = null;
    this.sessionsInfo = { existing: 0, total: null };
  }

  onQuoteChange() {
    const quotationId = Number(this.form.get('quotationId')?.value);
    if (!quotationId) {
      this.selectedAnalysis = null;
      this.sessionsInfo = { existing: 0, total: null };
      return;
    }
    this.selectedAnalysis = this.allAnalyses.find(a => a.quotationId === quotationId) ?? null;
    this.autoFillEndTime();
    const existing = this.allAppointments.filter(a => a.quotationId === quotationId).length;
    this.sessionsInfo = {
      existing,
      total: this.selectedAnalysis?.estimatedSessions ?? null
    };
    this.cdr.markForCheck();
  }

  onStartChange() {
    this.autoFillEndTime();
  }

  private autoFillEndTime() {
    const start = this.form.get('appointmentStart')?.value;
    const hours = this.selectedAnalysis?.estimatedHours;
    if (!start || !hours) return;
    const startDate = new Date(start);
    const endDate = new Date(startDate.getTime() + hours * 3600 * 1000);
    this.form.patchValue({ appointmentEnd: this.toDatetimeLocalStr(endDate) }, { emitEvent: false });
    this.cdr.markForCheck();
  }

  private toDatetimeLocalStr(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.isSubmitting = true;
    this.errorMsg = '';

    const v = this.form.value;
    const payload = {
      clientId: Number(v.clientId),
      tattooArtistId: Number(v.tattooArtistId),
      statusId: Number(v.statusId),
      quotationId: v.quotationId ? Number(v.quotationId) : undefined,
      appointmentStart: new Date(v.appointmentStart).toISOString(),
      appointmentEnd: new Date(v.appointmentEnd).toISOString(),
      notes: v.notes || null
    };

    this.appointmentService.createAppointment(payload).subscribe({
      next: (created) => {
        this.isSubmitting = false;
        this.notifications.success('Cita creada correctamente.');
        this.dialogRef.close(created);
      },
      error: () => {
        this.isSubmitting = false;
        this.errorMsg = 'Error al crear la cita. Intenta de nuevo.';
      }
    });
  }

  onCancel() {
    this.dialogRef.close();
  }
}
