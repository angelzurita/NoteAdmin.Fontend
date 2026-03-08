import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../../../core/services';
import { Note, CreateNoteDto, UpdateNoteDto } from '../../../shared/models';

/**
 * NotesService — capa de acceso a datos contra la API real.
 * Endpoint base: /notes
 */
@Injectable({ providedIn: 'root' })
export class NotesService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'notes';

  getAll(): Observable<Note[]> {
    return this.api.get<Note[]>(this.endpoint);
  }

  getById(id: string): Observable<Note> {
    return this.api.get<Note>(`${this.endpoint}/${id}`);
  }

  create(dto: CreateNoteDto): Observable<Note> {
    return this.api.post<Note>(this.endpoint, dto);
  }

  update(id: string, dto: UpdateNoteDto): Observable<Note> {
    return this.api.put<Note>(`${this.endpoint}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }
}
