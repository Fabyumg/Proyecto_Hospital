import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserInfo } from '../../core/models/auth.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard-container fade-in">
      <div class="welcome-header glass-card">
        <div>
          <h2>¡Bienvenido(a), <span class="text-primary">{{ user?.nombre }} {{ user?.apellido }}</span>!</h2>
          <p class="subtitle">Sistema de Gestión de Clínicas y Hospitales • Sesión Activa con JWT RSA</p>
        </div>
        <div class="role-badge">
          <span class="badge" [ngClass]="isAdmin ? 'badge-info' : 'badge-success'">
            <i class="fa-solid fa-shield-halved"></i> Rol: {{ primaryRole }}
          </span>
        </div>
      </div>

      <!-- Quick Metrics Grid -->
      <div class="stats-grid">
        <div class="stat-card glass-card">
          <div class="stat-icon bg-primary-light text-primary">
            <i class="fa-solid fa-users"></i>
          </div>
          <div class="stat-info">
            <h3>Pacientes</h3>
            <p class="stat-number">Paginación Activa</p>
            <span class="stat-desc">Filtros dinámicos con JPA Specification</span>
          </div>
        </div>

        <div class="stat-card glass-card">
          <div class="stat-icon bg-secondary-light text-secondary">
            <i class="fa-solid fa-user-doctor"></i>
          </div>
          <div class="stat-info">
            <h3>Médicos</h3>
            <p class="stat-number" *ngIf="isAdmin || hasPermission('MEDICOS_GESTION')">Acceso Permitido</p>
            <p class="stat-number text-muted" *ngIf="!isAdmin && !hasPermission('MEDICOS_GESTION')">Restringido por Rol</p>
            <span class="stat-desc">Gestión de especialistas y horarios</span>
          </div>
        </div>

        <div class="stat-card glass-card">
          <div class="stat-icon bg-accent-light text-accent">
            <i class="fa-solid fa-calendar-days"></i>
          </div>
          <div class="stat-info">
            <h3>Citas Médicas</h3>
            <p class="stat-number">Habilitado</p>
            <span class="stat-desc">Agendamiento y control de turnos</span>
          </div>
        </div>

        <div class="stat-card glass-card">
          <div class="stat-icon bg-warning-light text-warning">
            <i class="fa-solid fa-key"></i>
          </div>
          <div class="stat-info">
            <h3>Seguridad RSA</h3>
            <p class="stat-number">Llaves 2048-bit</p>
            <span class="stat-desc">Firma Privada / Validación Pública</span>
          </div>
        </div>
      </div>

      <!-- Role Access Info Card -->
      <div class="access-info-card glass-card">
        <h3><i class="fa-solid fa-lock-open text-primary"></i> Permisos Asignados a tu Cuenta</h3>
        <p class="mb-3" style="color: var(--text-muted); font-size: 0.9rem;">
          Tus accesos son determinados 100% dinámicamente según las autoridades otorgadas en el Token JWT:
        </p>

        <div class="permissions-list">
          <div class="perm-item" *ngIf="isAdmin || hasPermission('PACIENTES_CONSULTAR')">
            <i class="fa-solid fa-check text-success"></i> Consultar Pacientes (Paginación 50, 100, 200)
          </div>
          <div class="perm-item" *ngIf="isAdmin || hasPermission('PACIENTES_REGISTRAR')">
            <i class="fa-solid fa-check text-success"></i> Registrar Nuevos Pacientes
          </div>
          <div class="perm-item" *ngIf="isAdmin || hasPermission('MEDICOS_GESTION')">
            <i class="fa-solid fa-check text-success"></i> Módulo de Gestión de Médicos
          </div>
          <div class="perm-item" *ngIf="isAdmin || hasPermission('CITAS_GESTION')">
            <i class="fa-solid fa-check text-success"></i> Módulo de Gestión de Citas
          </div>
          <div class="perm-item" *ngIf="isAdmin || hasPermission('ADMINISTRACION_GESTION')">
            <i class="fa-solid fa-check text-success"></i> Panel de Administración del Sistema
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .welcome-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .subtitle {
      color: var(--text-muted);
      font-size: 0.9rem;
      margin-top: 0.2rem;
    }
    .role-badge .badge {
      font-size: 0.9rem;
      padding: 0.5rem 1rem;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.25rem;
    }
    .stat-card {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      padding: 1.25rem;
    }
    .stat-icon {
      width: 54px;
      height: 54px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.6rem;
    }
    .bg-primary-light { background: rgba(2, 132, 199, 0.15); }
    .bg-secondary-light { background: rgba(13, 148, 136, 0.15); }
    .bg-accent-light { background: rgba(99, 102, 241, 0.15); }
    .bg-warning-light { background: rgba(245, 158, 11, 0.15); }

    .text-secondary { color: var(--secondary); }
    .text-accent { color: var(--accent); }
    .text-warning { color: var(--warning); }
    .text-success { color: var(--success); }

    .stat-info h3 {
      font-size: 1.05rem;
      font-weight: 600;
    }
    .stat-number {
      font-size: 1.1rem;
      font-weight: 700;
      color: #fff;
    }
    .stat-desc {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    .permissions-list {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 0.8rem;
    }
    .perm-item {
      background: rgba(255, 255, 255, 0.03);
      padding: 0.75rem 1rem;
      border-radius: 8px;
      border: 1px solid var(--border-color);
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }
  `]
})
export class DashboardComponent implements OnInit {
  user: UserInfo | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.user = this.authService.getStoredUser();
  }

  get isAdmin(): boolean {
    return this.authService.hasRole('ADMINISTRADOR');
  }

  get primaryRole(): string {
    return this.user && this.user.roles && this.user.roles.length > 0
      ? this.user.roles[0]
      : 'USUARIO';
  }

  hasPermission(perm: string): boolean {
    return this.authService.hasPermission(perm);
  }
}
