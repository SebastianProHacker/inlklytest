import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { DataTableComponent } from '../../../../components/shared/data-table/data-table.component';
import { ActionButtonComponent } from '../../../../components/shared/action-button/action-button.component';
import { TableColumn } from '../../../../components/interfaces/table-config.interface';
import { PricingService } from '../../../../core/services/pricing.service';
import { BasePriceFormComponent } from '../base-price-form/base-price-form.component';
import { PricingRuleFormComponent } from '../pricing-rule-form/pricing-rule-form.component';
import { PricingConfigTabComponent } from './pricing-config-tab.component';
import { BasePrice, PricingRule } from '../../../../core/models/pricing.model';

type PricingTab = 'basePrices' | 'pricingRules' | 'configuration';

@Component({
  selector: 'app-pricing-tab',
  standalone: true,
  imports: [CommonModule, DialogModule, DataTableComponent, ActionButtonComponent, PricingConfigTabComponent],
  template: `
    <div class="pricing-container">
      <div class="sub-tabs">
        <button class="sub-tab" [class.active]="activeTab === 'basePrices'" (click)="setTab('basePrices')">Base Prices</button>
        <button class="sub-tab" [class.active]="activeTab === 'pricingRules'" (click)="setTab('pricingRules')">Pricing Rules</button>
        <button class="sub-tab" [class.active]="activeTab === 'configuration'" (click)="setTab('configuration')">Configuration</button>
      </div>

      <div class="tab-content" *ngIf="activeTab !== 'configuration'">
        <div class="action-bar">
          <app-action-button text="New" variant="primary" (onClick)="openForm()"></app-action-button>
        </div>

        <div *ngIf="errorMessage" class="error-banner">
          {{ errorMessage }}
          <button class="retry-btn" (click)="load()">Retry</button>
        </div>

        <app-data-table
          [title]="activeTab === 'basePrices' ? 'Base Prices' : 'Pricing Rules'"
          [columns]="currentColumns"
          [data]="currentData"
          [isLoading]="isLoading"
          (rowClicked)="openForm($event)">
        </app-data-table>
      </div>

      <app-pricing-config-tab *ngIf="activeTab === 'configuration'"></app-pricing-config-tab>
    </div>
  `,
  styles: [`
    .pricing-container { display: flex; flex-direction: column; gap: 16px; }
    .sub-tabs { display: flex; gap: 4px; border-bottom: 1px solid var(--border-color); }
    .sub-tab {
      padding: 8px 16px; background: none; border: none; border-bottom: 2px solid transparent;
      color: var(--text-secondary); font-size: 13px; font-weight: 500; cursor: pointer;
      font-family: inherit; transition: all 0.15s; margin-bottom: -1px;
    }
    .sub-tab:hover { color: var(--text-primary); }
    .sub-tab.active { color: var(--accent-color); border-bottom-color: var(--accent-color); }
    .tab-content { display: flex; flex-direction: column; gap: 12px; }
    .action-bar { display: flex; justify-content: flex-end; }
    .error-banner {
      display: flex; align-items: center; gap: 8px; padding: 10px 16px;
      border-radius: var(--radius-md); background-color: var(--status-cancelled-bg);
      color: var(--status-cancelled-text); font-size: 13px;
    }
    .retry-btn {
      margin-left: auto; background: none; border: 1px solid currentColor; color: inherit;
      padding: 3px 10px; border-radius: var(--radius-pill); font-size: 12px; cursor: pointer; font-family: inherit;
    }
  `]
})
export class PricingTabComponent implements OnInit {
  activeTab: PricingTab = 'basePrices';
  isLoading = false;
  errorMessage = '';

  basePrices: BasePrice[] = [];
  pricingRules: PricingRule[] = [];

  basePriceColumns: TableColumn[] = [
    { key: 'tattooSizeName', label: 'Size', type: 'text' },
    { key: 'basePrice1', label: 'Base Price (MXN)', type: 'amount' }
  ];

  pricingRuleColumns: TableColumn[] = [
    { key: 'ruleName', label: 'Rule Name', type: 'text' },
    { key: 'multiplier', label: 'Multiplier', type: 'text' },
    { key: 'isActiveLabel', label: 'Active', type: 'text' }
  ];

  get currentColumns(): TableColumn[] {
    return this.activeTab === 'basePrices' ? this.basePriceColumns : this.pricingRuleColumns;
  }
  get currentData(): any[] {
    return this.activeTab === 'basePrices' ? this.basePrices : this.pricingRules;
  }

  constructor(
    private pricingService: PricingService,
    private dialog: Dialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() { this.load(); }

  setTab(tab: PricingTab) {
    this.activeTab = tab;
    if (tab !== 'configuration') {
      this.load();
    }
  }

  load() {
    if (this.activeTab === 'configuration') return;
    this.isLoading = true;
    this.errorMessage = '';

    if (this.activeTab === 'basePrices') {
      this.pricingService.getBasePrices().subscribe({
        next: (items) => {
          this.basePrices = items.map(bp => ({
            ...bp,
            tattooSizeName: bp.tattooSize?.name ?? `Size #${bp.tattooSizeId}`
          }));
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: () => { this.isLoading = false; this.errorMessage = 'Could not load data.'; this.cdr.markForCheck(); }
      });
    } else {
      this.pricingService.getPricingRules().subscribe({
        next: (items) => {
          this.pricingRules = items.map(pr => ({
            ...pr,
            isActiveLabel: pr.isActive ? 'Yes' : 'No'
          }));
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: () => { this.isLoading = false; this.errorMessage = 'Could not load data.'; this.cdr.markForCheck(); }
      });
    }
  }

  openForm(item?: any) {
    if (this.activeTab === 'basePrices') {
      const ref = this.dialog.open(BasePriceFormComponent, { width: '440px', data: { item } });
      ref.closed.subscribe(r => { if (r) this.load(); });
    } else {
      const ref = this.dialog.open(PricingRuleFormComponent, { width: '440px', data: { item } });
      ref.closed.subscribe(r => { if (r) this.load(); });
    }
  }
}
