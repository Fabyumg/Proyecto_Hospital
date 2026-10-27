import { AfterViewInit, Component, ElementRef, EventEmitter, NgZone, OnDestroy, Output, ViewChild } from '@angular/core';
import { environment } from '../../../../environments/environment';

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, options: Record<string, unknown>) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

/**
 * Widget de Cloudflare Turnstile (renderizado explícito).
 * Emite el token cuando el usuario supera el desafío y null cuando expira o falla.
 * El token es de un solo uso: tras cada intento de login se debe llamar reset().
 */
@Component({
  selector: 'app-turnstile',
  standalone: true,
  template: `<div #container class="turnstile-box"></div>`,
  styles: [`.turnstile-box { display: flex; justify-content: center; min-height: 65px; margin: 0.75rem 0; }`]
})
export class TurnstileComponent implements AfterViewInit, OnDestroy {
  @ViewChild('container', { static: true }) container!: ElementRef<HTMLDivElement>;
  @Output() tokenChange = new EventEmitter<string | null>();

  private widgetId?: string;
  private pollHandle?: ReturnType<typeof setInterval>;

  constructor(private zone: NgZone) {}

  ngAfterViewInit(): void {
    // El script se carga async en index.html: esperar a que esté disponible
    if (window.turnstile) {
      this.renderWidget();
      return;
    }
    this.pollHandle = setInterval(() => {
      if (window.turnstile) {
        clearInterval(this.pollHandle);
        this.renderWidget();
      }
    }, 200);
  }

  reset(): void {
    this.tokenChange.emit(null);
    if (window.turnstile && this.widgetId !== undefined) {
      window.turnstile.reset(this.widgetId);
    }
  }

  ngOnDestroy(): void {
    if (this.pollHandle) clearInterval(this.pollHandle);
    if (window.turnstile && this.widgetId !== undefined) {
      window.turnstile.remove(this.widgetId);
    }
  }

  private renderWidget(): void {
    this.widgetId = window.turnstile!.render(this.container.nativeElement, {
      sitekey: environment.turnstileSiteKey,
      language: 'es',
      theme: 'auto',
      callback: (token: string) => this.zone.run(() => this.tokenChange.emit(token)),
      'expired-callback': () => this.zone.run(() => this.tokenChange.emit(null)),
      'error-callback': () => this.zone.run(() => this.tokenChange.emit(null))
    });
  }
}
