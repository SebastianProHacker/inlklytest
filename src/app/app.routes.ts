import { Routes } from '@angular/router';
import { AgendaComponent } from './features/agenda/agenda.component';
import { WarehouseComponent } from './features/warehouse/warehouse.component';
import { LoginComponent } from './features/auth/login/login.component';
import { SignUpComponent } from './features/auth/sign-up/sign-up.component';
import { ClientsComponent } from './features/clients/clients.component';
import { QuotesComponent } from './features/quotes/quotes.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { AdminComponent } from './features/admin/admin.component';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'sign-up', component: SignUpComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'quotes', component: QuotesComponent, canActivate: [authGuard] },
  { path: 'agenda', component: AgendaComponent, canActivate: [authGuard] },
  { path: 'warehouse', component: WarehouseComponent, canActivate: [authGuard] },
  { path: 'clients', component: ClientsComponent, canActivate: [authGuard] },
  { path: 'admin', component: AdminComponent, canActivate: [adminGuard] },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];