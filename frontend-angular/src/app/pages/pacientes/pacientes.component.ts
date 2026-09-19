import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PacienteService } from '../../core/services/paciente.service';
import { AuthService } from '../../core/services/auth.service';
import { Paciente, PacienteFilter, PaginationMetadata } from '../../core/models/paciente.model';

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="pacientes-container fade-in">
      <!-- Header -->
      <div class="page-header glass-card">
        <div>
          <h2><i class="fa-solid fa-users text-primary"></i> Gestión de Pacientes</h2>
          <p class="subtitle">Consulta paginada desde BD mediante Spring Data JPA Specification (Límite max 200)</p>
        </div>
        <!-- Botón Registrar visible sólo para ADMINISTRADOR o rol con permiso PACIENTES_REGISTRAR -->
        <button
          *ngIf="canRegister"
          class="btn btn-primary"
          (click)="openRegisterModal()"
        >
          <i class="fa-solid fa-user-plus"></i> Registrar Paciente
        </button>
      </div>

      <!-- Card de Filtros Dinámicos -->
      <div class="glass-card filters-card">
        <div class="filter-grid">
          <div class="form-group">
            <label class="form-label">Nombre</label>
            <input
              type="text"
              class="form-control"
              [(ngModel)]="filter.nombre"
              (keyup.enter)="applyFilters()"
              placeholder="Buscar por nombre..."
            />
          </div>

          <div class="form-group">
            <label class="form-label">Apellido</label>
            <input
              type="text"
              class="form-control"
              [(ngModel)]="filter.apellido"
              (keyup.enter)="applyFilters()"
              placeholder="Buscar por apellido..."
            />
          </div>

          <div class="form-group">
            <label class="form-label">DPI</label>
            <input
              type="text"
              class="form-control"
              [(ngModel)]="filter.dpi"
              (keyup.enter)="applyFilters()"
              placeholder="13 dígitos..."
            />
          </div>

          <div class="form-group">
            <label class="form-label">Estado</label>
            <select class="form-select" [(ngModel)]="filter.activo" (change)="applyFilters()">
              <option [value]="''">-- Todos --</option>
              <option [value]="'true'">Activo</option>
              <option [value]="'false'">Inactivo</option>
            </select>
          </div>

          <div class="form-group filter-actions">
            <button class="btn btn-primary" (click)="applyFilters()">
              <i class="fa-solid fa-magnifying-glass"></i> Filtrar
            </button>
            <button class="btn btn-secondary" (click)="resetFilters()">
              <i class="fa-solid fa-rotate-right"></i> Limpiar
            </button>
          </div>
        </div>
      </div>

      <!-- Tabla de Resultados con Paginación -->
      <div class="glass-card table-card">
        <div *ngIf="loading" class="loading-spinner">
          <i class="fa-solid fa-spinner fa-spin fa-2x text-primary"></i>
          <p>Cargando registros desde el backend Spring Boot...</p>
        </div>

        <div *ngIf="!loading && pacientes.length === 0" class="empty-state">
          <i class="fa-solid fa-folder-open text-muted fa-3x"></i>
          <p>No se encontraron pacientes con los criterios especificados.</p>
        </div>

        <div class="table-responsive" *ngIf="!loading && pacientes.length > 0">
          <table class="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre Completo</th>
                <th>DPI</th>
                <th>Teléfono</th>
                <th>Correo</th>
                <th>Edad</th>
                <th>Estado</th>
                <th>Fecha Registro</th>
                <th *ngIf="isAdmin">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of pacientes">
                <td><strong>#{{ p.id }}</strong></td>
                <td>{{ p.nombre }} {{ p.apellido }}</td>
                <td><code>{{ p.dpi }}</code></td>
                <td>{{ p.telefono || 'N/A' }}</td>
                <td>{{ p.correo || 'N/A' }}</td>
                <td>{{ p.edad ? p.edad + ' años' : 'N/A' }}</td>
                <td>
                  <span class="badge" [ngClass]="p.activo ? 'badge-success' : 'badge-danger'">
                    {{ p.activo ? 'ACTIVO' : 'INACTIVO' }}
                  </span>
                </td>
                <td>{{ p.fechaCreacion | date:'dd/MM/yyyy HH:mm' }}</td>
                <td *ngIf="isAdmin">
                  <button class="btn btn-danger btn-sm" (click)="deletePaciente(p)" title="Eliminar Paciente">
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Barra de Paginación Dinámica (Requerimiento: Selector 50, 100, 200) -->
        <div class="pagination-bar" *ngIf="metadata">
          <div class="pagination-info">
            Mostrando página <strong>{{ metadata.page + 1 }}</strong> de <strong>{{ metadata.totalPages || 1 }}</strong>
            • Total de registros: <strong>{{ metadata.totalRecords }}</strong>
          </div>

          <div class="pagination-controls">
            <!-- Selector de tamaño de página: 50, 100, 200 -->
            <div class="page-size-selector">
              <label>Registros por página:</label>
              <select class="form-select form-select-sm" [(ngModel)]="filter.size" (change)="onPageSizeChange()">
                <option [ngValue]="10">10</option>
                <option [ngValue]="50">50</option>
                <option [ngValue]="100">100</option>
                <option [ngValue]="200">200 (Máx)</option>
              </select>
            </div>

            <!-- Botones de Navegación -->
            <button
              class="btn btn-secondary btn-sm"
              [disabled]="!metadata.hasPreviousPage"
              (click)="goToPage(metadata.page - 1)"
            >
              <i class="fa-solid fa-chevron-left"></i> Anterior
            </button>

            <span class="current-page-badge">{{ metadata.page + 1 }}</span>

            <button
              class="btn btn-secondary btn-sm"
              [disabled]="!metadata.hasNextPage"
              (click)="goToPage(metadata.page + 1)"
            >
              Siguiente <i class="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Modal de Registro de Paciente -->
      <div class="modal-backdrop" *ngIf="showRegisterModal">
        <div class="glass-card modal-card fade-in">
          <div class="modal-header">
            <h3><i class="fa-solid fa-user-plus text-primary"></i> Registrar Nuevo Paciente</h3>
            <button class="close-btn" (click)="closeRegisterModal()">&times;</button>
          </div>

          <form (ngSubmit)="savePaciente()">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Nombre *</label>
                <input type="text" class="form-control" [(ngModel)]="newPaciente.nombre" name="nombre" required />
              </div>
              <div class="form-group">
                <label class="form-label">Apellido *</label>
                <input type="text" class="form-control" [(ngModel)]="newPaciente.apellido" name="apellido" required />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">DPI (13 dígitos) *</label>
                <input type="text" class="form-control" [(ngModel)]="newPaciente.dpi" name="dpi" required maxlength="13" />
              </div>
              <div class="form-group">
                <label class="form-label">Teléfono (8 dígitos) *</label>
                <input type="text" class="form-control" [(ngModel)]="newPaciente.telefono" name="telefono" required maxlength="8" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Correo Electrónico *</label>
                <input type="email" class="form-control" [(ngModel)]="newPaciente.correo" name="correo" required />
              </div>
              <div class="form-group">
                <label class="form-label">Fecha de Nacimiento *</label>
                <input type="date" class="form-control" [(ngModel)]="newPaciente.fechaNacimiento" name="fechaNacimiento" required />
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeRegisterModal()">Cancelar</button>
              <button type="submit" class="btn btn-primary" [disabled]="saving">
                <i class="fa-solid fa-floppy-disk" *ngIf="!saving"></i>
                <span *ngIf="saving"><i class="fa-solid fa-spinner fa-spin"></i> Guardando...</span>
                <span *ngIf="!saving">Guardar Paciente</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .pacientes-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .filters-card {
      padding: 1.25rem;
    }
    .filter-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1rem;
      align-items: end;
    }
    .filter-actions {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.25rem;
    }
    .table-card {
      padding: 0;
      overflow: hidden;
    }
    .loading-spinner, .empty-state {
      padding: 3rem;
      text-align: center;
      color: var(--text-muted);
    }
    .pagination-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.5rem;
      background: rgba(15, 23, 42, 0.6);
      border-top: 1px solid var(--border-color);
      flex-wrap: wrap;
      gap: 1rem;
    }
    .pagination-info {
      font-size: 0.85rem;
      color: var(--text-muted);
    }
    .pagination-controls {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .page-size-selector {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: var(--text-muted);
    }
    .page-size-selector select {
      width: auto;
      padding: 0.3rem 0.6rem;
    }
    .current-page-badge {
      background: var(--primary);
      color: #fff;
      font-weight: 700;
      padding: 0.3rem 0.75rem;
      border-radius: 6px;
      font-size: 0.85rem;
    }
    /* Modal Styles */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }
    .modal-card {
      width: 100%;
      max-width: 600px;
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 0.75rem;
    }
    .close-btn {
      background: none;
      border: none;
      color: var(--text-muted);
      font-size: 1.8rem;
      cursor: pointer;
    }
    .close-btn:hover { color: #fff; }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border-color);
    }
  `]
})
export class PacientesComponent implements OnInit {
  pacientes: Paciente[] = [];
  metadata: PaginationMetadata | null = null;
  loading = false;
  saving = false;
  showRegisterModal = false;

  filter: PacienteFilter = {
    nombre: '',
    apellido: '',
    dpi: '',
    activo: '',
    page: 0,
    size: 50 // Tamaño por defecto (Requerimiento: opciones 50, 100, 200)
  };

  newPaciente: Paciente = {
    nombre: '',
    apellido: '',
    dpi: '',
    telefono: '',
    correo: '',
    fechaNacimiento: '',
    activo: true
  };

  constructor(
    private pacienteService: PacienteService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadPacientes();
  }

  get isAdmin(): boolean {
    return this.authService.hasRole('ADMINISTRADOR');
  }

  /**
   * Control de Menú / Funciones por Rol:
   * Muestra botón Registrar sólo si tiene rol ADMINISTRADOR o permiso PACIENTES_REGISTRAR.
   * Sin harcodear usernames.
   */
  get canRegister(): boolean {
    return this.authService.hasRole('ADMINISTRADOR') || this.authService.hasPermission('PACIENTES_REGISTRAR');
  }

  loadPacientes(): void {
    this.loading = true;
    this.pacienteService.getPacientesPaginado(this.filter).subscribe({
      next: (res) => {
        this.pacientes = res.data || [];
        this.metadata = res.metadata || null;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        alert('Error al cargar pacientes desde el backend: ' + (err.error?.message || err.message));
      }
    });
  }

  applyFilters(): void {
    this.filter.page = 0; // Reinicia a la primera página
    this.loadPacientes();
  }

  resetFilters(): void {
    this.filter = {
      nombre: '',
      apellido: '',
      dpi: '',
      activo: '',
      page: 0,
      size: this.filter.size || 50
    };
    this.loadPacientes();
  }

  goToPage(page: number): void {
    if (page < 0 || (this.metadata && page >= this.metadata.totalPages)) return;
    this.filter.page = page;
    this.loadPacientes();
  }

  onPageSizeChange(): void {
    this.filter.page = 0;
    this.loadPacientes();
  }

  openRegisterModal(): void {
    this.newPaciente = {
      nombre: '',
      apellido: '',
      dpi: '',
      telefono: '',
      correo: '',
      fechaNacimiento: '',
      activo: true
    };
    this.showRegisterModal = true;
  }

  closeRegisterModal(): void {
    this.showRegisterModal = false;
  }

  savePaciente(): void {
    if (!this.newPaciente.nombre || !this.newPaciente.apellido || !this.newPaciente.dpi) {
      alert('Por favor completa todos los campos requeridos (*)');
      return;
    }

    this.saving = true;
    this.pacienteService.registrarPaciente(this.newPaciente).subscribe({
      next: () => {
        this.saving = false;
        this.closeRegisterModal();
        alert('¡Paciente registrado con éxito!');
        this.loadPacientes();
      },
      error: (err) => {
        this.saving = false;
        alert('Error al guardar el paciente: ' + (err.error?.message || err.message));
      }
    });
  }

  deletePaciente(p: Paciente): void {
    if (!confirm(`¿Estás seguro de eliminar el paciente ${p.nombre} ${p.apellido}?`)) return;

    this.pacienteService.eliminarPaciente(p.id!).subscribe({
      next: () => {
        alert('Paciente eliminado correctamente.');
        this.loadPacientes();
      },
      error: (err) => {
        alert('Error al eliminar paciente: ' + (err.error?.message || err.message));
      }
    });
  }
}
