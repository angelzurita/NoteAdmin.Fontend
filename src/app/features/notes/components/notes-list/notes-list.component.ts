import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';

import { NotesFacade } from '../../services/notes-facade.service';
import { LoadingComponent, ErrorComponent } from '../../../../shared/components';

@Component({
  selector: 'app-notes-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe, LoadingComponent, ErrorComponent],
  templateUrl: './notes-list.html',
  styleUrl: './notes-list.css',
})
export class NotesListComponent implements OnInit {
  private readonly facade = inject(NotesFacade);

  readonly notes = this.facade.notes;
  readonly loading = this.facade.loading;
  readonly error = this.facade.error;

  ngOnInit(): void {
    this.facade.loadAll();
  }

  deleteNote(id: string): void {
    if (confirm('¿Estás seguro de eliminar esta nota?')) {
      this.facade.delete(id).subscribe();
    }
  }

  retry(): void {
    this.facade.loadAll();
  }
}
