import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { DataTableComponent } from '../../components/shared/data-table/data-table.component';
import { ActionButtonComponent } from '../../components/shared/action-button/action-button.component';
import { PaginationComponent } from '../../components/shared/pagination/pagination.component';
import { TableColumn } from '../../components/interfaces/table-config.interface';
import { QuotationService } from '../../core/services/quotation.service';
import { ClientService } from '../../core/services/client.service';
import { Quotation, QuotationStatus } from '../../core/models/quotation.model';
import { Client } from '../../core/models/client.model';
import { QuotationFormComponent } from './components/quotation-form/quotation-form.component';
import { QuotationDetailComponent } from './components/quotation-detail/quotation-detail.component';
import { SearchService } from '../../core/services/search.service';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-quotes',
  standalone: true,
  imports: [
    CommonModule,
    DataTableComponent,
    ActionButtonComponent,
    PaginationComponent,
    DialogModule,
  ],
  template: `
    <div class="view-container">
      <div class="action-bar">
        <div class="left-actions">
          <select class="status-filter" (change)="onStatusFilter($event)">
            <option value="">All statuses</option>
            <option *ngFor="let s of statuses" [value]="s.id">{{ s.name }}</option>
          </select>
        </div>
        <app-action-button
          text="New Quote"
          variant="primary"
          (onClick)="openQuotationForm()">
        </app-action-button>
      </div>

      <app-data-table
        title="Quotes"
        [columns]="columns"
        [data]="pagedQuotations"
        [isLoading]="isLoading"
        (rowClicked)="openQuotationDetail($event)">
      </app-data-table>

      <app-pagination
        *ngIf="!isLoading && filteredQuotations.length > 0"
        [totalPages]="totalPages"
        [currentPage]="currentPage"
        (pageChanged)="onPageChange($event)">
      </app-pagination>
    </div>
  `,
  styles: [`
    .view-container { padding: 20px 0; }
    .action-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .left-actions { display: flex; gap: 12px; align-items: center; }
    .status-filter {
      height: 36px;
      padding: 0 12px;
      border-radius: var(--radius-md, 6px);
      border: 1px solid var(--border-color, #e2e8f0);
      background: var(--surface-card, #fff);
      color: var(--text-primary, #1a202c);
      font-size: 13px;
      font-family: inherit;
      cursor: pointer;
      outline: none;
    }
    .status-filter:focus { border-color: var(--accent, #5f55ee); }
  `]
})
export class QuotesComponent implements OnInit, OnDestroy {
  allQuotations: Quotation[] = [];
  clients: Client[] = [];
  statuses: QuotationStatus[] = [];
  filteredQuotations: Quotation[] = [];
  pagedQuotations: any[] = [];
  isLoading = true;
  currentPage = 1;
  totalPages = 1;
  searchTerm = '';
  statusFilter: number | '' = '';
  private destroy$ = new Subject<void>();

  columns: TableColumn[] = [
    { key: 'clientName', label: 'Client', type: 'text' },
    { key: 'statusName', label: 'Status', type: 'status' },
    { key: 'estimatedTotalPrice', label: 'Est. Price', type: 'amount' },
    { key: 'createdAt', label: 'Date', type: 'date' },
  ];

  constructor(
    private quotationService: QuotationService,
    private clientService: ClientService,
    private dialog: Dialog,
    private cdr: ChangeDetectorRef,
    private searchService: SearchService
  ) {}

  ngOnInit(): void {
    this.loadQuotations();
    this.searchService.search$.pipe(takeUntil(this.destroy$)).subscribe(term => {
      this.searchTerm = term;
      this.currentPage = 1;
      this.applyFilter();
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadQuotations() {
    this.isLoading = true;

    forkJoin({
      quotations: this.quotationService.getQuotations(),
      clients: this.clientService.getClients(),
      statuses: this.quotationService.getStatuses(),
    }).subscribe({
      next: ({ quotations, clients, statuses }) => {
        this.allQuotations = quotations;
        this.clients = clients;
        this.statuses = statuses;
        this.applyFilter();
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  onStatusFilter(event: Event) {
    const val = (event.target as HTMLSelectElement).value;
    this.statusFilter = val ? Number(val) : '';
    this.currentPage = 1;
    this.applyFilter();
  }

  private applyFilter() {
    let result = [...this.allQuotations];

    if (this.searchTerm) {
      result = result.filter(q => {
        const client = this.clients.find(c => c.id === q.clientId);
        return client?.fullName?.toLowerCase().includes(this.searchTerm) ||
               client?.email?.toLowerCase().includes(this.searchTerm);
      });
    }

    if (this.statusFilter !== '') {
      result = result.filter(q => q.statusId === this.statusFilter);
    }

    this.filteredQuotations = result;
    this.totalPages = Math.ceil(this.filteredQuotations.length / PAGE_SIZE) || 1;
    this.updatePage();
  }

  private updatePage() {
    const start = (this.currentPage - 1) * PAGE_SIZE;
    const paged = this.filteredQuotations.slice(start, start + PAGE_SIZE);
    this.pagedQuotations = paged.map(q => {
      const client = this.clients.find(c => c.id === q.clientId);
      const status = this.statuses.find(s => s.id === q.statusId);
      return {
        ...q,
        clientName: client?.fullName ?? `Client #${q.clientId}`,
        statusName: status?.name ?? `Status #${q.statusId}`,
      };
    });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.updatePage();
  }

  openQuotationForm() {
    const dialogRef = this.dialog.open(QuotationFormComponent, {
      width: '620px',
    });

    dialogRef.closed.subscribe(result => {
      if (result) this.loadQuotations();
    });
  }

  openQuotationDetail(row: any) {
    const quotation = this.allQuotations.find(q => q.id === row.id);
    if (!quotation) return;

    const dialogRef = this.dialog.open(QuotationDetailComponent, {
      width: '700px',
      data: { quotation }
    });

    dialogRef.closed.subscribe(result => {
      if (result) this.loadQuotations();
    });
  }
}
