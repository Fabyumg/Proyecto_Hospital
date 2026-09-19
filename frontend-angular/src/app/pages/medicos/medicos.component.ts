import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

export interface Medico {
  id?: number;
  colegiado: string;
  nombre: string;
  apellido: string;
  especialidad: string;
  telefono: string;
  correo: string;
  horario: string;
  disponible?: boolean;
}

@Component({
  selector: 'app-medicos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="medicos-container fade-in">
      <div class="page-header glass-card">
        <div>
          <h2><i class="fa-solid fa-user-doctor text-primary"></i> Gestión de Cuerpo Médico</h2>
          <p class="subtitle">Directorio de especialistas, colegiados y horarios de atención</p>
        </div>
        <button class="btn btn-primary" (click)="openModal()">
          <i class="fa-solid fa-plus"></i> Registrar Nuevo Médico
        </button>
      </div>

      <div class="glass-card">
        <div *ngIf="loading" class="text-center p-4">
          <i class="fa-solid fa-spinner fa-spin fa-2x text-primary"></i>
          <p>Cargando lista de médicos...</p>
        </div>

        <table class="table" *ngIf="!loading">
          <thead>
            <tr>
              <th>Colegiado</th>
              <th>Médico Especialista</th>
              <th>Especialidad</th>
              <th>Teléfono</th>
              <th>Correo</th>
              <th>Horario</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let m of medicos">
              <td><strong>{{ m.colegiado }}</strong></td>
              <td>Dr(a). {{ m.nombre }} {{ m.apellido }}</td>
              <td>{{ m.especialidad }}</td>
              <td>{{ m.telefono || 'N/A' }}</td>
              <td>{{ m.correo || 'N/A' }}</td>
              <td>{{ m.horario || '08:00 - 16:00' }}</td>
              <td>
                <span class="badge" [ngClass]="m.disponible ? 'badge-success' : 'badge-danger'">
                  {{ m.disponible ? 'DISPONIBLE' : 'NO DISPONIBLE' }}
                </span>
              </td>
            </tr>
            <tr *ngIf="medicos.length === 0">
              <td colspan="7" class="text-center p-4">No hay médicos registrados aún.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal de Registro de Médico -->
      <div class="modal-backdrop" *ngIf="showModal">
        <div class="glass-card modal-card fade-in">
          <div class="modal-header">
            <h3><i class="fa-solid fa-user-doctor text-primary"></i> Registrar Nuevo Médico</h3>
            <button class="close-btn" (click)="closeModal()">&times;</button>
          </div>

          <form (ngSubmit)="saveMedico()">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">No. Colegiado *</label>
                <input type="text" class="form-control" [(ngModel)]="newMedico.colegiado" name="colegiado" required placeholder="COL-12345" />
              </div>
              <div class="form-group">
                <label class="form-label">Especialidad *</label>
                <input type="text" class="form-control" [(ngModel)]="newMedico.especialidad" name="especialidad" required placeholder="Cardiología, Pediatría..." />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Nombre *</label>
                <input type="text" class="form-control" [(ngModel)]="newMedico.nombre" name="nombre" required />
              </div>
              <div class="form-group">
                <label class="form-label">Apellido *</label>
                <input type="text" class="form-control" [(ngModel)]="newMedico.apellido" name="apellido" required />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Teléfono *</label>
                <input type="text" class="form-control" [(ngModel)]="newMedico.telefono" name="telefono" required />
              </div>
              <div class="form-group">
                <label class="form-label">Correo *</label>
                <input type="email" class="form-control" [(ngModel)]="newMedico.correo" name="correo" required />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Horario de Atención</label>
              <input type="text" class="form-control" [(ngModel)]="newMedico.horario" name="horario" placeholder="ej. 08:00 - 16:00" />
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancelar</button>
              <button type="submit" class="btn btn-primary" [disabled]="saving">
                <span *ngIf="!saving"><i class="fa-solid fa-floppy-disk"></i> Guardar Médico</span>
                <span *ngIf="saving"><i class="fa-solid fa-spinner fa-spin"></i> Guardando...</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .medicos-container { display: flex; flex-direction: column; gap: 1.5rem; }
    .page-header { display: flex; justify-content: space-between; align-items: center; }
    .subtitle { color: var(--text-muted); font-size: 0.9rem; }
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
export class MedicosComponent implements OnInit {
  medicos: Medico[] = [];
  loading = false;
  saving = false;
  showModal = false;

  newMedico: Medico = {
    colegiado: '',
    nombre: '',
    apellido: '',
    especialidad: '',
    telefono: '',
    correo: '',
    horario: '08:00 - 16:00',
    disponible: true
  };

  private readonly API_URL = 'http://localhost:8080/api/v1/medicos';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadMedicos();
  }

  loadMedicos(): void {
    this.loading = true;
    this.http.get<Medico[]>(this.API_URL).subscribe({
      next: (res) => {
        this.medicos = res || [];
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        console.error(err);
      }
    });
  }

  openModal(): void {
    this.newMedico = {
      colegiado: '',
      nombre: '',
      apellido: '',
      especialidad: '',
      telefono: '',
      correo: '',
      horario: '08:00 - 16:00',
      disponible: true
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveMedico(): void {
    if (!this.newMedico.colegiado || !this.newMedico.nombre || !this.newMedico.especialidad) {
      alert('Por favor llena los campos obligatorios (*)');
      return;
    }

    this.saving = true;
    this.http.post<Medico>(this.API_URL, this.newMedico).subscribe({
      next: () => {
        this.saving = false;
        this.closeModal();
        alert('¡Médico registrado exitosamente!');
        this.loadMedicos();
      },
      error: (err) => {
        this.saving = false;
        alert('Error al guardar médico: ' + (err.error || err.message));
      }
    });
  }
}
