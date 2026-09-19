import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserInfo } from '../../../core/models/auth.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar glass-card">
      <div class="navbar-brand">
        <i class="fa-solid fa-hospital-user text-primary"></i>
        <span>Hospital<strong class="text-accent">Sys</strong></span>
      </div>

      <!-- Menú de Navegación Dinámico por Rol -->
      <ul class="navbar-menu" *ngIf="user">
        <li>
          <a routerLink="/dashboard" routerLinkActive="active">
            <i class="fa-solid fa-chart-line"></i> Inicio
          </a>
        </li>

        <!-- Pacientes: visible para ADMINISTRADOR y OPERADOR -->
        <li>
          <a routerLink="/pacientes" routerLinkActive="active">
            <i class="fa-solid fa-users"></i> Pacientes
          </a>
        </li>

        <!-- Médicos: visible SOLO para ADMINISTRADOR (o permiso MEDICOS_GESTION) -->
        <li *ngIf="isAdmin || hasPermission('MEDICOS_GESTION')">
          <a routerLink="/medicos" routerLinkActive="active">
            <i class="fa-solid fa-user-doctor"></i> Médicos
          </a>
        </li>

        <!-- Citas: visible para ADMINISTRADOR y OPERADOR -->
        <li>
          <a routerLink="/citas" routerLinkActive="active">
            <i class="fa-solid fa-calendar-check"></i> Citas
          </a>
        </li>

        <!-- Administración: visible SOLO para ADMINISTRADOR -->
        <li *ngIf="isAdmin || hasPermission('ADMINISTRACION_GESTION')">
          <a routerLink="/administracion" routerLinkActive="active">
            <i class="fa-solid fa-sliders"></i> Administración
          </a>
        </li>
      </ul>

      <!-- User Profile & Logout -->
      <div class="navbar-user" *ngIf="user">
        <div class="user-info">
          <span class="user-name">{{ user.nombre }} {{ user.apellido }}</span>
          <span class="user-role badge" [ngClass]="isAdmin ? 'badge-info' : 'badge-success'">
            {{ primaryRole }}
          </span>
        </div>
        <button class="btn btn-secondary btn-sm" (click)="logout()" title="Cerrar Sesión">
          <i class="fa-solid fa-right-from-bracket"></i> Salir
        </button>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.85rem 1.5rem;
      margin-bottom: 1.5rem;
      border-radius: 12px;
    }
    .navbar-brand {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 1.3rem;
      font-weight: 700;
      color: #f8fafc;
    }
    .navbar-brand i {
      font-size: 1.5rem;
      color: var(--primary);
    }
    .text-accent {
      color: var(--secondary);
    }
    .navbar-menu {
      display: flex;
      list-style: none;
      gap: 1rem;
    }
    .navbar-menu a {
      color: var(--text-muted);
      text-decoration: none;
      font-weight: 500;
      padding: 0.5rem 0.9rem;
      border-radius: 8px;
      transition: var(--transition);
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    .navbar-menu a:hover, .navbar-menu a.active {
      color: #fff;
      background: rgba(2, 132, 199, 0.2);
    }
    .navbar-user {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .user-info {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }
    .user-name {
      font-size: 0.9rem;
      font-weight: 600;
    }
    .user-role {
      font-size: 0.7rem;
    }
  `]
})
export class NavbarComponent implements OnInit {
  user: UserInfo | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((u) => {
      this.user = u;
    });
  }

  get isAdmin(): boolean {
    return this.authService.hasRole('ADMINISTRADOR');
  }

  get primaryRole(): string {
    if (!this.user || !this.user.roles || this.user.roles.length === 0) return 'USUARIO';
    return this.user.roles[0];
  }

  hasPermission(permission: string): boolean {
    return this.authService.hasPermission(permission);
  }

  logout(): void {
    this.authService.logout();
  }
}
