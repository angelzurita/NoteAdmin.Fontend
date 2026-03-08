import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { QuillModule } from 'ngx-quill';

import { NotesFacade } from '../../services/notes-facade.service';
import { LoadingComponent, ErrorComponent } from '../../../../shared/components';

@Component({
  selector: 'app-notes-edit',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, QuillModule, LoadingComponent, ErrorComponent],
  templateUrl: './notes-edit.html',
  styleUrl: './notes-edit.css',
})
export class NotesEditComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly facade = inject(NotesFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly loading = this.facade.loading;
  readonly error = this.facade.error;
  readonly note = this.facade.selectedNote;

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
    content: ['', [Validators.required]],
  });

  readonly quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ header: 1 }, { header: 2 }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ indent: '-1' }, { indent: '+1' }],
      ['link'],
      ['clean'],
    ],
  };

  private noteId = '';

  ngOnInit(): void {
    this.noteId = this.route.snapshot.paramMap.get('id') ?? '';
    this.facade.loadOne(this.noteId);

    // Patch form when note loads (effect-like approach with setTimeout for signal read)
    const check = setInterval(() => {
      const n = this.note();
      if (n) {
        this.form.patchValue({ title: n.title, content: n.content });
        clearInterval(check);
      }
      if (this.error()) {
        clearInterval(check);
      }
    }, 100);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { title, content } = this.form.getRawValue();
    this.facade.update(this.noteId, { title, content }).subscribe(() => {
      this.router.navigate(['/notes', this.noteId]);
    });
  }

  cancel(): void {
    this.router.navigate(['/notes', this.noteId]);
  }

  hasError(field: 'title' | 'content', error: string): boolean {
    const control = this.form.get(field);
    return !!control?.hasError(error) && (control.dirty || control.touched);
  }
}
