// src/app/components/shared/data-table/data-table.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, LowerCasePipe } from '@angular/common'; // Importar LowerCasePipe
import { TableColumn } from '../../interfaces/table-config.interface';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, LowerCasePipe], // Añadir pipes
  template: `
    <div class="table-container">
      <h3>{{title}}</h3>
      <table>
        <thead>
          <tr>
            <th *ngFor="let col of columns">{{col.label}}</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let row of data; let i = index" [class.even]="i % 2 !== 0">
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
                      [ngClass]="row[col.key] | lowercase"> {{row[col.key]}}
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
}