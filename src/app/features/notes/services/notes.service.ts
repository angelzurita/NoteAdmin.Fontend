import { Injectable, inject } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { map } from 'rxjs/operators';

import { ApiService } from '../../../core/services';
import { Note, CreateNoteDto, UpdateNoteDto } from '../../../shared/models';

/**
 * NotesService — capa de acceso a datos.
 *
 * En producción delegará al ApiService real.
 * Mientras no haya backend, simula respuestas con datos en memoria.
 */
@Injectable({ providedIn: 'root' })
export class NotesService {
  private readonly api = inject(ApiService);

  // ── Mock data (se reemplaza con API real sin tocar facade/components) ──
  private mockNotes: Note[] = [
    {
      id: '1',
      title: 'Bienvenido a NotesAdmin',
      content: '<p>Esta es tu primera nota. Puedes <strong>editarla</strong> o crear nuevas.</p>',
      createdAt: new Date('2026-01-15'),
    },
    {
      id: '2',
      title: 'Arquitectura del proyecto',
      content: '<p>Este proyecto sigue una arquitectura por capas: <em>core</em>, <em>shared</em>, <em>features</em> y <em>layout</em>.</p>',
      createdAt: new Date('2026-02-01'),
    },
    {
      id: '3',
      title: 'Tips de productividad',
      content: '<ul><li>Usa atajos de teclado</li><li>Organiza por prioridad</li><li>Revisa tu dashboard diariamente</li></ul>',
      createdAt: new Date('2026-02-20'),
    },
  ];

  getAll(): Observable<Note[]> {
    // Swap con: return this.api.get<Note[]>('notes');
    return of([...this.mockNotes]).pipe(delay(400));
  }

  getById(id: string): Observable<Note> {
    const note = this.mockNotes.find((n) => n.id === id);
    if (!note) {
      return throwError(() => new Error('Nota no encontrada')).pipe(delay(200));
    }
    return of({ ...note }).pipe(delay(300));
  }

  create(dto: CreateNoteDto): Observable<Note> {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: dto.title,
      content: dto.content,
      createdAt: new Date(),
    };
    this.mockNotes = [newNote, ...this.mockNotes];
    return of(newNote).pipe(delay(300));
  }

  update(id: string, dto: UpdateNoteDto): Observable<Note> {
    const index = this.mockNotes.findIndex((n) => n.id === id);
    if (index === -1) {
      return throwError(() => new Error('Nota no encontrada')).pipe(delay(200));
    }
    const updated: Note = { ...this.mockNotes[index], ...dto };
    this.mockNotes[index] = updated;
    return of({ ...updated }).pipe(delay(300));
  }

  delete(id: string): Observable<void> {
    this.mockNotes = this.mockNotes.filter((n) => n.id !== id);
    return of(undefined).pipe(delay(300));
  }
}
