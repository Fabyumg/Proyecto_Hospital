import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

export interface UsuarioItem {
  id?: number;
  username: string;
  nombre: string;
  apellido: string;
  email: string;
  activo: boolean;
  roles?: { id: number; nombre: string }[];
}

@Component({
  selector: 'app-administracion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-container fade-in">
      <div class="page-header glass-card">
        <div>
          <h2><i class="fa-solid fa-sliders text-primary"></i> Panel de Administración del Sistema</h2>
          <p class="subtitle">Exclusivo para el rol ADMINISTRADOR • Creación de usuarios, asignación de roles y llaves RSA</p>
        </div>
        <button class="btn btn-primary" (click)="openUserModal()">
          <i class="fa-solid fa-user-plus"></i> Crear Nuevo Usuario
        </button>
      </div>

      <div class="admin-grid">
        <div class="glass-card">
          <h3><i class="fa-solid fa-users-gear text-primary"></i> Usuarios Registrados y Roles</h3>
          <p class="desc">Administración de credenciales BCrypt y roles del sistema.</p>

          <div *ngIf="loading" class="text-center p-3">
            <i class="fa-solid fa-spinner fa-spin fa-lg text-primary"></i>
          </div>

          <ul class="user-list" *ngIf="!loading">
            <li *ngFor="let u of usuarios">
              <div>
                <strong>{{ u.username }}</strong> ({{ u.nombre }} {{ u.apellido }})
                <br><small style="color: var(--text-muted);">{{ u.email }}</small>
              </div>
              <div>
                <span class="badge" *ngFor="let r of u.roles" [ngClass]="r.nombre === 'ADMINISTRADOR' ? 'badge-info' : 'badge-success'">
                  ROLE_{{ r.nombre }}
                </span>
              </div>
            </li>
          </ul>
        </div>

        <div class="glass-card">
          <h3><i class="fa-solid fa-key text-warning"></i> Configuración de Llaves RSA JWT</h3>
          <p class="desc">Estado del proveedor de llaves asimétricas RSA de 2048 bits.</p>
          <div class="key-status">
            <div class="status-item"><i class="fa-solid fa-circle-check text-success"></i> Llave Privada RSA (Firma Dinámica)</div>
            <div class="status-item"><i class="fa-solid fa-circle-check text-success"></i> Llave Pública RSA (Validación Bearer)</div>
            <div class="status-item"><i class="fa-solid fa-shield-halved text-primary"></i> Algoritmo: RS256</div>
          </div>
        </div>
      </div>

      <!-- Modal de Creación de Usuario y Asignación de Rol -->
      <div class="modal-backdrop" *ngIf="showUserModal">
        <div class="glass-card modal-card fade-in">
          <div class="modal-header">
            <h3><i class="fa-solid fa-user-plus text-primary"></i> Crear Usuario y Asignar Rol</h3>
            <button class="close-btn" (click)="closeUserModal()">&times;</button>
          </div>

          <form (ngSubmit)="saveUsuario()">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Username *</label>
                <input type="text" class="form-control" [(ngModel)]="newUser.username" name="username" required placeholder="ej. jmendez" />
              </div>
              <div class="form-group">
                <label class="form-label">Contraseña *</label>
                <input type="password" class="form-control" [(ngModel)]="newUser.password" name="password" required placeholder="clave del usuario" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Nombre *</label>
                <input type="text" class="form-control" [(ngModel)]="newUser.nombre" name="nombre" required />
              </div>
              <div class="form-group">
                <label class="form-label">Apellido *</label>
                <input type="text" class="form-control" [(ngModel)]="newUser.apellido" name="apellido" required />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Correo Electrónico *</label>
                <input type="email" class="form-control" [(ngModel)]="newUser.email" name="email" required />
              </div>
              <div class="form-group">
                <label class="form-label">Asignar Rol *</label>
                <select class="form-select" [(ngModel)]="newUser.rolNombre" name="rolNombre" required>
                  <option value="ADMINISTRADOR">ADMINISTRADOR (Acceso Total)</option>
                  <option value="OPERADOR">OPERADOR (Acceso Limitado)</option>
                </select>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeUserModal()">Cancelar</button>
              <button type="submit" class="btn btn-primary" [disabled]="saving">
                <span *ngIf="!saving"><i class="fa-solid fa-floppy-disk"></i> Crear Usuario</span>
                <span *ngIf="saving"><i class="fa-solid fa-spinner fa-spin"></i> Guardando...</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-container { display: flex; flex-direction: column; gap: 1.5rem; }
    .page-header { display: flex; justify-content: space-between; align-items: center; }
    .subtitle { color: var(--text-muted); font-size: 0.9rem; }
    .admin-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem; }
    .desc { color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1rem; }
    .user-list { list-style: none; display: flex; flex-direction: column; gap: 0.8rem; }
    .user-list li { background: rgba(255,255,255,0.03); padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; }
    .key-status { display: flex; flex-direction: column; gap: 0.6rem; }
    .status-item { font-size: 0.9rem; display: flex; align-items: center; gap: 0.6rem; }
    .modal-backdrop {
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(0,0,0,0.7); backdrop-filter: blur(8px);
      display: flex; align-items: center; justify-content: center; z-index: 9999;
    }
    .modal-card { width: 100%; max-width: 600px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; }
    .close-btn { background: none; border: none; color: var(--text-muted); font-size: 1.8rem; cursor: pointer; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem; border-top: 1px solid var(--border-color); padding-top: 1rem; }
    .text-center { text-align: center; }
  `]
})
export class AdministracionComponent implements OnInit {
  usuarios: UsuarioItem[] = [];
  loading = false;
  saving = false;
  showUserModal = false;

  newUser = {
    username: '',
    password: '',
    nombre: '',
    apellido: '',
    email: '',
    rolNombre: 'OPERADOR'
  };

  private readonly API_URL = 'http://localhost:8080/api/v1/usuarios';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadUsuarios();
  }

  loadUsuarios(): void {
    this.loading = true;
    this.http.get<UsuarioItem[]>(this.API_URL).subscribe({
      next: (res) => {
        this.usuarios = res || [];
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        console.error(err);
      }
    });
  }

  openUserModal(): void {
    this.newUser = {
      username: '',
      password: '',
      nombre: '',
      apellido: '',
      email: '',
      rolNombre: 'OPERADOR'
    };
    this.showUserModal = true;
  }

  closeUserModal(): void {
    this.showUserModal = false;
  }

  saveUsuario(): void {
    if (!this.newUser.username || !this.newUser.password || !this.newUser.nombre || !this.newUser.email) {
      alert('Por favor completa todos los campos obligatorios (*)');
      return;
    }

    this.saving = true;
    this.http.post(this.API_URL, this.newUser).subscribe({
      next: () => {
        this.saving = false;
        this.closeUserModal();
        alert('¡Usuario creado y rol asignado exitosamente!');
        this.loadUsuarios();
      },
      error: (err) => {
        this.saving = false;
        alert('Error al crear usuario: ' + (err.error || err.message));
      }
    });
  }
}
