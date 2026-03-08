import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../../../core/services';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '../../../shared/models';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'categories';

  getAll(): Observable<Category[]> {
    return this.api.get<Category[]>(this.endpoint);
  }

  getById(id: string): Observable<Category> {
    return this.api.get<Category>(`${this.endpoint}/${id}`);
  }

  create(dto: CreateCategoryDto): Observable<Category> {
    return this.api.post<Category>(this.endpoint, dto);
  }

  update(id: string, dto: UpdateCategoryDto): Observable<Category> {
    return this.api.put<Category>(`${this.endpoint}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }
}
