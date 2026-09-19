import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

export interface Cita {
  id?: number;
  codigoCita?: string;
  pacienteNombre: string;
  pacienteDpi: string;
  medicoNombre: string;
  fechaHora: string;
  motivo: string;
  estado?: string;
}

@Component({
  selector: 'app-citas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="citas-container fade-in">
      <div class="page-header glass-card">
        <div>
          <h2><i class="fa-solid fa-calendar-check text-primary"></i> Control y Agendamiento de Citas</h2>
          <p class="subtitle">Módulo accesible para Administrador y Operador para recepción de pacientes</p>
        </div>
        <button class="btn btn-primary" (click)="openModal()">
          <i class="fa-solid fa-calendar-plus"></i> Agendar Nueva Cita
        </button>
      </div>

      <div class="glass-card">
        <div *ngIf="loading" class="text-center p-4">
          <i class="fa-solid fa-spinner fa-spin fa-2x text-primary"></i>
          <p>Cargando lista de citas...</p>
        </div>

        <table class="table" *ngIf="!loading">
          <thead>
            <tr>
              <th>Código Cita</th>
              <th>Paciente</th>
              <th>DPI Paciente</th>
              <th>Médico Asignado</th>
              <th>Fecha y Hora</th>
              <th>Motivo</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of citas">
              <td><strong>{{ c.codigoCita }}</strong></td>
              <td>{{ c.pacienteNombre }}</td>
              <td><code>{{ c.pacienteDpi }}</code></td>
              <td>{{ c.medicoNombre }}</td>
              <td>{{ c.fechaHora | date:'dd/MM/yyyy HH:mm' }}</td>
              <td>{{ c.motivo }}</td>
              <td>
                <span class="badge" [ngClass]="c.estado === 'CONFIRMADA' ? 'badge-info' : 'badge-success'">
                  {{ c.estado || 'CONFIRMADA' }}
                </span>
              </td>
            </tr>
            <tr *ngIf="citas.length === 0">
              <td colspan="7" class="text-center p-4">No hay citas agendadas aún.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal de Agendamiento de Cita -->
      <div class="modal-backdrop" *ngIf="showModal">
        <div class="glass-card modal-card fade-in">
          <div class="modal-header">
            <h3><i class="fa-solid fa-calendar-plus text-primary"></i> Agendar Cita Médica</h3>
            <button class="close-btn" (click)="closeModal()">&times;</button>
          </div>

          <form (ngSubmit)="saveCita()">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Nombre Paciente *</label>
                <input type="text" class="form-control" [(ngModel)]="newCita.pacienteNombre" name="pacienteNombre" required placeholder="ej. Juan Pérez" />
              </div>
              <div class="form-group">
                <label class="form-label">DPI Paciente *</label>
                <input type="text" class="form-control" [(ngModel)]="newCita.pacienteDpi" name="pacienteDpi" required maxlength="13" placeholder="13 dígitos" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Médico Asignado *</label>
                <input type="text" class="form-control" [(ngModel)]="newCita.medicoNombre" name="medicoNombre" required placeholder="ej. Dr. Alejandro Méndez" />
              </div>
              <div class="form-group">
                <label class="form-label">Fecha y Hora *</label>
                <input type="datetime-local" class="form-control" [(ngModel)]="newCita.fechaHora" name="fechaHora" required />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Motivo de Consulta *</label>
              <input type="text" class="form-control" [(ngModel)]="newCita.motivo" name="motivo" required placeholder="ej. Chequeo general, evaluación..." />
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancelar</button>
              <button type="submit" class="btn btn-primary" [disabled]="saving">
                <span *ngIf="!saving"><i class="fa-solid fa-floppy-disk"></i> Confirmar Cita</span>
                <span *ngIf="saving"><i class="fa-solid fa-spinner fa-spin"></i> Agendando...</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .citas-container { display: flex; flex-direction: column; gap: 1.5rem; }
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
export class CitasComponent implements OnInit {
  citas: Cita[] = [];
  loading = false;
  saving = false;
  showModal = false;

  newCita: Cita = {
    pacienteNombre: '',
    pacienteDpi: '',
    medicoNombre: '',
    fechaHora: '',
    motivo: ''
  };

  private readonly API_URL = 'http://localhost:8080/api/v1/citas';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadCitas();
  }

  loadCitas(): void {
    this.loading = true;
    this.http.get<Cita[]>(this.API_URL).subscribe({
      next: (res) => {
        this.citas = res || [];
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        console.error(err);
      }
    });
  }

  openModal(): void {
    this.newCita = {
      pacienteNombre: '',
      pacienteDpi: '',
      medicoNombre: '',
      fechaHora: '',
      motivo: ''
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveCita(): void {
    if (!this.newCita.pacienteNombre || !this.newCita.pacienteDpi || !this.newCita.medicoNombre || !this.newCita.fechaHora) {
      alert('Por favor llena los campos obligatorios (*)');
      return;
    }

    this.saving = true;
    this.http.post<Cita>(this.API_URL, this.newCita).subscribe({
      next: () => {
        this.saving = false;
        this.closeModal();
        alert('¡Cita agendada exitosamente!');
        this.loadCitas();
      },
      error: (err) => {
        this.saving = false;
        alert('Error al agendar cita: ' + (err.error || err.message));
      }
    });
  }
}
