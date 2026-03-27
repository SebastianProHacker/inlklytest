import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar">
      <div class="logo">
        <h1>Inkly</h1>
      </div>
      <nav class="nav-menu">
        <a class="nav-item" style="opacity: 0.5; cursor: not-allowed;">
          <span class="icon">📊</span> Dashboard
        </a>
        
        <a routerLink="/quotes" routerLinkActive="active" class="nav-item">
          <span class="icon">📜</span> Quotes
        </a>
        <a routerLink="/agenda" routerLinkActive="active" class="nav-item">
          <span class="icon">📅</span> Agenda
        </a>
        <a routerLink="/warehouse" routerLinkActive="active" class="nav-item">
          <span class="icon">📦</span> Warehouse
        </a>
      </nav>
    </aside>
  `,
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {}