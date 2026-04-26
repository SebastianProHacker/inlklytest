import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ActionButtonComponent } from '../../../../components/shared/action-button/action-button.component';
import { PricingService } from '../../../../core/services/pricing.service';
import { QuotationService } from '../../../../core/services/quotation.service';
import { NotificationService } from '../../../../core/services/notification.service';
import {
  PricingConfiguration,
  StylePricing,
  BodyPartPricing
} from '../../../../core/models/pricing.model';

@Component({
  selector: 'app-pricing-config-tab',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ActionButtonComponent],
  template: `
    <div class="config-container">
      <section class="config-section">
        <header class="section-header">
          <h3 class="section-title">Global Settings</h3>
          <p class="section-subtitle">Hourly rate and per-session cost applied to every quote.</p>
        </header>

        <form [formGroup]="globalForm" class="global-form" (ngSubmit)="saveGlobal()">
          <div class="fields-row">
            <div class="field-group">
              <label class="field-label">Hourly rate (MXN/hr)</label>
              <input type="number" min="0" step="0.01" class="field-input" formControlName="hourlyRate" placeholder="e.g. 600">
            </div>
            <div class="field-group">
              <label class="field-label">Additional session cost (MXN)</label>
              <input type="number" min="0" step="0.01" class="field-input" formControlName="sessionCost" placeholder="e.g. 60">
            </div>
          </div>
          <div class="actions-row">
            <app-action-button text="Save settings" variant="primary" [disabled]="savingGlobal" (onClick)="saveGlobal()"></app-action-button>
            <span class="status-note" *ngIf="savingGlobal">Saving...</span>
            <span class="status-note ok" *ngIf="globalSaved && !savingGlobal">Saved.</span>
          </div>
        </form>
      </section>

      <section class="config-section">
        <header class="section-header">
          <h3 class="section-title">Style modifiers</h3>
          <p class="section-subtitle">Fixed amount (MXN) added to the base price, and/or multiplier applied to the base. Leave blank for no effect.</p>
        </header>

        <div *ngIf="loadingStyles" class="loading-note">Loading...</div>

        <form [formGroup]="stylesForm" *ngIf="!loadingStyles">
          <div class="modifier-grid" formArrayName="items">
            <div class="modifier-row header-row">
              <span>Style</span>
              <span>Fixed (+MXN)</span>
              <span>Multiplier (×)</span>
              <span></span>
            </div>
            <div class="modifier-row"
                 *ngFor="let item of styleItems.controls; let i = index"
                 [formGroupName]="i">
              <div class="modifier-name">{{ item.get('name')?.value }}</div>
              <input type="number" step="0.01" class="field-input compact" formControlName="priceModifier" placeholder="0">
              <input type="number" step="0.0001" class="field-input compact" formControlName="priceMultiplier" placeholder="1">
              <app-action-button text="Save" variant="secondary" [disabled]="!!savingStyleIds[item.get('id')?.value]" (onClick)="saveStyle(i)"></app-action-button>
            </div>
          </div>
          <p class="empty-note" *ngIf="styleItems.length === 0">No styles registered.</p>
        </form>
      </section>

      <section class="config-section">
        <header class="section-header">
          <h3 class="section-title">Body part modifiers</h3>
          <p class="section-subtitle">Fixed amount (MXN) added to the base price, and/or multiplier applied to the base. Leave blank for no effect.</p>
        </header>

        <div *ngIf="loadingBodyParts" class="loading-note">Loading...</div>

        <form [formGroup]="bodyPartsForm" *ngIf="!loadingBodyParts">
          <div class="modifier-grid" formArrayName="items">
            <div class="modifier-row header-row">
              <span>Body part</span>
              <span>Fixed (+MXN)</span>
              <span>Multiplier (×)</span>
              <span></span>
            </div>
            <div class="modifier-row"
                 *ngFor="let item of bodyPartItems.controls; let i = index"
                 [formGroupName]="i">
              <div class="modifier-name">{{ item.get('name')?.value }}</div>
              <input type="number" step="0.01" class="field-input compact" formControlName="priceModifier" placeholder="0">
              <input type="number" step="0.0001" class="field-input compact" formControlName="priceMultiplier" placeholder="1">
              <app-action-button text="Save" variant="secondary" [disabled]="!!savingBodyPartIds[item.get('id')?.value]" (onClick)="saveBodyPart(i)"></app-action-button>
            </div>
          </div>
          <p class="empty-note" *ngIf="bodyPartItems.length === 0">No body parts registered.</p>
        </form>
      </section>
    </div>
  `,
  styles: [`
    .config-container { display: flex; flex-direction: column; gap: 24px; }
    .config-section {
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 16px 18px;
      background: var(--panel-bg, transparent);
    }
    .section-header { margin-bottom: 12px; }
    .section-title { font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 0 0 2px; }
    .section-subtitle { font-size: 12px; color: var(--text-secondary); margin: 0; }
    .fields-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 10px; }
    .field-group { display: flex; flex-direction: column; gap: 4px; }
    .field-label { font-size: 12px; color: var(--text-secondary); font-weight: 500; }
    .field-input {
      padding: 8px 10px; border: 1px solid var(--border-color); border-radius: var(--radius-sm);
      font-size: 13px; background: var(--input-bg, transparent); color: var(--text-primary); font-family: inherit;
    }
    .field-input.compact { padding: 6px 8px; font-size: 12px; }
    .field-input:focus { outline: none; border-color: var(--accent-color); }
    .actions-row { display: flex; align-items: center; gap: 10px; }
    .status-note { font-size: 12px; color: var(--text-secondary); }
    .status-note.ok { color: var(--accent-color); }
    .loading-note, .empty-note { font-size: 12px; color: var(--text-secondary); padding: 8px 0; }
    .modifier-grid { display: flex; flex-direction: column; gap: 4px; }
    .modifier-row {
      display: grid;
      grid-template-columns: minmax(160px, 2fr) minmax(110px, 1fr) minmax(110px, 1fr) auto;
      gap: 8px; align-items: center; padding: 6px 0;
    }
    .modifier-row.header-row {
      font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em;
      color: var(--text-secondary); border-bottom: 1px solid var(--border-color); padding-bottom: 8px; margin-bottom: 4px;
    }
    .modifier-name { font-size: 13px; color: var(--text-primary); font-weight: 500; }
  `]
})
export class PricingConfigTabComponent implements OnInit {
  globalForm: FormGroup;
  stylesForm: FormGroup;
  bodyPartsForm: FormGroup;

