import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { CategoriesFacade } from '../../services/categories-facade.service';

@Component({
  selector: 'app-categories-edit',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  templateUrl: './categories-edit.html',
  styleUrl: './categories-edit.css',
})
export class CategoriesEditComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly facade = inject(CategoriesFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly loading = this.facade.loading;
  readonly category = this.facade.selectedCategory;

  readonly form = this.fb.nonNullable.group({
    id: [''],
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(500)]],
  });

  private categoryId = '';

  ngOnInit(): void {
    this.categoryId = this.route.snapshot.paramMap.get('id') ?? '';
    this.form.patchValue({ id: this.categoryId });
    this.facade.loadOne(this.categoryId);

    const check = setInterval(() => {
      const cat = this.category();
      if (cat) {
        this.form.patchValue({
          id: this.categoryId,
          name: cat.name,
          description: cat.description ?? '',
        });
        clearInterval(check);
      }
      if (this.facade.error()) {
        clearInterval(check);
      }
    }, 100);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

const formValue = this.form.getRawValue();

this.facade.update(this.categoryId, formValue).subscribe({
  next: () => this.router.navigate(['/categories']),
});
  }

  cancel(): void {
    this.router.navigate(['/categories']);
  }
}
