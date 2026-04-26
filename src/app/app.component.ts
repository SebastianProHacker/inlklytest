import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './components/layout/sidebar/sidebar.component';
import { HeaderComponent } from './components/layout/header/header.component';
import { ToastComponent } from './components/shared/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    SidebarComponent,
    HeaderComponent,
    ToastComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App { // En Firebase Studio a veces la clase se llama 'App' en lugar de 'AppComponent'
  title = 'ERP-Project';
}