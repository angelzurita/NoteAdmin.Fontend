import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NotesFacade } from '../../services/notes-facade.service';
import { CategoriesFacade } from '../../../categories/services/categories-facade.service';
import { LoadingComponent, ErrorComponent } from '../../../../shared/components';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-notes-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe, FormsModule, LoadingComponent, ErrorComponent],
  templateUrl: './notes-list.html',
  styleUrl: './notes-list.css',
})
export class NotesListComponent implements OnInit {
  private readonly facade = inject(NotesFacade);
  private readonly categoriesFacade = inject(CategoriesFacade);

  readonly notes = this.facade.notes;
  readonly loading = this.facade.loading;
  readonly error = this.facade.error;
  readonly categories = this.categoriesFacade.categories;

  /** Filtros – panel A */
  readonly searchTerm = signal('');
  readonly selectedCategoryId = signal('');

  /** Filtros – panel B */
  readonly searchTerm2 = signal('');
  readonly selectedCategoryId2 = signal('');

  /** Notas filtradas – panel A */
  readonly filteredNotes = computed(() => {
    let result = this.notes();
    const term = this.searchTerm().toLowerCase().trim();
    const catId = this.selectedCategoryId();

    if (catId) {
      result = result.filter((n) => n.categoryId === catId);
    }

    if (term) {
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(term) ||
          this.stripHtml(n.content).toLowerCase().includes(term),
      );
    }

    return result;
  });

  /** Notas filtradas – panel B */
  readonly filteredNotes2 = computed(() => {
    let result = this.notes();
    const term = this.searchTerm2().toLowerCase().trim();
    const catId = this.selectedCategoryId2();

    if (catId) {
      result = result.filter((n) => n.categoryId === catId);
    }

    if (term) {
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(term) ||
          this.stripHtml(n.content).toLowerCase().includes(term),
      );
    }

    return result;
  });

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.facade.loadAll();
    this.categoriesFacade.loadAll();
  }

  onSearch(value: string): void {
    this.searchTerm.set(value);
  }

  onCategoryFilter(value: string): void {
    this.selectedCategoryId.set(value);
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedCategoryId.set('');
  }

  onSearch2(value: string): void {
    this.searchTerm2.set(value);
  }

  onCategoryFilter2(value: string): void {
    this.selectedCategoryId2.set(value);
  }

  clearFilters2(): void {
    this.searchTerm2.set('');
    this.selectedCategoryId2.set('');
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
  }

  deleteNote(id: string): void {
    if (confirm('¿Estás seguro de eliminar esta nota?')) {
      this.facade.delete(id).subscribe();
    }
  }

  copyText(content: string): void {

    let text = this.getFormattedContent(content);

    navigator.clipboard.writeText(text as string).then(() => {
      alert("Texto copiado al portapapeles");
    }
    ).catch(err => {
      alert("Error al copiar el texto: " + err);
    });
  }

  getFormattedContent(content: string): string {
    const cleaned = content
      // 1. Párrafos → saltos de línea (ANTES de strip general)
      .replace(/<\/p>\s*<p[^>]*>/gi, '\n')   // </p><p> seguidos → un salto
      .replace(/<p[^>]*>/gi, '')              // apertura <p> → nada (ya manejada arriba o inicio)
      .replace(/<\/p>/gi, '\n')               // cierre </p> restante → salto
      // 2. <br> y <br/> → salto de línea
      .replace(/<br\s*\/?>/gi, '\n')
      // 3. Resto de etiquetas HTML
      .replace(/<[^>]+>/g, '')
      // 4. Entidades HTML
      .replace(/&nbsp;/g, ' ')
      .replace(/\u00A0/g, ' ')
      .replace(/&quot;/g, '"')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      // 5. Espacios múltiples en la misma línea (no tocar \n)
      .replace(/[^\S\n]+/g, ' ')
      // 6. Espacios al inicio/fin de cada línea
      .replace(/^ +| +$/gm, '')
      // 7. Más de 2 saltos de línea consecutivos → máximo 2
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    return cleaned;
  }

  retry(): void {
    this.facade.loadAll();
  }
}
