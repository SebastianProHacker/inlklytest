import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { DataTableComponent } from '../../../../components/shared/data-table/data-table.component';
import { ActionButtonComponent } from '../../../../components/shared/action-button/action-button.component';
import { SearchInputComponent } from '../../../../components/shared/search-input/search-input.component';
import { PaginationComponent } from '../../../../components/shared/pagination/pagination.component';
import { TableColumn } from '../../../../components/interfaces/table-config.interface';
import { UserManagementService } from '../../../../core/services/user-management.service';
import { UserFormComponent } from '../user-form/user-form.component';
import { ManagedUser } from '../../../../core/models/user-management.model';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-users-tab',
  standalone: true,
  imports: [CommonModule, DialogModule, DataTableComponent, ActionButtonComponent, SearchInputComponent, PaginationComponent],
  template: `
    <div class="users-container">
      <div class="action-bar">
        <app-search-input (search)="onSearch($event)"></app-search-input>
        <app-action-button text="New User" variant="primary" (onClick)="openForm()"></app-action-button>
      </div>

      <div *ngIf="errorMessage" class="error-banner">
        {{ errorMessage }}
        <button class="retry-btn" (click)="load()">Retry</button>
      </div>

      <app-data-table
        title="Users"
        [columns]="columns"
        [data]="pagedUsers"
        [isLoading]="isLoading"
        (rowClicked)="openForm($event)">
      </app-data-table>

      <app-pagination
        *ngIf="!isLoading && filteredUsers.length > 0"
        [totalPages]="totalPages"
        [currentPage]="currentPage"
        (pageChanged)="onPageChange($event)">
      </app-pagination>
    </div>
  `,
  styles: [`
    .users-container { display: flex; flex-direction: column; gap: 12px; }
    .action-bar { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
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
export class UsersTabComponent implements OnInit {
  allUsers: ManagedUser[] = [];
  filteredUsers: ManagedUser[] = [];
  pagedUsers: ManagedUser[] = [];
  isLoading = false;
  errorMessage = '';
  searchTerm = '';
  currentPage = 1;
  totalPages = 1;

  columns: TableColumn[] = [
    { key: 'fullName', label: 'Full Name', type: 'text' },
    { key: 'email', label: 'Email', type: 'text' },
    { key: 'phone', label: 'Phone', type: 'text' },
    { key: 'roleName', label: 'Role', type: 'text' },
    { key: 'isActiveLabel', label: 'Active', type: 'text' }
  ];

  constructor(
    private userService: UserManagementService,
    private dialog: Dialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() { this.load(); }

  load() {
    this.isLoading = true;
    this.errorMessage = '';

    this.userService.getUsers().subscribe({
      next: (data) => {
        this.allUsers = data.map(u => ({
          ...u,
          roleName: u.role?.name ?? `Role #${u.roleId}`,
          isActiveLabel: u.isActive ? 'Yes' : 'No'
        }));
        this.applyFilter();
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Could not load users.';
        this.cdr.markForCheck();
      }
    });
  }

  onSearch(term: string) {
    this.searchTerm = term.toLowerCase().trim();
    this.currentPage = 1;
    this.applyFilter();
  }

  private applyFilter() {
    const term = this.searchTerm;
    this.filteredUsers = term
      ? this.allUsers.filter(u =>
          u.fullName.toLowerCase().includes(term) ||
          (u.email ?? '').toLowerCase().includes(term)
        )
      : [...this.allUsers];
    this.totalPages = Math.ceil(this.filteredUsers.length / PAGE_SIZE) || 1;
    this.updatePage();
  }

  private updatePage() {
    const start = (this.currentPage - 1) * PAGE_SIZE;
    this.pagedUsers = this.filteredUsers.slice(start, start + PAGE_SIZE);
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.updatePage();
  }

  openForm(item?: ManagedUser) {
    const ref = this.dialog.open(UserFormComponent, { width: '500px', data: { item } });
    ref.closed.subscribe(r => { if (r) this.load(); });
  }
}
