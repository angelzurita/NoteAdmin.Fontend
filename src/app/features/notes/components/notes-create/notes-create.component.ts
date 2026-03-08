import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { QuillModule } from 'ngx-quill';

import { NotesFacade } from '../../services/notes-facade.service';

@Component({
  selector: 'app-notes-create',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, QuillModule],
  templateUrl: './notes-create.html',
  styleUrl: './notes-create.css',
})
export class NotesCreateComponent {
  private readonly fb = inject(FormBuilder);
  private readonly facade = inject(NotesFacade);
  private readonly router = inject(Router);

  readonly loading = this.facade.loading;
  readonly error = this.facade.error;

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

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { title, content } = this.form.getRawValue();
    this.facade.create({ title, content }).subscribe(() => {
      this.router.navigate(['/notes']);
    });
  }

  cancel(): void {
    this.router.navigate(['/notes']);
  }

  hasError(field: 'title' | 'content', error: string): boolean {
    const control = this.form.get(field);
    return !!control?.hasError(error) && (control.dirty || control.touched);
  }
}
