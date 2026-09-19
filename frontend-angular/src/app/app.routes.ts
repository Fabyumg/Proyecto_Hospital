import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { PacientesComponent } from './pages/pacientes/pacientes.component';
import { MedicosComponent } from './pages/medicos/medicos.component';
import { CitasComponent } from './pages/citas/citas.component';
import { AdministracionComponent } from './pages/administracion/administracion.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard]
  },
  {
    path: 'pacientes',
    component: PacientesComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMINISTRADOR', 'OPERADOR'], permission: 'PACIENTES_CONSULTAR' }
  },
  {
    path: 'medicos',
    component: MedicosComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMINISTRADOR'], permission: 'MEDICOS_GESTION' }
  },
  {
    path: 'citas',
    component: CitasComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMINISTRADOR', 'OPERADOR'], permission: 'CITAS_GESTION' }
  },
  {
    path: 'administracion',
    component: AdministracionComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMINISTRADOR'], permission: 'ADMINISTRACION_GESTION' }
  },
  { path: '**', redirectTo: 'dashboard' }
];
