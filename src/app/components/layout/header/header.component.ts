// src/app/layout/header/header.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchInputComponent } from '../../shared/search-input/search-input.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, SearchInputComponent],
  template: `
    <header class="header">
      <h2 class="page-title">Agenda</h2> <app-search-input (search)="$event"></app-search-input>
      <div class="header-right">
        </div>
    </header>
  `,
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {}