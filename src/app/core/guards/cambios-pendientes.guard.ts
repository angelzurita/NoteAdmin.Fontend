import { inject } from '@angular/core';
import type { CanDeactivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export interface EdicionConCambios { form: { dirty: boolean }; }

export function confirmarSalida(dirty: boolean, authenticated: boolean, confirmar: (mensaje: string) => boolean): boolean {
  return !dirty || !authenticated || confirmar('Tienes cambios sin guardar. ¿Salir y descartarlos?');
}

// El router revierte Atrás/Adelante al cancelar; nunca guarda ni repite un POST.
export const cambiosPendientesGuard: CanDeactivateFn<EdicionConCambios> = component =>
  confirmarSalida(component.form.dirty, inject(AuthService).isAuthenticated(), mensaje => window.confirm(mensaje));
