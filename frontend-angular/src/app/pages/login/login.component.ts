import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TurnstileComponent } from '../../shared/components/turnstile/turnstile.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, TurnstileComponent],
  template: `
    <div class="login-wrapper">
      <div class="glass-card login-card fade-in">
        <div class="login-header">
          <div class="icon-avatar">
            <i class="fa-solid fa-hospital text-primary"></i>
          </div>
          <h2>Sistema de Gestión Hospitalaria</h2>
          <p class="subtitle">Acceso seguro con token JWT firmado con RSA</p>
        </div>

        <div *ngIf="error" class="alert alert-danger">
          <i class="fa-solid fa-triangle-exclamation"></i> {{ error }}
        </div>

        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label class="form-label"><i class="fa-solid fa-user"></i> Usuario</label>
            <input
              type="text"
              class="form-control"
              [(ngModel)]="username"
              name="username"
              placeholder="Ingresa tu usuario (ej. admin, operador)"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label"><i class="fa-solid fa-lock"></i> Contraseña</label>
            <input
              type="password"
              class="form-control"
              [(ngModel)]="password"
              name="password"
              placeholder="Ingresa tu contraseña (ej. admin1)"
              required
            />
          </div>

          <!-- CAPTCHA: Cloudflare Turnstile (el token se valida en el backend) -->
          <app-turnstile (tokenChange)="onTurnstileToken($event)"></app-turnstile>

          <button type="submit" class="btn btn-primary btn-block" [disabled]="!canSubmit">
            <i class="fa-solid fa-right-to-bracket" *ngIf="!loading"></i>
            <span *ngIf="loading"><i class="fa-solid fa-spinner fa-spin"></i> Autenticando...</span>
            <span *ngIf="!loading">Iniciar Sesión</span>
          </button>
          <p class="captcha-hint" *ngIf="!turnstileToken">
            <i class="fa-solid fa-shield-halved"></i> Completa la verificación de seguridad para continuar.
          </p>
        </form>

        <div class="demo-credentials">
          <p class="demo-title">Credenciales Predeterminadas:</p>
          <div class="btn-group">
            <button class="btn btn-secondary btn-sm" (click)="setCredentials('admin', 'admin1')">
              <i class="fa-solid fa-user-shield"></i> Cargar Admin
            </button>
            <button class="btn btn-secondary btn-sm" (click)="setCredentials('operador', 'admin1')">
              <i class="fa-solid fa-user-gear"></i> Cargar Operador
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 90vh;
      padding: 1.5rem;
    }
    .login-card {
      width: 100%;
      max-width: 440px;
    }
    .login-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    .icon-avatar {
      width: 64px;
      height: 64px;
      margin: 0 auto 1rem;
      border-radius: 50%;
      background: rgba(2, 132, 199, 0.15);
      border: 1px solid rgba(2, 132, 199, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.8rem;
    }
    .subtitle {
      color: var(--text-muted);
      font-size: 0.85rem;
      margin-top: 0.25rem;
    }
    .btn-block {
      width: 100%;
      padding: 0.8rem;
      margin-top: 1rem;
      font-size: 1rem;
    }
    .alert {
      padding: 0.75rem 1rem;
      border-radius: 8px;
      margin-bottom: 1.25rem;
      font-size: 0.85rem;
    }
    .alert-danger {
      background: rgba(239, 68, 68, 0.2);
      border: 1px solid var(--danger);
      color: #fca5a5;
    }
    .demo-credentials {
      margin-top: 2rem;
      padding-top: 1.25rem;
      border-top: 1px dashed var(--border-color);
      text-align: center;
    }
    .demo-title {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-bottom: 0.6rem;
    }
    .btn-group {
      display: flex;
      gap: 0.5rem;
      justify-content: center;
    }
    .captcha-hint {
      text-align: center;
      font-size: 0.78rem;
      color: var(--text-muted);
      margin-top: 0.5rem;
    }
  `]
})
export class LoginComponent {
  @ViewChild(TurnstileComponent) turnstile?: TurnstileComponent;

  username = '';
  password = '';
  turnstileToken: string | null = null;
  loading = false;
  error = '';

  constructor(private authService: AuthService, private router: Router) {}

  /** El botón solo se habilita con el formulario completo Y el CAPTCHA resuelto. */
  get canSubmit(): boolean {
    return !!this.username.trim() && !!this.password && !!this.turnstileToken && !this.loading;
  }

  onTurnstileToken(token: string | null): void {
    this.turnstileToken = token;
  }

  setCredentials(u: string, p: string): void {
    this.username = u;
    this.password = p;
  }

  onSubmit(): void {
    if (!this.username || !this.password) {
      this.error = 'Por favor completa todos los campos';
      return;
    }
    if (!this.turnstileToken) {
      this.error = 'Completa la verificación de seguridad (CAPTCHA).';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login({
      username: this.username,
      password: this.password,
      turnstileToken: this.turnstileToken
    }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        // El token de Turnstile es de un solo uso: se solicita uno nuevo
        this.turnstile?.reset();
        const serverMsg: string | undefined = err.error?.message;
        switch (err.status) {
          case 400:
            this.error = serverMsg || 'La verificación de seguridad no es válida. Inténtalo de nuevo.';
            break;
          case 401:
            this.error = serverMsg || 'Usuario o contraseña incorrectos.';
            break;
          case 429:
            this.error = serverMsg || 'Demasiados intentos. Espera unos minutos antes de volver a intentar.';
            break;
          case 0:
            this.error = 'No se pudo conectar con el servidor. Verifica tu conexión o inténtalo en unos segundos.';
            break;
          default:
            this.error = 'Ocurrió un error inesperado. Inténtalo más tarde.';
        }
      }
    });
  }
}
