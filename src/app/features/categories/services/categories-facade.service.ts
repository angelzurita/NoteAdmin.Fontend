import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, tap, finalize, catchError, EMPTY } from 'rxjs';

import { Category, CreateCategoryDto, UpdateCategoryDto } from '../../../shared/models';
import { CategoriesService } from './categories.service';

@Injectable({ providedIn: 'root' })
export class CategoriesFacade {
  private readonly service = inject(CategoriesService);

  private readonly _categories = signal<Category[]>([]);
  private readonly _selectedCategory = signal<Category | null>(null);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly categories = this._categories.asReadonly();
  readonly selectedCategory = this._selectedCategory.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly count = computed(() => this._categories().length);

  loadAll(): void {
    this._loading.set(true);
    this._error.set(null);

    this.service
      .getAll()
      .pipe(
        tap((cats) => this._categories.set(cats)),
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
    this._selectedCategory.set(null);

    this.service
      .getById(id)
      .pipe(
        tap((cat) => this._selectedCategory.set(cat)),
        catchError((err) => {
          this._error.set(this.extractMessage(err));
          return EMPTY;
        }),
        finalize(() => this._loading.set(false)),
      )
      .subscribe();
  }

  create(dto: CreateCategoryDto): Observable<Category> {
    this._loading.set(true);
    this._error.set(null);

    return this.service.create(dto).pipe(
      tap((cat) => this._categories.update((list) => [cat, ...list])),
      catchError((err) => {
        this._error.set(this.extractMessage(err));
        return EMPTY;
      }),
      finalize(() => this._loading.set(false)),
    );
  }

  update(id: string, dto: UpdateCategoryDto): Observable<Category> {
    this._loading.set(true);
    this._error.set(null);

    return this.service.update(id, dto).pipe(
      tap((updated) => {
        this._categories.update((list) => list.map((c) => (c.id === id ? updated : c)));
        this._selectedCategory.set(updated);
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

    return this.service.delete(id).pipe(
      tap(() => {
        this._categories.update((list) => list.filter((c) => c.id !== id));
        if (this._selectedCategory()?.id === id) {
          this._selectedCategory.set(null);
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
    this._selectedCategory.set(null);
  }

  clearError(): void {
    this._error.set(null);
  }

  private extractMessage(err: unknown): string {
    if (err instanceof Error) return err.message;
    if (typeof err === 'string') return err;
    return 'Ha ocurrido un error inesperado';
  }
}
