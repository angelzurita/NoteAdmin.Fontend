import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { CategoriesFacade } from '../../services/categories-facade.service';

@Component({
  selector: 'app-categories-create',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  templateUrl: './categories-create.html',
  styleUrl: './categories-create.css',
})
export class CategoriesCreateComponent {
  private readonly fb = inject(FormBuilder);
  private readonly facade = inject(CategoriesFacade);
  private readonly router = inject(Router);

  readonly loading = this.facade.loading;

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(500)]],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.facade.create(this.form.getRawValue()).subscribe({
      next: () => this.router.navigate(['/categories']),
    });
  }

  cancel(): void {
    this.router.navigate(['/categories']);
  }
}
