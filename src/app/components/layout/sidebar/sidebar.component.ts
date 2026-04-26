import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar">
      <div class="logo">
        <div class="logo-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/>
            <line x1="16" y1="8" x2="2" y2="22"/>
            <line x1="17.5" y1="15" x2="9" y2="15"/>
          </svg>
        </div>
        <span class="logo-text">Inkly</span>
      </div>

      <nav class="nav-menu">
        <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
          <span class="nav-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
            </svg>
          </span>
          <span class="nav-label">Dashboard</span>
        </a>

        <a routerLink="/quotes" routerLinkActive="active" class="nav-item">
          <span class="nav-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10,9 9,9 8,9"/>
            </svg>
          </span>
          <span class="nav-label">Quotes</span>
        </a>

        <a routerLink="/agenda" routerLinkActive="active" class="nav-item">
          <span class="nav-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </span>
          <span class="nav-label">Agenda</span>
        </a>

        <a routerLink="/warehouse" routerLinkActive="active" class="nav-item">
          <span class="nav-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27,6.96 12,12.01 20.73,6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
          </span>
          <span class="nav-label">Warehouse</span>
        </a>

        <a routerLink="/clients" routerLinkActive="active" class="nav-item">
          <span class="nav-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </span>
          <span class="nav-label">Clients</span>
        </a>

        <a *ngIf="isAdmin" routerLink="/admin" routerLinkActive="active" class="nav-item">
          <span class="nav-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </span>
          <span class="nav-label">Admin</span>
        </a>
      </nav>

      <div class="sidebar-footer">
        <div class="user-info">
          <div class="user-avatar">SN</div>
          <div class="user-details">
            <span class="user-name">Sebastián N.</span>
            <span class="user-role">Admin</span>
          </div>
        </div>
      </div>
    </aside>
  `,
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  constructor(private authService: AuthService) {}

  get isAdmin(): boolean {
    const role = this.authService.getCurrentUserRole()?.toLowerCase();
    return role === 'admin' || role === 'administrator';
  }
}