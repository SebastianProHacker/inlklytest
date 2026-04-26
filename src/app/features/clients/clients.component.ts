import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { Subject, takeUntil } from 'rxjs';
import { DataTableComponent } from '../../components/shared/data-table/data-table.component';
import { ActionButtonComponent } from '../../components/shared/action-button/action-button.component';
import { PaginationComponent } from '../../components/shared/pagination/pagination.component';
import { TableColumn } from '../../components/interfaces/table-config.interface';
import { ClientService } from '../../core/services/client.service';
import { Client } from '../../core/models/client.model';
import { ClientFormComponent } from './components/client-form/client-form.component';
import { SearchService } from '../../core/services/search.service';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-clients',
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
        <app-action-button
          text="New Client"
          variant="primary"
          (onClick)="openClientModal()">
        </app-action-button>
      </div>

      <app-data-table
        title="Clients"
        [columns]="columns"
        [data]="pagedClients"
        [isLoading]="isLoading"
        (rowClicked)="openClientModal($event)">
      </app-data-table>

      <app-pagination
        *ngIf="!isLoading && filteredClients.length > 0"
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
  `]
})
export class ClientsComponent implements OnInit, OnDestroy {
  allClients: Client[] = [];
  filteredClients: Client[] = [];
  pagedClients: Client[] = [];
  isLoading = true;
  currentPage = 1;
  totalPages = 1;
  searchTerm = '';
  private destroy$ = new Subject<void>();

  columns: TableColumn[] = [
    { key: 'fullName', label: 'Full Name', type: 'text' },
    { key: 'email', label: 'Email', type: 'text' },
    { key: 'phone', label: 'Phone', type: 'text' },
  ];

  constructor(
    private clientService: ClientService,
    private dialog: Dialog,
    private cdr: ChangeDetectorRef,
    private searchService: SearchService
  ) {}

  ngOnInit(): void {
    this.loadClients();
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

  loadClients() {
    this.isLoading = true;

    this.clientService.getClients().subscribe({
      next: (data) => {
        this.allClients = data;
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

  private applyFilter() {
    const term = this.searchTerm;
    this.filteredClients = term
      ? this.allClients.filter(c =>
          c.fullName.toLowerCase().includes(term) ||
          c.email.toLowerCase().includes(term)
        )
      : [...this.allClients];
    this.totalPages = Math.ceil(this.filteredClients.length / PAGE_SIZE) || 1;
    this.updatePage();
  }

  private updatePage() {
    const start = (this.currentPage - 1) * PAGE_SIZE;
    this.pagedClients = this.filteredClients.slice(start, start + PAGE_SIZE);
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.updatePage();
  }

  openClientModal(client?: Client) {
    const dialogRef = this.dialog.open(ClientFormComponent, {
      width: '500px',
      data: { client, existingClients: this.allClients }
    });

    dialogRef.closed.subscribe(result => {
      if (result) this.loadClients();
    });
  }
}
