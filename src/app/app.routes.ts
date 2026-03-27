import { Routes } from '@angular/router';
import { AgendaComponent } from './features/agenda/agenda.component';
import { WarehouseComponent } from './features/warehouse/warehouse.component';
import { LoginComponent } from './features/auth/login/login.component';
import { SignUpComponent } from './features/auth/sign-up/sign-up.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'sign-up', component: SignUpComponent },
  { path: 'agenda', component: AgendaComponent },
  { path: 'warehouse', component: WarehouseComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];