import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';

import { NotesFacade } from '../../services/notes-facade.service';
import { LoadingComponent, ErrorComponent } from '../../../../shared/components';

@Component({
  selector: 'app-notes-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe, LoadingComponent, ErrorComponent],
  templateUrl: './notes-detail.html',
  styleUrl: './notes-detail.css',
})
export class NotesDetailComponent implements OnInit {
  private readonly facade = inject(NotesFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly note = this.facade.selectedNote;
  readonly loading = this.facade.loading;
  readonly error = this.facade.error;

  private noteId = '';

  ngOnInit(): void {
    this.noteId = this.route.snapshot.paramMap.get('id') ?? '';
    this.facade.loadOne(this.noteId);
  }

  deleteNote(): void {
    if (confirm('¿Estás seguro de eliminar esta nota?')) {
      this.facade.delete(this.noteId).subscribe(() => {
        this.router.navigate(['/notes']);
      });
    }
  }

  retry(): void {
    this.facade.loadOne(this.noteId);
  }
}
