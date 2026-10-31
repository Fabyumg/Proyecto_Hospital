import { environment } from '../../../environments/environment';
import { Component, OnDestroy, OnInit } from '@angular/core';
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

export interface BloqueoItem {
  username: string;
  usuarioRegistrado: boolean;
  intentosFallidos: number;
  ultimoIntento: string;
  bloqueadoHasta: string;
  segundosRestantes: number;
}

@Component({
  selector: 'app-administracion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './administracion.component.html',
  styleUrl: './administracion.component.css'
})
export class AdministracionComponent implements OnInit, OnDestroy {
  usuarios: UsuarioItem[] = [];
  bloqueos: BloqueoItem[] = [];
  loading = false;
  loadingBloqueos = false;
  saving = false;
  showUserModal = false;
  unlocking: string | null = null;

  formError = '';
  fieldErrors: Record<string, string> = {};
  notice: { type: 'success' | 'error'; text: string } | null = null;

  newUser = this.emptyUser();

  private readonly API_URL = `${environment.apiUrl}/api/v1/usuarios`;
  private readonly BLOQUEOS_URL = `${environment.apiUrl}/api/v1/seguridad/bloqueos`;
  private countdown?: ReturnType<typeof setInterval>;
  private noticeTimer?: ReturnType<typeof setTimeout>;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadUsuarios();
    this.loadBloqueos();
    // Cuenta regresiva local; los bloqueos que expiran desaparecen solos
    this.countdown = setInterval(() => {
      this.bloqueos = this.bloqueos
        .map(b => ({ ...b, segundosRestantes: b.segundosRestantes - 1 }))
        .filter(b => b.segundosRestantes > 0);
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.countdown) clearInterval(this.countdown);
    if (this.noticeTimer) clearTimeout(this.noticeTimer);
  }

  // ---------- Usuarios ----------
  loadUsuarios(): void {
    this.loading = true;
    this.http.get<UsuarioItem[]>(this.API_URL).subscribe({
      next: (res) => {
        this.usuarios = res || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.showNotice('error', 'No se pudo cargar la lista de usuarios.');
      }
    });
  }

  openUserModal(): void {
    this.newUser = this.emptyUser();
    this.formError = '';
    this.fieldErrors = {};
    this.showUserModal = true;
  }

  closeUserModal(): void {
    this.showUserModal = false;
  }

  saveUsuario(): void {
    this.formError = '';
    this.fieldErrors = {};
    const u = this.newUser;
    if (!u.username || !u.password || !u.nombre || !u.apellido || !u.email || !u.rolNombre) {
      this.formError = 'Completa todos los campos obligatorios (*).';
      return;
    }
    if (u.password.length < 8) {
      this.fieldErrors['password'] = 'La contraseña debe tener al menos 8 caracteres.';
      return;
    }

    this.saving = true;
    this.http.post<UsuarioItem>(this.API_URL, u).subscribe({
      next: (created) => {
        this.saving = false;
        this.closeUserModal();
        this.showNotice('success', `Usuario "${created.username}" creado con rol ${u.rolNombre}.`);
        this.loadUsuarios();
      },
      error: (err) => {
        this.saving = false;
        this.fieldErrors = err.error?.details || {};
        this.formError = err.error?.message || 'No se pudo crear el usuario.';
      }
    });
  }

  // ---------- Bloqueos ----------
  loadBloqueos(): void {
    this.loadingBloqueos = true;
    this.http.get<BloqueoItem[]>(this.BLOQUEOS_URL).subscribe({
      next: (res) => {
        this.bloqueos = res || [];
        this.loadingBloqueos = false;
      },
      error: () => {
        this.loadingBloqueos = false;
        this.showNotice('error', 'No se pudo cargar la lista de cuentas bloqueadas.');
      }
    });
  }

  desbloquear(b: BloqueoItem): void {
    if (!confirm(`¿Desbloquear la cuenta "${b.username}"?`)) return;
    this.unlocking = b.username;
    this.http.delete<{ message: string }>(`${this.BLOQUEOS_URL}/${encodeURIComponent(b.username)}`).subscribe({
      next: (res) => {
        this.unlocking = null;
        this.bloqueos = this.bloqueos.filter(x => x.username !== b.username);
        this.showNotice('success', res?.message || `Cuenta "${b.username}" desbloqueada.`);
      },
      error: (err) => {
        this.unlocking = null;
        this.showNotice('error', err.error?.message || 'No se pudo desbloquear la cuenta.');
        this.loadBloqueos();
      }
    });
  }

  formatRemaining(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  private showNotice(type: 'success' | 'error', text: string): void {
    this.notice = { type, text };
    if (this.noticeTimer) clearTimeout(this.noticeTimer);
    this.noticeTimer = setTimeout(() => (this.notice = null), 5000);
  }

  private emptyUser() {
    return { username: '', password: '', nombre: '', apellido: '', email: '', rolNombre: 'OPERADOR' };
  }
}
