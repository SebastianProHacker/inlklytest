import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { DataTableComponent } from '../../components/shared/data-table/data-table.component';
import { ActionButtonComponent } from '../../components/shared/action-button/action-button.component';
import { PaginationComponent } from '../../components/shared/pagination/pagination.component';
import { TableColumn } from '../../components/interfaces/table-config.interface';
import { DynamicModalComponent } from '../../components/shared/dynamic-modal/dynamic-modal.component';
import { NewAppointmentFormComponent } from './components/new-appointment-form/new-appointment-form.component';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule, DataTableComponent, ActionButtonComponent, PaginationComponent, DialogModule],
  template: `
    <div class="view-container">
      <div class="action-bar">
        <div class="left-actions">
          <app-action-button text="Sort"></app-action-button>
          <app-action-button text="Filter"></app-action-button>
        </div>
        <app-action-button text="New Appointment" variant="primary" (onClick)="openNewAppointmentModal()"></app-action-button>
      </div>

      <app-data-table 
        title="Appointments" 
        [columns]="columns" 
        [data]="appointments">
      </app-data-table>

      <app-pagination></app-pagination>
    </div>
  `,
  styles: [`
    .view-container { padding: 20px 0; }
    .action-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .left-actions { display: flex; gap: 12px; }
  `]
})
export class AgendaComponent {
  columns: TableColumn[] = [
    { key: 'artist', label: 'Tattoo Artist', type: 'avatar-text' },
    { key: 'category', label: 'Category', type: 'text' },
    { key: 'date', label: 'Date', type: 'date' },
    { key: 'amount', label: 'Amount', type: 'amount' }
  ];

  constructor(private dialog: Dialog) {}

  openNewAppointmentModal() {
    // Abrimos directamente el componente del formulario.
    // Pasamos el título en el objeto 'data'
    const dialogRef = this.dialog.open(NewAppointmentFormComponent, {
      width: '480px', // Ancho aproximado según la imagen
      data: { title: 'New Appointment' },
      disableClose: true // Opcional: evita que se cierre al hacer clic fuera
    });

    dialogRef.closed.subscribe(result => {
      if (result) {
        console.log('Datos recibidos:', result);
        // Aquí puedes añadir la lógica para actualizar tu tabla 'appointments'
      }
    });
  }
  // Datos de prueba basados en tu imagen
  appointments = [
    { 
      artist: { name: 'Parviz Aslanov', avatarUrl: 'https://i.pravatar.cc/150?u=1' }, 
      category: 'Fine Line', 
      date: new Date('2023-11-20'), 
      amount: 1700 
    },
    { 
      artist: { name: 'Sevinj Aslanova', avatarUrl: 'https://i.pravatar.cc/150?u=2' }, 
      category: 'Portraits', 
      date: new Date('2023-02-19'), 
      amount: 1200 
    },
    { 
      artist: { name: 'Ceyhun Aslanov', avatarUrl: 'https://i.pravatar.cc/150?u=3' }, 
      category: 'Color work', 
      date: new Date('2024-05-18'), 
      amount: 3999 
    }
  ];
}