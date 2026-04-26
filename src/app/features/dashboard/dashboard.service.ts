import { Injectable } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AppointmentService } from '../../core/services/appointment.service';
import { QuotationService } from '../../core/services/quotation.service';
import { InventoryService } from '../../core/services/inventory.service';
import { SystemEventService, SystemEvent } from '../../core/services/system-event.service';
import { Appointment } from '../../core/models/appointment.model';
import { Quotation, QuotationStatus } from '../../core/models/quotation.model';
import { Material, InventoryMovement } from '../../core/models/inventory.model';

export interface DashboardData {
  todayAppointments: Appointment[];
  pendingQuotations: Quotation[];
  quotationStatuses: QuotationStatus[];
  stockAlerts: Material[];
  recentActivity: SystemEvent[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(
    private appointmentService: AppointmentService,
    private quotationService: QuotationService,
    private inventoryService: InventoryService,
    private systemEventService: SystemEventService
  ) {}

  load(): Observable<DashboardData> {
    return forkJoin({
      appointments: this.appointmentService.getAppointments().pipe(catchError(() => of([]))),
      quotations: this.quotationService.getQuotations().pipe(catchError(() => of([]))),
      quotationStatuses: this.quotationService.getStatuses().pipe(catchError(() => of([]))),
      materials: this.inventoryService.getMaterials().pipe(catchError(() => of([]))),
      movements: this.inventoryService.getInventoryMovements().pipe(catchError(() => of([]))),
      systemEvents: this.systemEventService.getSystemEvents().pipe(catchError(() => of([]))),
    }).pipe(
      map(({ appointments, quotations, quotationStatuses, materials, movements, systemEvents }) => {
        const today = new Date();
        const todayStr = today.toISOString().slice(0, 10);

        const todayAppointments = appointments.filter(a => {
          if (!a.appointmentStart) return false;
          return a.appointmentStart.slice(0, 10) === todayStr;
        });

        const pendingStatusIds = new Set(
          quotationStatuses
            .filter(s => s.name?.toLowerCase().includes('pend'))
            .map(s => s.id)
        );
        const pendingQuotations = quotations.filter(q =>
          pendingStatusIds.size > 0
            ? pendingStatusIds.has(q.statusId)
            : !q.confirmedAt
        );

        const stockAlerts = this.computeStockAlerts(materials, movements);

        const recentActivity = [...systemEvents]
          .sort((a, b) => {
            const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return tb - ta;
          })
          .slice(0, 10);

        return { todayAppointments, pendingQuotations, quotationStatuses, stockAlerts, recentActivity };
      })
    );
  }

  private computeStockAlerts(materials: Material[], movements: InventoryMovement[]): Material[] {
    const stockMap = new Map<number, number>();
    for (const mv of movements) {
      const current = stockMap.get(mv.materialId) ?? 0;
      const delta = mv.movementType === 'entrada' ? mv.quantity : -mv.quantity;
      stockMap.set(mv.materialId, current + delta);
    }

    return materials
      .map(m => {
        const stock = stockMap.get(m.id!) ?? 0;
        const threshold = m.averageConsumption ?? 5;
        let stockStatus: 'ok' | 'low' | 'out' = 'ok';
        if (stock <= 0) stockStatus = 'out';
        else if (stock <= threshold) stockStatus = 'low';
        return { ...m, currentStock: stock, stockStatus };
      })
      .filter(m => m.stockStatus !== 'ok');
  }
}