  savingGlobal = false;
  globalSaved = false;
  loadingStyles = false;
  loadingBodyParts = false;
  savingStyleIds: Record<string, boolean> = {};
  savingBodyPartIds: Record<string, boolean> = {};

  constructor(
    private fb: FormBuilder,
    private pricingService: PricingService,
    private quotationService: QuotationService,
    private notifications: NotificationService,
    private cdr: ChangeDetectorRef
  ) {
    this.globalForm = this.fb.group({
      hourlyRate: [null, [Validators.min(0)]],
      sessionCost: [null, [Validators.min(0)]]
    });
    this.stylesForm = this.fb.group({ items: this.fb.array([]) });
    this.bodyPartsForm = this.fb.group({ items: this.fb.array([]) });
  }

  ngOnInit(): void {
    this.loadAll();
  }

  get styleItems(): FormArray {
    return this.stylesForm.get('items') as FormArray;
  }

  get bodyPartItems(): FormArray {
    return this.bodyPartsForm.get('items') as FormArray;
  }

  private loadAll() {
    this.loadingStyles = true;
    this.loadingBodyParts = true;

    forkJoin({
      config: this.pricingService.getPricingConfiguration(),
      styles: this.quotationService.getTattooStyles(),
      bodyParts: this.quotationService.getBodyParts()
    }).subscribe({
      next: ({ config, styles, bodyParts }) => {
        this.globalForm.patchValue({
          hourlyRate: config?.hourlyRate ?? null,
          sessionCost: config?.sessionCost ?? null
        });

        this.styleItems.clear();
        (styles ?? []).forEach((s: any) => {
          this.styleItems.push(this.fb.group({
            id: [s.id],
            name: [s.name],
            priceModifier: [s.priceModifier ?? null],
            priceMultiplier: [s.priceMultiplier ?? null]
          }));
        });

        this.bodyPartItems.clear();
        (bodyParts ?? []).forEach((b: any) => {
          this.bodyPartItems.push(this.fb.group({
            id: [b.id],
            name: [b.name],
            priceModifier: [b.priceModifier ?? null],
            priceMultiplier: [b.priceMultiplier ?? null]
          }));
        });

        this.loadingStyles = false;
        this.loadingBodyParts = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loadingStyles = false;
        this.loadingBodyParts = false;
        this.notifications.error('Could not load pricing configuration.');
        this.cdr.markForCheck();
      }
    });
  }

