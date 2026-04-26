import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/layout/header/header.component';
import { SidebarComponent } from './components/layout/sidebar/sidebar.component';
import { ToastComponent } from './components/shared/toast/toast.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, SidebarComponent, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('myapp');
}
