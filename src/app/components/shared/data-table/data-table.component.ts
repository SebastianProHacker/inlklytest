// src/app/components/shared/data-table/data-table.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, LowerCasePipe } from '@angular/common';
import { TableColumn } from '../../interfaces/table-config.interface';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, LowerCasePipe],
  template: `
    <div class="table-container">
      <h3>{{title}}</h3>

      <!-- Loading skeleton -->
      <table *ngIf="isLoading">
        <thead>
          <tr>
            <th *ngFor="let col of columns">{{col.label}}</th>
          </tr>
        </thead>
        <tbody>
          <tr class="skeleton-row" *ngFor="let i of skeletonRows">
            <td *ngFor="let col of columns">
              <div class="skeleton-cell" [class.avatar-skeleton]="col.type === 'avatar-text'" [class.short]="col.type !== 'avatar-text'"></div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Empty state -->
      <div *ngIf="!isLoading && data.length === 0" class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <path d="M3 9h18M9 21V9"/>
        </svg>
        <p>No records found</p>
      </div>

      <!-- Data table -->
      <table *ngIf="!isLoading && data.length > 0">
        <thead>
          <tr>
            <th *ngFor="let col of columns">{{col.label}}</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let row of data; let i = index" [class.even]="i % 2 !== 0" (click)="rowClicked.emit(row)" [style.cursor]="rowClicked.observed ? 'pointer' : 'default'">
            <td *ngFor="let col of columns">
              <ng-container [ngSwitch]="col.type">

                <div *ngSwitchCase="'avatar-text'" class="avatar-text-cell">
                  <img [src]="row[col.key].avatarUrl" alt="Avatar" class="cell-avatar">
                  {{row[col.key].name}}
                </div>

                <span *ngSwitchCase="'amount'">
                  {{row[col.key] | currency:'MXN':'symbol-narrow':'1.0-0'}} MXN
                </span>

                <span *ngSwitchCase="'date'">
                  {{row[col.key] | date:'dd.MM.yyyy'}}
                </span>

                <span *ngSwitchCase="'status'"
                      class="status-badge"
                      [ngClass]="row[col.key] | lowercase">{{row[col.key]}}
                </span>

                <span *ngSwitchDefault>
                  {{row[col.key]}}
                </span>

              </ng-container>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styleUrls: ['./data-table.component.css']
})
export class DataTableComponent {
  @Input() title: string = '';
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() isLoading: boolean = false;
  @Output() rowClicked = new EventEmitter<any>();

  skeletonRows = Array(5).fill(0);
}