import { ChangeDetectorRef, Component, Inject, OnInit, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { forkJoin, of } from 'rxjs';
import { ActionButtonComponent } from '../../../../components/shared/action-button/action-button.component';
import { DynamicModalComponent } from '../../../../components/shared/dynamic-modal/dynamic-modal.component';
import { QuotationService } from '../../../../core/services/quotation.service';
import { ClientService } from '../../../../core/services/client.service';
import { InventoryService } from '../../../../core/services/inventory.service';
import {
  Quotation, QuotationDesignAnalysis, QuotationMaterial,
  QuotationStatus, TattooStyle, TattooTechnique, TattooSize, BodyPart
} from '../../../../core/models/quotation.model';
import { Client } from '../../../../core/models/client.model';
import { Material } from '../../../../core/models/inventory.model';

interface EnrichedMaterial {
  name: string;
  estimatedQuantity?: number;
  unitCost?: number;
}

@Component({
  selector: 'app-quotation-detail',
  standalone: true,
  imports: [CommonModule, ActionButtonComponent, DynamicModalComponent],
  template: `
    <app-dynamic-modal [data]="{ title: 'Quote Detail' }">

      <div *ngIf="isLoading" class="loading-state">Loading...</div>

      <ng-container *ngIf="!isLoading && quotation">

        <div class="detail-header">
          <span class="quote-id">Quote #{{ quotation.id }}</span>
          <span class="status-badge" [ngClass]="statusClass">{{ statusLabel }}</span>
        </div>

        <!-- Client -->
        <section class="detail-section">
          <h3 class="section-title">Client</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">Name</span>
              <span class="detail-value">{{ client?.fullName ?? ('Client #' + quotation.clientId) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Email</span>
              <span class="detail-value">{{ client?.email ?? '—' }}</span>
            </div>
            <div class="detail-item" *ngIf="client?.phone">
              <span class="detail-label">Phone</span>
              <span class="detail-value">{{ client?.phone }}</span>
            </div>
            <div class="detail-item" *ngIf="quotation.createdAt">
              <span class="detail-label">Created</span>
              <span class="detail-value">{{ quotation.createdAt | date:'mediumDate' }}</span>
            </div>
          </div>
        </section>

        <!-- Design Analysis -->
        <section class="detail-section" *ngIf="design">
          <h3 class="section-title">Design Analysis</h3>
          <div class="detail-grid">
            <div class="detail-item" *ngIf="styleLabel">
              <span class="detail-label">Style</span>
              <span class="detail-value">{{ styleLabel }}</span>
            </div>
            <div class="detail-item" *ngIf="techniqueLabel">
              <span class="detail-label">Technique</span>
              <span class="detail-value">{{ techniqueLabel }}</span>
            </div>
            <div class="detail-item" *ngIf="sizeLabel">
              <span class="detail-label">Size</span>
              <span class="detail-value">{{ sizeLabel }}</span>
            </div>
            <div class="detail-item" *ngIf="bodyPartLabel">
              <span class="detail-label">Body Part</span>
              <span class="detail-value">{{ bodyPartLabel }}</span>
            </div>
            <div class="detail-item" *ngIf="design.estimatedSessions">
              <span class="detail-label">Est. Sessions</span>
              <span class="detail-value">{{ design.estimatedSessions }}</span>
            </div>
            <div class="detail-item" *ngIf="design.estimatedHours">
              <span class="detail-label">Est. Hours</span>
              <span class="detail-value">{{ design.estimatedHours }}h</span>
            </div>
          </div>
          <div *ngIf="design.designNotes" style="margin-top: 8px;">
            <span class="detail-label">Notes</span>
            <p class="notes-text">{{ design.designNotes }}</p>
          </div>
        </section>

        <!-- Materials -->
        <section class="detail-section" *ngIf="enrichedMaterials.length">
          <h3 class="section-title">Materials</h3>
          <table class="materials-table">
            <thead>
              <tr>
                <th>Material</th>
                <th>Qty</th>
                <th>Unit Cost</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let m of enrichedMaterials">
                <td>{{ m.name }}</td>
                <td>{{ m.estimatedQuantity ?? '—' }}</td>
                <td>{{ (m.unitCost ?? 0) | currency }}</td>
                <td>{{ ((m.unitCost ?? 0) * (m.estimatedQuantity ?? 0)) | currency }}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <!-- Total -->
        <div class="price-summary">
          <span class="price-label">Estimated Total</span>
          <span class="price-value">{{ (quotation.estimatedTotalPrice ?? 0) | currency }}</span>
        </div>

        <div *ngIf="actionError" class="action-error">{{ actionError }}</div>

        <!-- Footer -->
        <div class="modal-footer">
          <app-action-button text="Close" variant="secondary" (onClick)="onClose()" [disabled]="isActing">
          </app-action-button>
          <div style="flex:1"></div>
          <ng-container *ngIf="isPending">
            <app-action-button text="Reject" variant="danger" (onClick)="onChangeStatus('rejected')" [disabled]="isActing">
            </app-action-button>
            <app-action-button text="Authorize" variant="primary" (onClick)="onChangeStatus('authorized')" [disabled]="isActing">
            </app-action-button>
          </ng-container>
        </div>
      </ng-container>

    </app-dynamic-modal>
  `,
  styles: [`
    .loading-state { text-align: center; padding: 24px; color: var(--text-secondary, #64748b); font-size: 13px; }
    .detail-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
    .quote-id { font-size: 16px; font-weight: 600; color: var(--text-primary, #1a202c); }
    .status-badge {
      display: inline-block; padding: 3px 10px;
      border-radius: var(--radius-pill, 999px);
      font-size: 12px; font-weight: 600; text-transform: capitalize;
    }
    .badge-pending { background: #fef9c3; color: #854d0e; }
    .badge-authorized { background: #dcfce7; color: #15803d; }
    .badge-rejected { background: #fee2e2; color: #b91c1c; }
    .badge-default { background: var(--surface-hover); color: var(--text-secondary); }

    .detail-section { margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid var(--border-color, #e2e8f0); }
    .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary, #64748b); margin: 0 0 10px; }
    .detail-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
    .detail-item { display: flex; flex-direction: column; gap: 2px; }
    .detail-label { font-size: 11px; color: var(--text-secondary, #64748b); font-weight: 500; text-transform: uppercase; letter-spacing: 0.03em; }
    .detail-value { font-size: 13px; color: var(--text-primary, #1a202c); font-weight: 500; }
    .notes-text { font-size: 13px; color: var(--text-primary); margin: 4px 0 0; line-height: 1.5; }

    .materials-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .materials-table th { text-align: left; padding: 6px 8px; background: var(--surface-hover, #f8fafc); color: var(--text-secondary); font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.03em; border-bottom: 1px solid var(--border-color); }
    .materials-table td { padding: 8px; border-bottom: 1px solid var(--border-color, #e2e8f0); color: var(--text-primary); }
    .materials-table tr:last-child td { border-bottom: none; }

    .price-summary { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: var(--surface-hover, #f8fafc); border-radius: var(--radius-md, 6px); margin: 8px 0; }
    .price-label { font-size: 13px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; }
    .price-value { font-size: 20px; font-weight: 700; color: var(--accent, #5f55ee); }

    .action-error { padding: 8px 12px; background: #fee2e2; color: #b91c1c; border-radius: var(--radius-md, 6px); font-size: 13px; margin-top: 8px; }
    .modal-footer { display: flex; gap: 8px; margin-top: 20px; align-items: center; }
  `]
})
export class QuotationDetailComponent implements OnInit {
  quotation: Quotation | null = null;
  client: Client | null = null;
  design: QuotationDesignAnalysis | null = null;
  enrichedMaterials: EnrichedMaterial[] = [];
  statuses: QuotationStatus[] = [];

  tattooStyles: TattooStyle[] = [];
  tattooTechniques: TattooTechnique[] = [];
  tattooSizes: TattooSize[] = [];
  bodyParts: BodyPart[] = [];

  isLoading = false;
  isActing = false;
  actionError = '';

  constructor(
    private dialogRef: DialogRef,
    private quotationService: QuotationService,
    private clientService: ClientService,
    private inventoryService: InventoryService,
    private cdr: ChangeDetectorRef,
    @Optional() @Inject(DIALOG_DATA) public dialogData?: { quotation: Quotation }
  ) {}

  ngOnInit(): void {
    if (!this.dialogData?.quotation) return;
    this.quotation = this.dialogData.quotation;
    this.isLoading = true;

    forkJoin({
      clients: this.clientService.getClients(),
      materials: this.inventoryService.getMaterials(),
      statuses: this.quotationService.getStatuses(),
      styles: this.quotationService.getTattooStyles(),
      techniques: this.quotationService.getTattooTechniques(),
      sizes: this.quotationService.getTattooSizes(),
      bodyParts: this.quotationService.getBodyParts(),
      allDesigns: this.quotationService.getDesignAnalyses(),
      allQMaterials: this.quotationService.getQuotationMaterials(),
    }).subscribe({
      next: (res) => {
        this.statuses = res.statuses;
        this.tattooStyles = res.styles;
        this.tattooTechniques = res.techniques;
        this.tattooSizes = res.sizes;
        this.bodyParts = res.bodyParts;

        this.client = res.clients.find(c => c.id === this.quotation!.clientId) ?? null;

        this.design = res.allDesigns.find(d => d.quotationId === this.quotation!.id) ?? null;

        const qMats = res.allQMaterials.filter(m => m.quotationId === this.quotation!.id);
        this.enrichedMaterials = qMats.map(qm => {
          const mat = res.materials.find((m: Material) => m.id === qm.materialId);
          return {
            name: mat?.name ?? `Material #${qm.materialId}`,
            estimatedQuantity: qm.estimatedQuantity,
            unitCost: mat?.unitCost,
          };
        });

        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => { this.isLoading = false; this.cdr.markForCheck(); }
    });
  }

  get statusLabel(): string {
    if (!this.quotation) return '';
    const s = this.statuses.find(x => x.id === this.quotation!.statusId);
    return s?.name ?? `Status #${this.quotation.statusId}`;
  }

  get statusClass(): string {
    const label = this.statusLabel.toLowerCase();
    if (label.includes('pending') || label.includes('pendiente')) return 'status-badge badge-pending';
    if (label.includes('authoriz') || label.includes('autoriza') || label.includes('active')) return 'status-badge badge-authorized';
    if (label.includes('reject') || label.includes('rechaz') || label.includes('cancel')) return 'status-badge badge-rejected';
    return 'status-badge badge-default';
  }

  get isPending(): boolean {
    const label = this.statusLabel.toLowerCase();
    return label.includes('pending') || label.includes('pendiente');
  }

  get styleLabel(): string | null {
    return this.tattooStyles.find(s => s.id === this.design?.tattooStyleId)?.name ?? null;
  }
  get techniqueLabel(): string | null {
    return this.tattooTechniques.find(t => t.id === this.design?.tattooTechniqueId)?.name ?? null;
  }
  get sizeLabel(): string | null {
    return this.tattooSizes.find(s => s.id === this.design?.tattooSizeId)?.name ?? null;
  }
  get bodyPartLabel(): string | null {
    return this.bodyParts.find(b => b.id === this.design?.bodyPartId)?.name ?? null;
  }

  onChangeStatus(targetStatusName: 'authorized' | 'rejected') {
    if (!this.quotation?.id) return;

    const targetStatus = this.statuses.find(s =>
      s.name?.toLowerCase().includes(targetStatusName) ||
      (targetStatusName === 'authorized' && s.name?.toLowerCase().includes('autoriza')) ||
      (targetStatusName === 'rejected' && (s.name?.toLowerCase().includes('rechaz') || s.name?.toLowerCase().includes('cancel')))
    );

    if (!targetStatus) {
      this.actionError = `Status "${targetStatusName}" not found in the system.`;
      return;
    }

    this.isActing = true;
    this.actionError = '';

    this.quotationService.updateQuotation(this.quotation.id, {
      clientId: this.quotation.clientId,
      receptionistId: this.quotation.receptionistId,
      statusId: targetStatus.id,
      estimatedTotalPrice: this.quotation.estimatedTotalPrice,
    }).subscribe({
      next: () => this.dialogRef.close(true),
      error: () => {
        this.actionError = `Could not ${targetStatusName} the quote. Please try again.`;
        this.isActing = false;
      }
    });
  }

  onClose() {
    this.dialogRef.close();
  }
}
