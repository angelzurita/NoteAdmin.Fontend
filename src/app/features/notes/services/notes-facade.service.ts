import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, tap, finalize, catchError, EMPTY } from 'rxjs';

import { Note, CreateNoteDto, UpdateNoteDto } from '../../../shared/models';
import { NotesService } from './notes.service';

export interface NotesState {
  notes: Note[];
  selectedNote: Note | null;
  loading: boolean;
  error: string | null;
}

/**
 * NotesFacade — orquesta estado y lógica entre componentes y servicio.
 *
 * Los componentes consumen signals de solo lectura;
 * las mutaciones pasan por métodos explícitos que actualizan el estado.
 */
@Injectable({ providedIn: 'root' })
export class NotesFacade {
  private readonly notesService = inject(NotesService);

  // ── Internal state ──
  private readonly _notes = signal<Note[]>([]);
  private readonly _selectedNote = signal<Note | null>(null);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  // ── Public read-only signals ──
  readonly notes = this._notes.asReadonly();
  readonly selectedNote = this._selectedNote.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly notesCount = computed(() => this._notes().length);

  // ── Commands ──

  loadAll(): void {
    this._loading.set(true);
    this._error.set(null);

    this.notesService
      .getAll()
      .pipe(
        tap((notes) => this._notes.set(notes)),
        catchError((err) => {
          this._error.set(this.extractMessage(err));
          return EMPTY;
        }),
        finalize(() => this._loading.set(false)),
      )
      .subscribe();
  }

  loadOne(id: string): void {
    this._loading.set(true);
    this._error.set(null);
    this._selectedNote.set(null);

    this.notesService
      .getById(id)
      .pipe(
        tap((note) => this._selectedNote.set(note)),
        catchError((err) => {
          this._error.set(this.extractMessage(err));
          return EMPTY;
        }),
        finalize(() => this._loading.set(false)),
      )
      .subscribe();
  }

  create(dto: CreateNoteDto): Observable<Note> {
    this._loading.set(true);
    this._error.set(null);

    return this.notesService.create(dto).pipe(
      tap((note) => this._notes.update((list) => [note, ...list])),
      catchError((err) => {
        this._error.set(this.extractMessage(err));
        return EMPTY;
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  update(id: string, dto: UpdateNoteDto): Observable<Note> {
    this._loading.set(true);
    this._error.set(null);

    return this.notesService.update(id, dto).pipe(
      tap((updated) => {
        this._notes.update((list) => list.map((n) => (n.id === id ? updated : n)));
        this._selectedNote.set(updated);
      }),
      catchError((err) => {
        this._error.set(this.extractMessage(err));
        return EMPTY;
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  delete(id: string): Observable<void> {
    this._loading.set(true);
    this._error.set(null);

    return this.notesService.delete(id).pipe(
      tap(() => {
        this._notes.update((list) => list.filter((n) => n.id !== id));
        if (this._selectedNote()?.id === id) {
          this._selectedNote.set(null);
        }
      }),
      catchError((err) => {
        this._error.set(this.extractMessage(err));
        return EMPTY;
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  clearSelection(): void {
    this._selectedNote.set(null);
  }

  clearError(): void {
    this._error.set(null);
  }

  // ── Utilities ──

  private extractMessage(err: unknown): string {
    if (err instanceof Error) return err.message;
    if (typeof err === 'string') return err;
    return 'Ha ocurrido un error inesperado';
  }
}
