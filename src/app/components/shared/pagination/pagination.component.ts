// src/app/shared/components/pagination/pagination.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pagination-container">
      <div class="page-controls">
        <button class="page-btn prev" (click)="onPageChange(currentPage - 1)" [disabled]="currentPage === 1">&#10094;</button>
        <button *ngFor="let page of pages" 
                class="page-btn num" 
                [class.active]="page === currentPage"
                (click)="onPageChange(page)">
          {{page}}
        </button>
        <button class="page-btn next" (click)="onPageChange(currentPage + 1)" [disabled]="currentPage === totalPages">&#10095;</button>
      </div>
      <div class="showing-info">
        Showing
        <select (change)="onItemsPerPageChange($event)">
          <option [value]="10" selected>10</option>
          <option [value]="25">25</option>
          <option [value]="50">50</option>
        </select>
      </div>
    </div>
  `,
  styleUrls: ['./pagination.component.css']
})
export class PaginationComponent {
  @Input() totalPages: number = 10;
  @Input() currentPage: number = 1;
  @Output() pageChanged = new EventEmitter<number>();

  pages: number[] = [1, 2, 3, 4, 10]; // Simplificado como en la foto, debería ser dinámico

  onPageChange(page: number) {
    if(page >= 1 && page <= this.totalPages) {
        this.pageChanged.emit(page);
    }
  }

  onItemsPerPageChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    console.log('Items por página cambiados a:', value);
    // Emitir evento si es necesario
  }
}