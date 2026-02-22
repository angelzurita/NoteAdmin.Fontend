import { Injectable } from '@angular/core';

/**
 * Servicio para persistir datos en localStorage usando codificación Base64.
 * Todos los valores se serializan a JSON y luego se codifican en Base64
 * antes de guardarse, y se decodifican al leerlos.
 *
 * Soporta caracteres Unicode (emojis, acentos, etc.) mediante TextEncoder/TextDecoder.
 */
@Injectable({ providedIn: 'root' })
export class LocalStorageService {
  // ─── Escritura ────────────────────────────────────────────────────────────

  /**
   * Guarda un valor en localStorage codificado en Base64.
   * @param key  Clave de almacenamiento
   * @param value  Cualquier valor serializable a JSON
   */
  set(key: string, value: unknown): void {
    try {
      const json = JSON.stringify(value);
      const encoded = this.encode(json);
      localStorage.setItem(key, encoded);
    } catch (e) {
      console.error(`[LocalStorageService] Error al guardar "${key}":`, e);
    }
  }

  // ─── Lectura ──────────────────────────────────────────────────────────────

  /**
   * Recupera y decodifica un valor de localStorage.
   * Devuelve `null` si la clave no existe o los datos están corruptos.
   */
  get<T = unknown>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return null;
      const json = this.decode(raw);
      return JSON.parse(json) as T;
    } catch (e) {
      console.error(`[LocalStorageService] Error al leer "${key}":`, e);
      return null;
    }
  }

  /**
   * Recupera el valor decodificado como string plano (sin parsear JSON).
   * Útil para valores que se guardaron directamente como texto.
   */
  getRaw(key: string): string | null {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return null;
      return this.decode(raw);
    } catch (e) {
      console.error(`[LocalStorageService] Error al leer raw "${key}":`, e);
      return null;
    }
  }

  // ─── Utilidades ───────────────────────────────────────────────────────────

  /** Devuelve `true` si la clave existe en localStorage. */
  has(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }

  /** Elimina una entrada de localStorage. */
  remove(key: string): void {
    localStorage.removeItem(key);
  }

  /** Elimina todas las entradas de localStorage. */
  clear(): void {
    localStorage.clear();
  }

  /** Devuelve todas las claves actualmente almacenadas. */
  keys(): string[] {
    return Object.keys(localStorage);
  }

  // ─── Encoder / Decoder ────────────────────────────────────────────────────

  /**
   * Codifica un string a Base64 con soporte Unicode completo.
   * Flujo: string → UTF-8 bytes (TextEncoder) → Base64 (btoa)
   */
  encode(value: string): string {
    const bytes = new TextEncoder().encode(value);
    const binary = Array.from(bytes)
      .map((b) => String.fromCharCode(b))
      .join('');
    return btoa(binary);
  }

  /**
   * Decodifica un string Base64 a texto con soporte Unicode completo.
   * Flujo: Base64 (atob) → bytes → UTF-8 string (TextDecoder)
   */
  decode(base64: string): string {
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }
}
