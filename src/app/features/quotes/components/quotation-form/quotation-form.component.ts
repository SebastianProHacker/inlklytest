import { ChangeDetectorRef, Component, OnInit, Optional, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { forkJoin, switchMap, of } from 'rxjs';
import { ActionButtonComponent } from '../../../../components/shared/action-button/action-button.component';
import { DynamicModalComponent } from '../../../../components/shared/dynamic-modal/dynamic-modal.component';
import { QuotationService } from '../../../../core/services/quotation.service';
import { ClientService } from '../../../../core/services/client.service';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { PricingService } from '../../../../core/services/pricing.service';
import { Client } from '../../../../core/models/client.model';
import { Material } from '../../../../core/models/inventory.model';
import { BasePrice, PricingRule, PricingConfiguration } from '../../../../core/models/pricing.model';
import { InventoryService } from '../../../../core/services/inventory.service';
import {
  TattooStyle, TattooTechnique, TattooSize, BodyPart, QuotationStatus
} from '../../../../core/models/quotation.model';

@Component({
  selector: 'app-quotation-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ActionButtonComponent, DynamicModalComponent],
  template: `
    <app-dynamic-modal [data]="{ title: 'New Quote' }">

      <!-- Step indicator -->
      <div class="steps-indicator">
        <div class="step" [class.active]="currentStep === 1" [class.done]="currentStep > 1">
          <div class="step-circle">{{ currentStep > 1 ? '✓' : '1' }}</div>
          <span>Client</span>
        </div>
        <div class="step-line" [class.done]="currentStep > 1"></div>
        <div class="step" [class.active]="currentStep === 2" [class.done]="currentStep > 2">
          <div class="step-circle">{{ currentStep > 2 ? '✓' : '2' }}</div>
          <span>Design</span>
        </div>
        <div class="step-line" [class.done]="currentStep > 2"></div>
        <div class="step" [class.active]="currentStep === 3">
          <div class="step-circle">3</div>
          <span>Materials</span>
        </div>
      </div>

      <form [formGroup]="form">

        <!-- STEP 1: Client -->
        <div *ngIf="currentStep === 1" class="step-content" formGroupName="step1">
          <div class="field-group">
            <label class="field-label">Client *</label>
            <select class="field-input" formControlName="clientId"
              [class.invalid]="isInvalid('step1', 'clientId')">
              <option value="">Select a client...</option>
              <option *ngFor="let c of clients" [value]="c.id">{{ c.fullName }} — {{ c.email }}</option>
            </select>
            <span class="field-error" *ngIf="isInvalid('step1', 'clientId')">Client is required.</span>
            <span class="field-note" *ngIf="loadingClients">Loading clients...</span>
            <span class="field-note error" *ngIf="clientsError">Could not load clients.</span>
          </div>
        </div>

        <!-- STEP 2: Design Analysis -->
        <div *ngIf="currentStep === 2" class="step-content" formGroupName="step2">
          <div class="fields-row">
            <div class="field-group">
              <label class="field-label">Style</label>
              <select class="field-input" formControlName="tattooStyleId">
                <option value="">Select style...</option>
                <option *ngFor="let s of tattooStyles" [value]="s.id">{{ s.name }}</option>
              </select>
            </div>
            <div class="field-group">
              <label class="field-label">Technique</label>
              <select class="field-input" formControlName="tattooTechniqueId">
                <option value="">Select technique...</option>
                <option *ngFor="let t of tattooTechniques" [value]="t.id">{{ t.name }}</option>
              </select>
            </div>
          </div>

          <div class="fields-row">
            <div class="field-group">
              <label class="field-label">Size</label>
              <select class="field-input" formControlName="tattooSizeId">
                <option value="">Select size...</option>
                <option *ngFor="let s of tattooSizes" [value]="s.id">
                  {{ s.name }}{{ s.sizeCmMin != null ? ' (' + s.sizeCmMin + '–' + s.sizeCmMax + ' cm)' : '' }}
                </option>
              </select>
            </div>
            <div class="field-group">
              <label class="field-label">Body Part</label>
              <select class="field-input" formControlName="bodyPartId">
                <option value="">Select body part...</option>
                <option *ngFor="let b of bodyParts" [value]="b.id">{{ b.name }}</option>
              </select>
            </div>
          </div>

          <div class="fields-row">
            <div class="field-group">
              <label class="field-label">Est. Sessions</label>
              <input class="field-input" type="number" formControlName="estimatedSessions"
                min="1" placeholder="1">
            </div>
            <div class="field-group">
              <label class="field-label">Est. Hours</label>
              <input class="field-input" type="number" formControlName="estimatedHours"
                min="0.5" step="0.5" placeholder="2">
            </div>
          </div>

          <div class="field-group">
            <label class="field-label">Design Notes</label>
            <textarea class="field-input field-textarea" formControlName="designNotes"
              placeholder="Describe the design, references, special requirements..."></textarea>
          </div>

          <span class="field-note" *ngIf="loadingLookups">Loading options...</span>
        </div>

        <!-- STEP 3: Materials + Price -->
        <div *ngIf="currentStep === 3" class="step-content" formGroupName="step3">
          <div class="materials-header">
            <span class="field-label">Materials</span>
            <button type="button" class="add-material-btn" (click)="addMaterial()">+ Add material</button>
          </div>

          <div formArrayName="materials">
            <div *ngFor="let mat of materialsArray.controls; let i = index"
              [formGroupName]="i" class="material-row">
              <select class="field-input material-select" formControlName="materialId">
                <option value="">Select material...</option>
                <option *ngFor="let m of availableMaterials" [value]="m.id">
                  {{ m.name }} ({{ m.unitMeasure }}) — \${{ m.unitCost }}
                </option>
              </select>
              <input class="field-input material-qty" type="number" formControlName="estimatedQuantity"
                min="0.1" step="0.1" placeholder="Qty">
              <button type="button" class="remove-btn" (click)="removeMaterial(i)">×</button>
            </div>
          </div>

          <div *ngIf="materialsArray.length === 0" class="empty-materials">
            No materials added.
          </div>

          <!-- Price estimate -->
          <div class="price-section">
            <div class="price-estimate-label">Estimated Total</div>
            <div class="price-value">{{ estimatedPrice | currency }}</div>
            <div class="price-note">{{ priceBreakdown }}</div>
          </div>

          <div class="field-group" style="margin-top: 12px;">
            <label class="field-label">Manual price adjustment</label>
            <input class="field-input field-input--short" type="number" formControlName="manualPrice"
              min="0" placeholder="Override price...">
          </div>
        </div>

      </form>



      <div *ngIf="errorMessage" class="submit-error">{{ errorMessage }}</div>

      <!-- Footer -->
      <div class="modal-footer">
        <app-action-button
          *ngIf="currentStep > 1"
          text="Back"
          variant="secondary"
          (onClick)="prevStep()"
          [disabled]="isSubmitting">
        </app-action-button>
        <div style="flex:1"></div>
        <app-action-button
          text="Cancel"
          variant="secondary"
          (onClick)="onCancel()"
          [disabled]="isSubmitting">
        </app-action-button>
        <app-action-button
          *ngIf="currentStep < 3"
          text="Next"
          variant="primary"
          (onClick)="nextStep()">
        </app-action-button>
        <app-action-button
          *ngIf="currentStep === 3"
          text="Create Quote"
          variant="primary"
          (onClick)="onSubmit()"
          [disabled]="isSubmitting">
        </app-action-button>
      </div>
    </app-dynamic-modal>
  `,
  styles: [`
    .steps-indicator {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 24px;
    }
    .step { display: flex; flex-direction: column; align-items: center; gap: 4px; }
    .step-circle {
      width: 28px; height: 28px; border-radius: 50%;
      background: var(--surface-hover, #f1f5f9);
      border: 2px solid var(--border-color, #e2e8f0);
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 600; color: var(--text-secondary, #64748b);
      transition: all 0.2s;
    }
    .step.active .step-circle { background: var(--accent, #5f55ee); border-color: var(--accent, #5f55ee); color: white; }
    .step.done .step-circle { background: #dcfce7; border-color: #22c55e; color: #15803d; }
    .step span { font-size: 11px; color: var(--text-secondary, #64748b); font-weight: 500; }
    .step.active span { color: var(--accent, #5f55ee); font-weight: 600; }
    .step-line {
      flex: 1; height: 2px; min-width: 40px; margin: 0 8px; margin-bottom: 16px;
      background: var(--border-color, #e2e8f0); transition: background 0.2s;
    }
    .step-line.done { background: #22c55e; }

    .step-content { display: flex; flex-direction: column; gap: 12px; }
    .fields-row { display: flex; gap: 12px; }
    .fields-row .field-group { flex: 1; }
    .field-group { display: flex; flex-direction: column; gap: 4px; }
    .field-label { font-size: 13px; font-weight: 500; color: var(--text-primary, #1a202c); }
    .field-input {
      height: 36px; padding: 0 12px;
      border: 1px solid var(--border-color, #e2e8f0);
      border-radius: var(--radius-md, 6px);
      background: var(--surface-card, #fff);
      font-size: 13px; font-family: inherit; color: var(--text-primary, #1a202c);
      outline: none; width: 100%; box-sizing: border-box;
    }
    .field-input:focus { border-color: var(--accent, #5f55ee); }
    .field-input.invalid { border-color: #ef4444; }
    .field-input--short { max-width: 140px; }
    .field-textarea { height: auto; min-height: 72px; padding: 8px 12px; resize: vertical; }
    .field-error { font-size: 11px; color: #ef4444; }
    .field-note { font-size: 12px; color: var(--text-secondary, #64748b); }
    .field-note.error { color: #ef4444; }

    .materials-header { display: flex; align-items: center; justify-content: space-between; }
    .add-material-btn {
      background: none; border: 1px dashed var(--accent, #5f55ee);
      color: var(--accent, #5f55ee); padding: 4px 10px;
      border-radius: var(--radius-md, 6px); font-size: 12px; font-family: inherit; cursor: pointer;
    }
    .add-material-btn:hover { background: var(--surface-hover, #f1f5f9); }
    .material-row { display: flex; gap: 8px; align-items: center; margin-bottom: 8px; }
    .material-select { flex: 1; }
    .material-qty { width: 80px; flex-shrink: 0; }
    .remove-btn { background: none; border: none; color: #ef4444; font-size: 18px; cursor: pointer; padding: 0 4px; }
    .empty-materials { font-size: 12px; color: var(--text-secondary, #64748b); padding: 8px 0; font-style: italic; }

    .price-section {
      margin-top: 12px; padding: 12px 16px;
      background: var(--surface-hover, #f8fafc);
      border-radius: var(--radius-md, 6px);
      border: 1px solid var(--border-color, #e2e8f0);
    }
    .price-estimate-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary, #64748b); font-weight: 600; }
    .price-value { font-size: 22px; font-weight: 700; color: var(--accent, #5f55ee); margin: 2px 0; }
    .price-note { font-size: 11px; color: var(--text-secondary, #64748b); }

    .submit-error {
      margin-top: 8px; padding: 8px 12px;
      background: var(--status-cancelled-bg); color: var(--status-cancelled-text);
      border-radius: var(--radius-md, 6px); font-size: 13px;
    }
    .modal-footer { display: flex; gap: 8px; margin-top: 20px; align-items: center; }
  `]
})
export class QuotationFormComponent implements OnInit {
  form: FormGroup;
  currentStep = 1;

  clients: Client[] = [];
  loadingClients = false;
  clientsError = false;

  tattooStyles: TattooStyle[] = [];
  tattooTechniques: TattooTechnique[] = [];
  tattooSizes: TattooSize[] = [];
  bodyParts: BodyPart[] = [];
  statuses: QuotationStatus[] = [];
  loadingLookups = false;

  availableMaterials: Material[] = [];
  basePrices: BasePrice[] = [];
  pricingRules: PricingRule[] = [];
  pricingConfiguration: PricingConfiguration | null = null;

  isSubmitting = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private dialogRef: DialogRef,
    private quotationService: QuotationService,
    private clientService: ClientService,
    private inventoryService: InventoryService,
    private pricingService: PricingService,
    private authService: AuthService,
    private notifications: NotificationService,
    private cdr: ChangeDetectorRef,
    @Optional() @Inject(DIALOG_DATA) public dialogData?: any
  ) {
    this.form = this.fb.group({
      step1: this.fb.group({
        clientId: ['', Validators.required],
      }),
      step2: this.fb.group({
        tattooStyleId: [null],
        tattooTechniqueId: [null],
        tattooSizeId: [null],
        bodyPartId: [null],
        estimatedSessions: [null],
        estimatedHours: [null],
        designNotes: [''],
      }),
      step3: this.fb.group({
        materials: this.fb.array([]),
        manualPrice: [null],
      }),
    });
  }

  ngOnInit(): void {
    this.loadClients();
    this.loadLookups();
    this.loadMaterials();
    this.pricingService.getBasePrices().subscribe({
      next: (data) => { this.basePrices = Array.isArray(data) ? data : (data as any)?.data ?? []; this.cdr.markForCheck(); },
      error: () => {}
    });
    this.pricingService.getPricingRules().subscribe({
      next: (data) => { this.pricingRules = Array.isArray(data) ? data : (data as any)?.data ?? []; this.cdr.markForCheck(); },
      error: () => {}
    });
    this.pricingService.getPricingConfiguration().subscribe({
      next: (data) => { this.pricingConfiguration = data ?? null; this.cdr.markForCheck(); },
      error: () => { this.pricingConfiguration = null; }
    });
  }

  get materialsArray(): FormArray {
    return this.form.get('step3.materials') as FormArray;
  }

  get selectedSize(): TattooSize | undefined {
    const sizeId = this.form.get('step2.tattooSizeId')?.value;
    return sizeId ? this.tattooSizes.find(s => s.id === Number(sizeId)) : undefined;
  }

  get estimatedPrice(): number {
    const manual = this.form.get('step3.manualPrice')?.value;
    if (manual && Number(manual) > 0) return Number(manual);
    return this.computeAutoPrice();
  }

  get priceBreakdown(): string {
    try {
      const b = this.computeBreakdown();
      if (!b) return '';
      const lines: string[] = [];
      if (b.basePrice) lines.push(`talla: ${this.formatMoney(b.basePrice)}`);
      if (b.hoursCost) lines.push(`horas: ${this.formatMoney(b.hoursCost)}`);
      if (b.sessionsCost) lines.push(`sesiones: ${this.formatMoney(b.sessionsCost)}`);
      if (b.materialsCost) lines.push(`materiales: ${this.formatMoney(b.materialsCost)}`);
      if (b.styleModifier) lines.push(`estilo: ${this.formatMoney(b.styleModifier)}`);
      if (b.bodyPartModifier) lines.push(`parte del cuerpo: ${this.formatMoney(b.bodyPartModifier)}`);
      if (b.styleMultiplier !== 1) lines.push(`× estilo ${b.styleMultiplier.toFixed(2)}`);
      if (b.bodyPartMultiplier !== 1) lines.push(`× parte ${b.bodyPartMultiplier.toFixed(2)}`);
      if (b.rulesMultiplier !== 1) lines.push(`× reglas ${b.rulesMultiplier.toFixed(2)}`);
      return lines.length ? `Desglose: ${lines.join(' + ')}` : 'Sin factores configurados';
    } catch { return ''; }
  }

  private computeAutoPrice(): number {
    const b = this.computeBreakdown();
    return b ? b.total : 0;
  }

  private computeBreakdown(): {
    basePrice: number;
    hoursCost: number;
    sessionsCost: number;
    styleModifier: number;
    styleMultiplier: number;
    bodyPartModifier: number;
    bodyPartMultiplier: number;
    materialsCost: number;
    rulesMultiplier: number;
    total: number;
  } | null {
    try {
      const s2 = this.form.get('step2')?.value;
      const sizeId = s2?.tattooSizeId ? Number(s2.tattooSizeId) : null;
      const styleId = s2?.tattooStyleId ? Number(s2.tattooStyleId) : null;
      const bodyPartId = s2?.bodyPartId ? Number(s2.bodyPartId) : null;
      const hours = Number(s2?.estimatedHours) || 0;
      const sessions = Number(s2?.estimatedSessions) || 0;

      const safeBasePrices = Array.isArray(this.basePrices) ? this.basePrices : [];
      const safeRules = Array.isArray(this.pricingRules) ? this.pricingRules : [];

      const bp = sizeId ? safeBasePrices.find(b => b.tattooSizeId === sizeId) : null;
      const basePrice = Number(bp?.basePrice1 ?? 0);

      const hourlyRate = Number(this.pricingConfiguration?.hourlyRate ?? 0);
      const sessionCost = Number(this.pricingConfiguration?.sessionCost ?? 0);
      const hoursCost = hours * hourlyRate;
      const sessionsCost = sessions * sessionCost;

      const style = styleId ? this.tattooStyles.find(s => Number(s.id) === styleId) : null;
      const bodyPart = bodyPartId ? this.bodyParts.find(b => Number(b.id) === bodyPartId) : null;

      const styleModifier = style?.priceModifier != null ? Number(style.priceModifier) : 0;
      const bodyPartModifier = bodyPart?.priceModifier != null ? Number(bodyPart.priceModifier) : 0;
      const styleMultiplier = style?.priceMultiplier != null && Number(style.priceMultiplier) > 0
        ? Number(style.priceMultiplier) : 1;
      const bodyPartMultiplier = bodyPart?.priceMultiplier != null && Number(bodyPart.priceMultiplier) > 0
        ? Number(bodyPart.priceMultiplier) : 1;

      let materialsCost = 0;
      const mats = this.materialsArray.value as any[];
      mats.forEach((m: any) => {
        if (!m.materialId) return;
        const mat = this.availableMaterials.find(x => x.id === Number(m.materialId));
        if (mat) materialsCost += (mat.unitCost ?? 0) * (Number(m.estimatedQuantity) || 1);
      });

      const rulesMultiplier = safeRules
        .filter(r => r.isActive && r.multiplier)
        .reduce((acc, r) => acc * (r.multiplier ?? 1), 1);

      const subtotalFixed = basePrice + hoursCost + sessionsCost + materialsCost + styleModifier + bodyPartModifier;
      const total = subtotalFixed * styleMultiplier * bodyPartMultiplier * rulesMultiplier;

      return {
        basePrice,
        hoursCost,
        sessionsCost,
        styleModifier,
        styleMultiplier,
        bodyPartModifier,
        bodyPartMultiplier,
        materialsCost,
        rulesMultiplier,
        total
      };
    } catch { return null; }
  }

  private formatMoney(value: number): string {
    return `$${(value || 0).toFixed(2)}`;
  }

  private loadClients() {
    this.loadingClients = true;
    this.clientService.getClients().subscribe({
      next: (data) => { this.clients = data; this.loadingClients = false; this.cdr.markForCheck(); },
      error: () => { this.loadingClients = false; this.clientsError = true; this.cdr.markForCheck(); }
    });
  }

  private loadLookups() {
    this.loadingLookups = true;
    forkJoin({
      styles: this.quotationService.getTattooStyles(),
      techniques: this.quotationService.getTattooTechniques(),
      sizes: this.quotationService.getTattooSizes(),
      bodyParts: this.quotationService.getBodyParts(),
      statuses: this.quotationService.getStatuses(),
    }).subscribe({
      next: (res) => {
        this.tattooStyles = res.styles;
        this.tattooTechniques = res.techniques;
        this.tattooSizes = res.sizes;
        this.bodyParts = res.bodyParts;
        this.statuses = res.statuses;
        this.loadingLookups = false;
        this.cdr.markForCheck();
      },
      error: () => { this.loadingLookups = false; this.cdr.markForCheck(); }
    });
  }

  private loadMaterials() {
    this.inventoryService.getMaterials().subscribe({
      next: (data) => { this.availableMaterials = data; this.cdr.markForCheck(); },
      error: () => {}
    });
  }

  isInvalid(group: string, field: string): boolean {
    const ctrl = this.form.get(`${group}.${field}`);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  addMaterial() {
    this.materialsArray.push(this.fb.group({
      materialId: [''],
      estimatedQuantity: [1, Validators.min(0.1)],
    }));
  }

  removeMaterial(index: number) {
    this.materialsArray.removeAt(index);
  }

  nextStep() {
    const group = this.form.get(`step${this.currentStep}`);
    if (group?.invalid) { group.markAllAsTouched(); return; }
    this.currentStep++;
  }

  prevStep() {
    if (this.currentStep > 1) this.currentStep--;
  }

  onSubmit() {
    this.form.markAllAsTouched();
    if (this.form.get('step1')?.invalid) { this.currentStep = 1; return; }

    this.isSubmitting = true;
    this.errorMessage = '';

    const s1 = this.form.get('step1')!.value;
    const s2 = this.form.get('step2')!.value;
    const s3 = this.form.get('step3')!.value;

    const receptionistId = this.authService.getCurrentUserId();
    if (!receptionistId) {
      this.notifications.error('Sesión expirada. Por favor inicia sesión de nuevo.');
      this.isSubmitting = false;
      return;
    }

    // Find "pending" status ID (fallback to 1 if not found)
    const pendingStatus = this.statuses.find(s =>
      s.name?.toLowerCase().includes('pending') ||
      s.name?.toLowerCase().includes('pendiente')
    );
    const statusId = pendingStatus?.id ?? 1;

    const manualPrice = s3.manualPrice ? Number(s3.manualPrice) : this.estimatedPrice;

    // Step 1: Create quotation
    this.quotationService.createQuotation({
      clientId: Number(s1.clientId),
      receptionistId,
      statusId,
      estimatedTotalPrice: manualPrice || undefined,
    }).pipe(
      switchMap((quotation) => {
        const qId = quotation.id!;

        // Step 2: Create design analysis (only if any design field filled)
        const hasDesign = s2.tattooStyleId || s2.tattooTechniqueId || s2.tattooSizeId ||
          s2.bodyPartId || s2.estimatedSessions || s2.estimatedHours || s2.designNotes;

        const designCall$ = hasDesign
          ? this.quotationService.createDesignAnalysis({
              quotationId: qId,
              tattooStyleId: s2.tattooStyleId ? Number(s2.tattooStyleId) : undefined,
              tattooTechniqueId: s2.tattooTechniqueId ? Number(s2.tattooTechniqueId) : undefined,
              tattooSizeId: s2.tattooSizeId ? Number(s2.tattooSizeId) : undefined,
              bodyPartId: s2.bodyPartId ? Number(s2.bodyPartId) : undefined,
              estimatedSessions: s2.estimatedSessions ? Number(s2.estimatedSessions) : undefined,
              estimatedHours: s2.estimatedHours ? Number(s2.estimatedHours) : undefined,
              designNotes: s2.designNotes || undefined,
            })
          : of(null);

        // Step 3: Add materials (parallel calls)
        const validMaterials = (s3.materials as any[]).filter(m => m.materialId);
        const materialCalls$ = validMaterials.length
          ? forkJoin(validMaterials.map(m =>
              this.quotationService.createQuotationMaterial({
                quotationId: qId,
                materialId: Number(m.materialId),
                estimatedQuantity: m.estimatedQuantity ? Number(m.estimatedQuantity) : undefined,
              })
            ))
          : of([]);

        return forkJoin([designCall$, materialCalls$]);
      })
    ).subscribe({
      next: () => {
        this.notifications.success('Cotización creada correctamente.');
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err?.error?.message ?? 'Error al crear la cotización. Intenta de nuevo.';
        this.cdr.markForCheck();
      }
    });
  }

  onCancel() {
    this.dialogRef.close();
  }
}
