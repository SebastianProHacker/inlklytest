import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { DataTableComponent } from '../../components/shared/data-table/data-table.component';
import { ActionButtonComponent } from '../../components/shared/action-button/action-button.component';
import { PaginationComponent } from '../../components/shared/pagination/pagination.component';
import { TableColumn } from '../../components/interfaces/table-config.interface';
import { NewAppointmentFormComponent } from './components/new-appointment-form/new-appointment-form.component';
import { AppointmentDetailComponent } from './components/appointment-detail/appointment-detail.component';
import { AppointmentService } from '../../core/services/appointment.service';
import { Appointment, AppointmentStatus } from '../../core/models/appointment.model';
import { SearchService } from '../../core/services/search.service';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule, DataTableComponent, ActionButtonComponent, PaginationComponent, DialogModule],
  template: `
    <div class="view-container">
      <div class="action-bar">
        <div class="left-actions">
          <select class="status-filter" (change)="onStatusFilter($event)">
            <option value="">Todos los estados</option>
            <option *ngFor="let s of statuses" [value]="s.id">{{ s.name }}</option>
          </select>
        </div>
        <app-action-button
          text="Nueva Cita"
          variant="primary"
          (onClick)="openNewAppointmentModal()">
        </app-action-button>
      </div>

      <app-data-table
        title="Citas"
        [columns]="columns"
        [data]="pagedAppointments"
        [isLoading]="isLoading"
        (rowClicked)="openDetail($event)">
      </app-data-table>

      <app-pagination
        *ngIf="!isLoading && filteredAppointments.length > 0"
        [totalPages]="totalPages"
        [currentPage]="currentPage"
        (pageChanged)="onPageChange($event)">
      </app-pagination>
    </div>
  `,
  styles: [`
    .view-container { padding: 20px 0; }
    .action-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .left-actions { display: flex; gap: 12px; }
    .status-filter {
      height: 36px;
      padding: 0 12px;
      border-radius: var(--radius-md, 6px);
      border: 1px solid var(--border-color, #e2e8f0);
      background: var(--surface-card, #fff);
      color: var(--text-primary, #1a202c);
      font-size: 13px;
      font-family: inherit;
      cursor: pointer;
      outline: none;
    }
    .status-filter:focus { border-color: var(--accent, #5f55ee); }
  `]
})
export class AgendaComponent implements OnInit, OnDestroy {
  isLoading = true;
  currentPage = 1;
  totalPages = 1;
  allAppointments: any[] = [];
  filteredAppointments: any[] = [];
  statuses: AppointmentStatus[] = [];
  searchTerm = '';
  statusFilter = '';
  private destroy$ = new Subject<void>();

  columns: TableColumn[] = [
    { key: 'artist', label: 'Artista', type: 'avatar-text' },
    { key: 'client', label: 'Cliente', type: 'text' },
    { key: 'status', label: 'Estado', type: 'status' },
    { key: 'date', label: 'Fecha Inicio', type: 'date' }
  ];

  get pagedAppointments(): any[] {
    const start = (this.currentPage - 1) * PAGE_SIZE;
    return this.filteredAppointments.slice(start, start + PAGE_SIZE);
  }

  constructor(
    private dialog: Dialog,
    private appointmentService: AppointmentService,
    private cdr: ChangeDetectorRef,
    private searchService: SearchService
  ) {}

  ngOnInit() {
    this.loadAppointments();
    this.searchService.search$.pipe(takeUntil(this.destroy$)).subscribe(term => {
      this.searchTerm = term;
      this.currentPage = 1;
      this.applyFilter();
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAppointments() {
    this.isLoading = true;
    forkJoin({
      appointments: this.appointmentService.getAppointments(),
      statuses: this.appointmentService.getStatuses(),
    }).subscribe({
      next: ({ appointments, statuses }) => {
        this.statuses = statuses;
        this.allAppointments = appointments.map(a => this.mapRow(a));
        this.applyFilter();
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.allAppointments = [];
        this.filteredAppointments = [];
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  onStatusFilter(event: Event) {
    this.statusFilter = (event.target as HTMLSelectElement).value;
    this.currentPage = 1;
    this.applyFilter();
  }

  private applyFilter() {
    let result = [...this.allAppointments];
    if (this.searchTerm) {
      result = result.filter(a =>
        a.client?.toLowerCase().includes(this.searchTerm) ||
        a.artist?.name?.toLowerCase().includes(this.searchTerm)
      );
    }
    if (this.statusFilter) {
      const id = Number(this.statusFilter);
      result = result.filter(a => a._raw?.statusId === id);
    }
    this.filteredAppointments = result;
    this.totalPages = Math.ceil(this.filteredAppointments.length / PAGE_SIZE) || 1;
  }

  private mapRow(a: Appointment): any {
    const name = a.tattooArtist?.fullName ?? 'Sin artista';
    return {
      _raw: a,
      artist: {
        name,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7c5cbf&color=fff&size=40`
      },
      client: a.client?.fullName ?? '—',
      status: a.status?.name ?? '—',
      date: new Date(a.appointmentStart)
    };
  }

  openNewAppointmentModal() {
    const ref = this.dialog.open(NewAppointmentFormComponent, {
      width: '520px',
      disableClose: true
    });

    ref.closed.subscribe((created: any) => {
      if (created) this.loadAppointments();
    });
  }

  openDetail(row: any) {
    const appointment: Appointment = row._raw;
    const ref = this.dialog.open(AppointmentDetailComponent, {
      width: '560px',
      disableClose: false,
      data: { appointmentId: appointment.id }
    });

    ref.closed.subscribe((updated: any) => {
      if (updated) this.loadAppointments();
    });
  }

  onPageChange(page: number) {
    this.currentPage = page;
  }
}
