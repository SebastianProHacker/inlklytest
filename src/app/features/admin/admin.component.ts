import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatalogsTabComponent } from './components/catalogs-tab/catalogs-tab.component';
import { PricingTabComponent } from './components/pricing-tab/pricing-tab.component';
import { UsersTabComponent } from './components/users-tab/users-tab.component';

type AdminTab = 'catalogs' | 'pricing' | 'users';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, CatalogsTabComponent, PricingTabComponent, UsersTabComponent],
  template: `
    <div class="view-container">
      <div class="page-header">
        <h2 class="page-title">Administration</h2>
        <p class="page-subtitle">Manage system catalogs, pricing, and users</p>
      </div>

      <div class="main-tabs">
        <button class="main-tab" [class.active]="activeTab === 'catalogs'" (click)="activeTab = 'catalogs'">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
          </svg>
          Catalogs
        </button>
        <button class="main-tab" [class.active]="activeTab === 'pricing'" (click)="activeTab = 'pricing'">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
          Pricing
        </button>
        <button class="main-tab" [class.active]="activeTab === 'users'" (click)="activeTab = 'users'">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          Users
        </button>
      </div>

      <div class="tab-panel">
        <app-catalogs-tab *ngIf="activeTab === 'catalogs'"></app-catalogs-tab>
        <app-pricing-tab *ngIf="activeTab === 'pricing'"></app-pricing-tab>
        <app-users-tab *ngIf="activeTab === 'users'"></app-users-tab>
      </div>
    </div>
  `,
  styles: [`
    .view-container { padding: 20px 0; }
    .page-header { margin-bottom: 24px; }
    .page-title { font-size: 22px; font-weight: 600; color: var(--text-primary); margin: 0 0 4px; }
    .page-subtitle { font-size: 13px; color: var(--text-secondary); margin: 0; }
    .main-tabs {
      display: flex; gap: 4px; border-bottom: 1px solid var(--border-color); margin-bottom: 24px;
    }
    .main-tab {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 20px; background: none; border: none; border-bottom: 2px solid transparent;
      color: var(--text-secondary); font-size: 14px; font-weight: 500; cursor: pointer;
      font-family: inherit; transition: all 0.15s; margin-bottom: -1px;
    }
    .main-tab:hover { color: var(--text-primary); }
    .main-tab.active { color: var(--accent-color); border-bottom-color: var(--accent-color); }
    .tab-panel { min-height: 300px; }
  `]
})
export class AdminComponent {
  activeTab: AdminTab = 'catalogs';
}
