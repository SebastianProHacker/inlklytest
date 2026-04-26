import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DashboardService, DashboardData } from './dashboard.service';
import { Appointment } from '../../core/models/appointment.model';
import { Quotation, QuotationStatus } from '../../core/models/quotation.model';
import { Material } from '../../core/models/inventory.model';
import { SystemEvent } from '../../core/services/system-event.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="view-container">

      <!-- KPI summary row -->
      <div class="kpi-row">
        <div class="kpi-card">
          <div class="kpi-icon appointments">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div class="kpi-body">
            <span class="kpi-value" *ngIf="!isLoading; else loadingKpi">{{ data?.todayAppointments?.length ?? 0 }}</span>
            <span class="kpi-label">Citas hoy</span>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon quotes">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
          <div class="kpi-body">
            <span class="kpi-value" *ngIf="!isLoading; else loadingKpi">{{ data?.pendingQuotations?.length ?? 0 }}</span>
            <span class="kpi-label">Cotizaciones pendientes</span>
          </div>
        </div>

        <div class="kpi-card" [class.alert]="(data?.stockAlerts?.length ?? 0) > 0">
          <div class="kpi-icon stock" [class.alert]="(data?.stockAlerts?.length ?? 0) > 0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27,6.96 12,12.01 20.73,6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
          </div>
          <div class="kpi-body">
            <span class="kpi-value" *ngIf="!isLoading; else loadingKpi">{{ data?.stockAlerts?.length ?? 0 }}</span>
            <span class="kpi-label">Alertas de inventario</span>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon activity">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <div class="kpi-body">
            <span class="kpi-value" *ngIf="!isLoading; else loadingKpi">{{ data?.recentActivity?.length ?? 0 }}</span>
            <span class="kpi-label">Eventos recientes</span>
          </div>
        </div>
      </div>

      <ng-template #loadingKpi>
        <span class="kpi-value skeleton-text">--</span>
      </ng-template>

      <!-- Error banner -->
      <div *ngIf="errorMessage" class="error-banner">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        {{ errorMessage }}
        <button class="retry-btn" (click)="load()">Reintentar</button>
      </div>

      <!-- Widgets grid -->
      <div class="widgets-grid">

        <!-- Widget: Citas de hoy -->
        <div class="widget">
          <div class="widget-header">
            <span class="widget-title">Citas de hoy</span>
            <a class="widget-link" (click)="goTo('/agenda')">Ver todas →</a>
          </div>
          <div *ngIf="isLoading" class="widget-loading">
            <div class="skeleton-row" *ngFor="let i of [1,2,3]"></div>
          </div>
          <div *ngIf="!isLoading">
            <div *ngIf="data!.todayAppointments.length === 0" class="empty-state">
              No hay citas programadas para hoy.
            </div>
            <div *ngFor="let a of data!.todayAppointments" class="list-row">
              <div class="row-avatar" [style.background]="avatarColor(a.tattooArtist?.fullName ?? '')">
                {{ initials(a.tattooArtist?.fullName ?? '?') }}
              </div>
              <div class="row-body">
                <span class="row-main">{{ a.client?.fullName ?? '—' }}</span>
                <span class="row-sub">{{ a.tattooArtist?.fullName ?? 'Sin artista' }} · {{ a.appointmentStart | date:'HH:mm' }}</span>
              </div>
              <span class="status-pill" [ngClass]="statusClass(a.status?.name)">
                {{ a.status?.name ?? '—' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Widget: Cotizaciones pendientes -->
        <div class="widget">
          <div class="widget-header">
            <span class="widget-title">Cotizaciones pendientes</span>
            <a class="widget-link" (click)="goTo('/quotes')">Ver todas →</a>
          </div>
          <div *ngIf="isLoading" class="widget-loading">
            <div class="skeleton-row" *ngFor="let i of [1,2,3]"></div>
          </div>
          <div *ngIf="!isLoading">
            <div *ngIf="data!.pendingQuotations.length === 0" class="empty-state">
              No hay cotizaciones pendientes.
            </div>
            <div *ngFor="let q of data!.pendingQuotations.slice(0, 8)" class="list-row">
              <div class="row-icon quotes-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                </svg>
              </div>
              <div class="row-body">
                <span class="row-main">Cotización #{{ q.id }}</span>
                <span class="row-sub">{{ getStatusName(q.statusId) }} · {{ q.createdAt ? (q.createdAt | date:'dd/MM/yyyy') : '—' }}</span>
              </div>
              <span class="row-price" *ngIf="q.estimatedTotalPrice">
                {{ q.estimatedTotalPrice | currency:'MXN':'symbol-narrow':'1.0-0' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Widget: Alertas de inventario -->
        <div class="widget">
          <div class="widget-header">
            <span class="widget-title">Alertas de inventario</span>
            <a class="widget-link" (click)="goTo('/warehouse')">Ver inventario →</a>
          </div>
          <div *ngIf="isLoading" class="widget-loading">
            <div class="skeleton-row" *ngFor="let i of [1,2,3]"></div>
          </div>
          <div *ngIf="!isLoading">
            <div *ngIf="data!.stockAlerts.length === 0" class="empty-state">
              <span class="ok-icon">✓</span> Todo el inventario está en niveles normales.
            </div>
            <div *ngFor="let m of data!.stockAlerts.slice(0, 8)" class="list-row">
              <span class="stock-dot" [ngClass]="m.stockStatus"></span>
              <div class="row-body">
                <span class="row-main">{{ m.name }}</span>
                <span class="row-sub">
                  Stock: {{ m.currentStock }} {{ m.unitMeasure }}
                  · Umbral: {{ m.averageConsumption ?? 5 }} {{ m.unitMeasure }}
                </span>
              </div>
              <span class="stock-badge" [ngClass]="m.stockStatus">
                {{ m.stockStatus === 'out' ? 'Sin stock' : 'Stock bajo' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Widget: Actividad reciente -->
        <div class="widget">
          <div class="widget-header">
            <span class="widget-title">Actividad reciente</span>
          </div>
          <div *ngIf="isLoading" class="widget-loading">
            <div class="skeleton-row" *ngFor="let i of [1,2,3]"></div>
          </div>
          <div *ngIf="!isLoading">
            <div *ngIf="data!.recentActivity.length === 0" class="empty-state">
              No hay actividad registrada.
            </div>
            <div *ngFor="let e of data!.recentActivity" class="list-row activity-row">
              <div class="activity-dot"></div>
              <div class="row-body">
                <span class="row-main">{{ e.eventType ?? 'Evento' }}</span>
                <span class="row-sub">{{ e.description ?? '—' }}</span>
              </div>
              <span class="row-time" *ngIf="e.createdAt">
                {{ e.createdAt | date:'dd/MM HH:mm' }}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .view-container { padding: 20px 0; }

    /* ── KPI Row ── */
    .kpi-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }

    .kpi-card {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 16px 20px;
      border-radius: var(--radius-md, 10px);
      background: var(--bg-card, #fff);
      border: 1px solid var(--border-color, #e5e7eb);
      transition: border-color 0.2s;
    }

    .kpi-card.alert {
      border-color: #fca5a5;
      background: #fff5f5;
    }

    .kpi-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 42px;
      height: 42px;
      border-radius: 10px;
      flex-shrink: 0;
    }

    .kpi-icon.appointments { background: #ede9fe; color: #7c3aed; }
    .kpi-icon.quotes        { background: #dbeafe; color: #2563eb; }
    .kpi-icon.stock         { background: #dcfce7; color: #16a34a; }
    .kpi-icon.stock.alert   { background: #fee2e2; color: #dc2626; }
    .kpi-icon.activity      { background: #fef3c7; color: #d97706; }

    .kpi-body {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .kpi-value {
      font-size: 26px;
      font-weight: 700;
      color: var(--text-main, #111);
      line-height: 1;
    }

    .kpi-label {
      font-size: 12px;
      color: var(--text-secondary, #888);
      font-weight: 500;
    }

    .skeleton-text { color: var(--border-color, #e5e7eb); }

    /* ── Error banner ── */
    .error-banner {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      margin-bottom: 20px;
      border-radius: var(--radius-md, 10px);
      background: #fee2e2;
      color: #b91c1c;
      font-size: 13px;
      font-weight: 500;
    }

    .retry-btn {
      margin-left: auto;
      background: none;
      border: 1px solid currentColor;
      color: inherit;
      padding: 3px 10px;
      border-radius: 999px;
      font-size: 12px;
      cursor: pointer;
      font-family: inherit;
    }

    /* ── Widgets Grid ── */
    .widgets-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .widget {
      border-radius: var(--radius-md, 10px);
      background: var(--bg-card, #fff);
      border: 1px solid var(--border-color, #e5e7eb);
      overflow: hidden;
    }

    .widget-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 18px;
      border-bottom: 1px solid var(--border-color, #e5e7eb);
    }

    .widget-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-main, #111);
    }

    .widget-link {
      font-size: 12px;
      color: var(--primary-purple, #5f55ee);
      cursor: pointer;
      text-decoration: none;
      font-weight: 500;
    }

    .widget-link:hover { text-decoration: underline; }

    /* ── Loading skeletons ── */
    .widget-loading { padding: 12px 18px; display: flex; flex-direction: column; gap: 10px; }

    .skeleton-row {
      height: 38px;
      border-radius: 6px;
      background: linear-gradient(90deg, #f3f4f6 25%, #e9eaec 50%, #f3f4f6 75%);
      background-size: 200% 100%;
      animation: shimmer 1.4s infinite;
    }

    @keyframes shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    /* ── List rows ── */
    .list-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 18px;
      border-bottom: 1px solid var(--border-color, #f3f4f6);
      font-size: 13px;
    }

    .list-row:last-child { border-bottom: none; }

    .row-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 700;
      color: #fff;
      flex-shrink: 0;
    }

    .row-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .quotes-icon { background: #dbeafe; color: #2563eb; }

    .row-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .row-main {
      font-weight: 500;
      color: var(--text-main, #111);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .row-sub {
      font-size: 11px;
      color: var(--text-secondary, #888);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .row-price {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-secondary, #555);
      white-space: nowrap;
    }

    .row-time {
      font-size: 11px;
      color: var(--text-secondary, #888);
      white-space: nowrap;
    }

    /* ── Status pill ── */
    .status-pill {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 500;
      white-space: nowrap;
    }

    .status-pill.programada   { background: #dbeafe; color: #1d4ed8; }
    .status-pill.completada   { background: #dcfce7; color: #15803d; }
    .status-pill.cancelada    { background: #fee2e2; color: #b91c1c; }
    .status-pill.default      { background: #f3f4f6; color: #555; }

    /* ── Stock ── */
    .stock-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .stock-dot.low { background: #f59e0b; }
    .stock-dot.out { background: #ef4444; }

    .stock-badge {
      font-size: 11px;
      font-weight: 500;
      padding: 2px 8px;
      border-radius: 999px;
      white-space: nowrap;
    }

    .stock-badge.low { background: #fef3c7; color: #92400e; }
    .stock-badge.out { background: #fee2e2; color: #b91c1c; }

    /* ── Activity ── */
    .activity-row { align-items: flex-start; padding-top: 12px; padding-bottom: 12px; }

    .activity-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--primary-purple, #5f55ee);
      flex-shrink: 0;
      margin-top: 4px;
    }

    /* ── Empty / ok states ── */
    .empty-state {
      padding: 28px 18px;
      text-align: center;
      color: var(--text-secondary, #888);
      font-size: 13px;
    }

    .ok-icon { color: #16a34a; font-weight: 700; margin-right: 4px; }

    /* ── Responsive ── */
    @media (max-width: 900px) {
      .kpi-row { grid-template-columns: repeat(2, 1fr); }
      .widgets-grid { grid-template-columns: 1fr; }
    }

    @media (max-width: 500px) {
      .kpi-row { grid-template-columns: 1fr 1fr; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  isLoading = true;
  errorMessage = '';
  data: DashboardData | null = null;

  constructor(
    private dashboardService: DashboardService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.isLoading = true;
    this.errorMessage = '';

    this.dashboardService.load().subscribe({
      next: (data) => {
        this.data = data;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar los datos del dashboard. Verifica tu conexión.';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  getStatusName(statusId: number): string {
    return this.data?.quotationStatuses.find(s => s.id === statusId)?.name ?? `Estado #${statusId}`;
  }

  goTo(path: string) {
    this.router.navigate([path]);
  }

  initials(name: string): string {
    return name
      .split(' ')
      .slice(0, 2)
      .map(w => w[0])
      .join('')
      .toUpperCase();
  }

  avatarColor(name: string): string {
    const colors = ['#7c5cbf', '#5f55ee', '#2563eb', '#0891b2', '#059669', '#d97706'];
    let hash = 0;
    for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffff;
    return colors[hash % colors.length];
  }

  statusClass(name?: string): string {
    if (!name) return 'default';
    const lower = name.toLowerCase();
    if (lower.includes('program') || lower.includes('schedul')) return 'programada';
    if (lower.includes('complet') || lower.includes('done') || lower.includes('finaliz')) return 'completada';
    if (lower.includes('cancel')) return 'cancelada';
    return 'default';
  }
}
