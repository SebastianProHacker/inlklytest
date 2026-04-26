// src/app/shared/components/pagination/pagination.component.ts
import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pagination-container">
      <div class="page-controls">
        <button class="page-btn arrow" (click)="onPageChange(currentPage - 1)" [disabled]="currentPage === 1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 18l-6-6 6-6"/></svg>
        </button>

        <ng-container *ngFor="let page of visiblePages">
          <span *ngIf="page === -1" class="ellipsis">…</span>
          <button *ngIf="page !== -1"
                  class="page-btn num"
                  [class.active]="page === currentPage"
                  (click)="onPageChange(page)">
            {{page}}
          </button>
        </ng-container>

        <button class="page-btn arrow" (click)="onPageChange(currentPage + 1)" [disabled]="currentPage === totalPages">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>

      <div class="showing-info">
        <span>Rows per page</span>
        <select (change)="onItemsPerPageChange($event)">
          <option [value]="10">10</option>
          <option [value]="25">25</option>
          <option [value]="50">50</option>
        </select>
      </div>
    </div>
  `,
  styleUrls: ['./pagination.component.css']
})
export class PaginationComponent implements OnChanges {
  @Input() totalPages: number = 1;
  @Input() currentPage: number = 1;
  @Output() pageChanged = new EventEmitter<number>();
  @Output() itemsPerPageChanged = new EventEmitter<number>();

  visiblePages: number[] = [];

  ngOnChanges() {
    this.buildPages();
  }

  buildPages() {
    const total = this.totalPages;
    const current = this.currentPage;
    const pages: number[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push(-1);
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (current < total - 2) pages.push(-1);
      pages.push(total);
    }

    this.visiblePages = pages;
  }

  onPageChange(page: number) {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.pageChanged.emit(page);
    }
  }

  onItemsPerPageChange(event: Event) {
    const value = Number((event.target as HTMLSelectElement).value);
    this.itemsPerPageChanged.emit(value);
  }
}