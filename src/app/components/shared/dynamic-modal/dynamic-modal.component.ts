// src/app/components/shared/dynamic-modal/dynamic-modal.component.ts
import { Component, Inject, Input, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';

// Definimos la interfaz para los datos que recibirá el modal
export interface ModalData {
  title: string;
  // Aquí proyectaremos el componente del formulario específico
}
@Component({
    selector: 'app-dynamic-modal',
    standalone: true,
    imports: [CommonModule],
    template: `
      <div class="modal-backdrop">
        <div class="modal-container">
          <header class="modal-header">
            <h2>{{ data?.title || dialogData?.title }}</h2>
            <button class="close-btn" (click)="close()">×</button>
          </header>
          <section class="modal-body">
            <ng-content></ng-content>
          </section>
        </div>
      </div>
    `,
    styleUrls: ['./dynamic-modal.component.css']
  })
  export class DynamicModalComponent {
    // Esta es la línea que faltaba para corregir el error del HTML
    @Input() data?: { title: string };
  
    constructor(
      public dialogRef: DialogRef,
      // Usamos @Optional para que no explote si no se pasan datos por el servicio
      @Optional() @Inject(DIALOG_DATA) public dialogData?: { title: string }
    ) {}
  
    close() {
      this.dialogRef.close();
    }
  }