  saveGlobal() {
    if (this.savingGlobal) return;
    if (this.globalForm.invalid) { this.globalForm.markAllAsTouched(); return; }
    this.savingGlobal = true;
    this.globalSaved = false;

    const payload: PricingConfiguration = {
      hourlyRate: this.toNumberOrNull(this.globalForm.value.hourlyRate),
      sessionCost: this.toNumberOrNull(this.globalForm.value.sessionCost)
    };

    this.pricingService.updatePricingConfiguration(payload).subscribe({
      next: () => {
        this.savingGlobal = false;
        this.globalSaved = true;
        this.notifications.success('Global settings saved.');
        this.cdr.markForCheck();
      },
      error: () => {
        this.savingGlobal = false;
        this.notifications.error('Could not save global settings.');
        this.cdr.markForCheck();
      }
    });
  }

  saveStyle(index: number) {
    const group = this.styleItems.at(index) as FormGroup;
    const id = Number(group.value.id);
    if (!id) return;
    this.savingStyleIds[id] = true;

    const payload: StylePricing = {
      id,
      name: group.value.name,
      priceModifier: this.toNumberOrNull(group.value.priceModifier),
      priceMultiplier: this.toNumberOrNull(group.value.priceMultiplier)
    };

    this.pricingService.updateStylePricing(payload).subscribe({
      next: () => {
        this.savingStyleIds[id] = false;
        this.notifications.success(`Style "${payload.name}" updated.`);
        this.cdr.markForCheck();
      },
      error: () => {
        this.savingStyleIds[id] = false;
        this.notifications.error(`Could not update style "${payload.name}".`);
        this.cdr.markForCheck();
      }
    });
  }

  saveBodyPart(index: number) {
    const group = this.bodyPartItems.at(index) as FormGroup;
    const id = Number(group.value.id);
    if (!id) return;
    this.savingBodyPartIds[id] = true;

    const payload: BodyPartPricing = {
      id,
      name: group.value.name,
      priceModifier: this.toNumberOrNull(group.value.priceModifier),
      priceMultiplier: this.toNumberOrNull(group.value.priceMultiplier)
    };

    this.pricingService.updateBodyPartPricing(payload).subscribe({
      next: () => {
        this.savingBodyPartIds[id] = false;
        this.notifications.success(`Body part "${payload.name}" updated.`);
        this.cdr.markForCheck();
      },
      error: () => {
        this.savingBodyPartIds[id] = false;
        this.notifications.error(`Could not update body part "${payload.name}".`);
        this.cdr.markForCheck();
      }
    });
  }

  private toNumberOrNull(value: any): number | null {
    if (value === null || value === undefined || value === '' || isNaN(Number(value))) return null;
    return Number(value);
  }
}
