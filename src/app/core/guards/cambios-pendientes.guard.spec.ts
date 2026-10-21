import { describe, expect, it } from 'vitest';
import { confirmarSalida } from './cambios-pendientes.guard';

describe('Salida de ediciones', () => {
  it('no pregunta sin cambios ni bloquea una sesión caducada', () => {
    const noPreguntar = () => { throw new Error('No debe preguntar'); };
    expect(confirmarSalida(false, true, noPreguntar)).toBe(true);
    expect(confirmarSalida(true, false, noPreguntar)).toBe(true);
  });
  it('cancelar conserva la pantalla y aceptar permite descartarla', () => {
    expect(confirmarSalida(true, true, () => false)).toBe(false);
    expect(confirmarSalida(true, true, () => true)).toBe(true);
  });
});
