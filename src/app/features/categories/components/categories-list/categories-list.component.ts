import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';

import { CategoriesFacade } from '../../services/categories-facade.service';
import { LoadingComponent, ErrorComponent } from '../../../../shared/components';

@Component({
  selector: 'app-categories-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe, LoadingComponent, ErrorComponent],
  templateUrl: './categories-list.html',
  styleUrl: './categories-list.css',
})
export class CategoriesListComponent implements OnInit {
  private readonly facade = inject(CategoriesFacade);

  readonly categories = this.facade.categories;
  readonly loading = this.facade.loading;
  readonly error = this.facade.error;

  ngOnInit(): void {
    this.facade.loadAll();
  }

  deleteCategory(id: string): void {
    if (confirm('¿Estás seguro de eliminar esta categoría?')) {
      this.facade.delete(id).subscribe();
    }
  }

  retry(): void {
    this.facade.loadAll();
  }
}
