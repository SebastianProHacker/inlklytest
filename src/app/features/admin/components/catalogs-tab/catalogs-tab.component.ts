import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { DataTableComponent } from '../../../../components/shared/data-table/data-table.component';
import { ActionButtonComponent } from '../../../../components/shared/action-button/action-button.component';
import { TableColumn } from '../../../../components/interfaces/table-config.interface';
import { CatalogService } from '../../../../core/services/catalog.service';
import { SimpleCatalogFormComponent } from '../simple-catalog-form/simple-catalog-form.component';
import { TattooSizeFormComponent } from '../tattoo-size-form/tattoo-size-form.component';
import { TattooStyle, TattooTechnique, TattooSize, BodyPart, MaterialType } from '../../../../core/models/catalog.model';

type CatalogTab = 'styles' | 'techniques' | 'sizes' | 'bodyParts' | 'materialTypes';

@Component({
  selector: 'app-catalogs-tab',
  standalone: true,
  imports: [CommonModule, DialogModule, DataTableComponent, ActionButtonComponent],
  template: `
    <div class="catalogs-container">
      <div class="sub-tabs">
        <button *ngFor="let tab of tabs" class="sub-tab" [class.active]="activeTab === tab.key" (click)="setTab(tab.key)">
          {{ tab.label }}
        </button>
      </div>

      <div class="tab-content">
        <div class="action-bar">
          <app-action-button text="New" variant="primary" (onClick)="openForm()"></app-action-button>
        </div>

        <div *ngIf="errorMessage" class="error-banner">
          {{ errorMessage }}
          <button class="retry-btn" (click)="load()">Retry</button>
        </div>

        <app-data-table
          [title]="currentTab.label"
          [columns]="currentColumns"
          [data]="currentData"
          [isLoading]="isLoading"
          (rowClicked)="openForm($event)">
        </app-data-table>
      </div>
    </div>
  `,
  styles: [`
    .catalogs-container { display: flex; flex-direction: column; gap: 16px; }
    .sub-tabs { display: flex; gap: 4px; border-bottom: 1px solid var(--border-color); padding-bottom: 0; }
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
export class CatalogsTabComponent implements OnInit {
  activeTab: CatalogTab = 'styles';
  isLoading = false;
  errorMessage = '';

  tabs: { key: CatalogTab; label: string }[] = [
    { key: 'styles', label: 'Styles' },
    { key: 'techniques', label: 'Techniques' },
    { key: 'sizes', label: 'Sizes' },
    { key: 'bodyParts', label: 'Body Parts' },
    { key: 'materialTypes', label: 'Material Types' }
  ];

  nameColumns: TableColumn[] = [{ key: 'name', label: 'Name', type: 'text' }];
  priceColumns: TableColumn[] = [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'priceModifier', label: 'Modifier', type: 'text' },
    { key: 'priceMultiplier', label: 'Multiplier', type: 'text' }
  ];
  sizeColumns: TableColumn[] = [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'sizeCmMin', label: 'Min (cm)', type: 'text' },
    { key: 'sizeCmMax', label: 'Max (cm)', type: 'text' }
  ];

  data: Record<CatalogTab, any[]> = {
    styles: [], techniques: [], sizes: [], bodyParts: [], materialTypes: []
  };

  get currentTab() { return this.tabs.find(t => t.key === this.activeTab)!; }
  get currentColumns(): TableColumn[] {
    if (this.activeTab === 'sizes') return this.sizeColumns;
    if (this.activeTab === 'styles' || this.activeTab === 'bodyParts') return this.priceColumns;
    return this.nameColumns;
  }
  get currentData(): any[] { return this.data[this.activeTab]; }

  constructor(
    private catalogService: CatalogService,
    private dialog: Dialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() { this.load(); }

  setTab(tab: CatalogTab) {
    this.activeTab = tab;
    this.load();
  }

  load() {
    this.isLoading = true;
    this.errorMessage = '';

    const loaders: Record<CatalogTab, () => any> = {
      styles: () => this.catalogService.getStyles(),
      techniques: () => this.catalogService.getTechniques(),
      sizes: () => this.catalogService.getSizes(),
      bodyParts: () => this.catalogService.getBodyParts(),
      materialTypes: () => this.catalogService.getMaterialTypes()
    };

    loaders[this.activeTab]().subscribe({
      next: (items: any[]) => {
        this.data[this.activeTab] = items;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Could not load data.';
        this.cdr.markForCheck();
      }
    });
  }

  openForm(item?: any) {
    if (this.activeTab === 'sizes') {
      const ref = this.dialog.open(TattooSizeFormComponent, { width: '440px', data: { item } });
      ref.closed.subscribe(r => { if (r) this.load(); });
      return;
    }

    const entityNames: Record<CatalogTab, string> = {
      styles: 'Style', techniques: 'Technique', sizes: 'Size',
      bodyParts: 'Body Part', materialTypes: 'Material Type'
    };

    const saveMap: Record<CatalogTab, (payload: any) => any> = {
      styles: (p) => item?.id ? this.catalogService.updateStyle(item.id, p) : this.catalogService.createStyle(p),
      techniques: (p) => item?.id ? this.catalogService.updateTechnique(item.id, p) : this.catalogService.createTechnique(p),
      sizes: (p) => p, // handled above
      bodyParts: (p) => item?.id ? this.catalogService.updateBodyPart(item.id, p) : this.catalogService.createBodyPart(p),
      materialTypes: (p) => item?.id ? this.catalogService.updateMaterialType(item.id, p) : this.catalogService.createMaterialType(p)
    };

    const deleteMap: Record<CatalogTab, ((id: number) => any) | undefined> = {
      styles: (id) => this.catalogService.deleteStyle(id),
      techniques: (id) => this.catalogService.deleteTechnique(id),
      sizes: undefined,
      bodyParts: (id) => this.catalogService.deleteBodyPart(id),
      materialTypes: (id) => this.catalogService.deleteMaterialType(id)
    };

    const ref = this.dialog.open(SimpleCatalogFormComponent, {
      width: '440px',
      data: {
        entityName: entityNames[this.activeTab],
        item,
        onSave: saveMap[this.activeTab],
        onDelete: item?.id ? deleteMap[this.activeTab] : undefined
      }
    });
    ref.closed.subscribe(r => { if (r) this.load(); });
  }
}
