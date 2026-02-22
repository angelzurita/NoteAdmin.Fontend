import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  ElementRef,
  ViewChild,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';

import { FilesService } from '../../services/files.service';
import { StoredFile, StorageFolder, FolderContents } from '../../models/stored-file.model';

interface BreadcrumbItem {
  id: string | null;
  name: string;
}

interface FlatFolderNode {
  folder: StorageFolder;
  depth: number;
  hasChildren: boolean;
  isExpanded: boolean;
}

@Component({
  selector: 'app-files-manager',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, DatePipe],
  templateUrl: './files-manager.html',
  styleUrl: './files-manager.css',
})
export class FilesManagerComponent implements OnInit {
  private readonly filesService = inject(FilesService);

  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  // ─── Estado ────────────────────────────────────────────────────────────────
  readonly loading = signal(false);
  readonly error = signal('');
  readonly uploadError = signal('');

  readonly treeRoots = signal<StorageFolder[]>([]);
  readonly folderContents = signal<FolderContents | null>(null);

  readonly activeFolderId = signal<string | null>(null);
  readonly breadcrumbs = signal<BreadcrumbItem[]>([]);
  readonly expandedIds = signal(new Set<string>());
  readonly searchTerm = signal('');

  readonly previewFile = signal<StoredFile | null>(null);
  readonly previewLoading = signal(false);

  readonly movingFile = signal<StoredFile | null>(null);
  readonly moveTargetFolderId = signal<string | null>(null);

  readonly newFolderName = signal('');
  readonly showNewFolderInput = signal(false);

  readonly renamingFolderId = signal<string | null>(null);
  readonly renamingName = signal('');

  // ─── Computed ──────────────────────────────────────────────────────────────

  /** Árbol plano para el sidebar con profundidad e info de expand */
  readonly flatTree = computed<FlatFolderNode[]>(() => {
    const expanded = this.expandedIds();
    const build = (nodes: StorageFolder[], depth: number): FlatFolderNode[] =>
      nodes.flatMap((f) => {
        const hasChildren = !!(f.subFolders?.length);
        const isExpanded = expanded.has(f.id);
        const node: FlatFolderNode = { folder: f, depth, hasChildren, isExpanded };
        return isExpanded && f.subFolders?.length
          ? [node, ...build(f.subFolders, depth + 1)]
          : [node];
      });
    return build(this.treeRoots(), 0);
  });

  readonly subFolders = computed(() => this.folderContents()?.subFolders ?? []);

  readonly visibleFiles = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const docs = this.folderContents()?.documents ?? [];
    return term ? docs.filter((f) => f.fileName.toLowerCase().includes(term)) : docs;
  });

  /** Lista plana de todas las carpetas del árbol (para selector de mover) */
  readonly allFolderNodes = computed<Array<{ id: string; label: string }>>(() => {
    const flatten = (
      nodes: StorageFolder[],
      prefix = '',
    ): Array<{ id: string; label: string }> =>
      nodes.flatMap((f) => {
        const label = prefix ? `${prefix} / ${f.name}` : f.name;
        return [{ id: f.id, label }, ...flatten(f.subFolders ?? [], label)];
      });
    return flatten(this.treeRoots());
  });

  // ─── Ciclo de vida ─────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.loadView(null);
  }

  private loadView(folderId: string | null): void {
    this.loading.set(true);
    this.error.set('');
    forkJoin({
      tree: this.filesService.getFolderTree(),
      contents: this.filesService.getFolderContents(folderId),
    }).subscribe({
      next: ({ tree, contents }) => {
        this.treeRoots.set(tree);
        this.folderContents.set(contents);
        this.activeFolderId.set(folderId);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Error al cargar archivos');
        this.loading.set(false);
      },
    });
  }

  loadAll(): void {
    this.loadView(this.activeFolderId());
  }

  // ─── Navegación ───────────────────────────────────────────────────────────

  navigateToFolder(folder: StorageFolder): void {
    this.breadcrumbs.update((prev) => [...prev, { id: folder.id, name: folder.name }]);
    this.expandedIds.update((set) => new Set([...set, folder.id]));
    this.loadView(folder.id);
  }

  navigateToCrumb(index: number): void {
    const crumb = this.breadcrumbs()[index];
    this.breadcrumbs.update((prev) => prev.slice(0, index + 1));
    this.loadView(crumb.id);
  }

  navigateToRoot(): void {
    this.breadcrumbs.set([]);
    this.loadView(null);
  }

  navigateToSidebarFolder(folder: StorageFolder): void {
    const path = this.findPath(this.treeRoots(), folder.id);
    if (path) {
      this.breadcrumbs.set(path.map((f) => ({ id: f.id, name: f.name })));
      this.expandedIds.update((set) => {
        const next = new Set(set);
        path.forEach((f) => next.add(f.id));
        return next;
      });
    }
    this.loadView(folder.id);
  }

  private findPath(nodes: StorageFolder[], targetId: string): StorageFolder[] | null {
    for (const node of nodes) {
      if (node.id === targetId) return [node];
      const child = this.findPath(node.subFolders ?? [], targetId);
      if (child) return [node, ...child];
    }
    return null;
  }

  // ─── Subida de archivos ───────────────────────────────────────────────────

  triggerUpload(): void {
    this.fileInputRef.nativeElement.value = '';
    this.fileInputRef.nativeElement.click();
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.uploadError.set('');

    Array.from(input.files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        this.filesService
          .uploadBase64({
            fileName: file.name,
            contentType: file.type || 'application/octet-stream',
            fileDataBase64: base64,
            fileSizeBytes: file.size,
            folderId: this.activeFolderId(),
          })
          .subscribe({
            next: (stored) =>
              this.folderContents.update((prev) =>
                prev ? { ...prev, documents: [...prev.documents, stored] } : prev,
              ),
            error: (err) =>
              this.uploadError.set(err?.error?.message ?? `Error al subir "${file.name}"`),
          });
      };
      reader.onerror = () => this.uploadError.set('Error al leer el archivo: ' + file.name);
      reader.readAsDataURL(file);
    });
  }

  // ─── Carpetas ─────────────────────────────────────────────────────────────

  createFolder(): void {
    const name = this.newFolderName().trim();
    if (!name) return;

    this.filesService
      .createFolder({ name, parentFolderId: this.activeFolderId() })
      .subscribe({
        next: () => {
          this.newFolderName.set('');
          this.showNewFolderInput.set(false);
          this.loadView(this.activeFolderId());
        },
        error: (err) => this.error.set(err?.error?.message ?? 'Error al crear carpeta'),
      });
  }

  startRename(folder: StorageFolder): void {
    this.renamingFolderId.set(folder.id);
    this.renamingName.set(folder.name);
  }

  cancelRename(): void {
    this.renamingFolderId.set(null);
    this.renamingName.set('');
  }

  confirmRename(folder: StorageFolder): void {
    const name = this.renamingName().trim();
    if (!name || name === folder.name) {
      this.cancelRename();
      return;
    }
    this.filesService.renameFolder(folder.id, { name }).subscribe({
      next: () => {
        this.cancelRename();
        this.loadView(this.activeFolderId());
      },
      error: (err) => this.error.set(err?.error?.message ?? 'Error al renombrar carpeta'),
    });
  }

  toggleFolder(id: string): void {
    this.expandedIds.update((set) => {
      const next = new Set(set);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  deleteFolder(folder: StorageFolder): void {
    if (!confirm(`¿Eliminar la carpeta "${folder.name}" y todos sus archivos?`)) return;
    this.filesService.deleteFolder(folder.id).subscribe({
      next: () => {
        if (this.activeFolderId() === folder.id) {
          const bc = this.breadcrumbs();
          const parentId = bc.length > 1 ? bc[bc.length - 2].id : null;
          this.breadcrumbs.update((prev) => prev.slice(0, -1));
          this.loadView(parentId);
        } else {
          this.loadView(this.activeFolderId());
        }
      },
      error: (err) => this.error.set(err?.error?.message ?? 'Error al eliminar carpeta'),
    });
  }

  // ─── Archivos ─────────────────────────────────────────────────────────────

  deleteFile(file: StoredFile): void {
    if (!confirm(`¿Eliminar "${file.fileName}"?`)) return;
    this.filesService.delete(file.id).subscribe({
      next: () =>
        this.folderContents.update((prev) =>
          prev ? { ...prev, documents: prev.documents.filter((d) => d.id !== file.id) } : prev,
        ),
      error: (err) => this.error.set(err?.error?.message ?? 'Error al eliminar'),
    });
  }

  // ─── Mover archivos ───────────────────────────────────────────────────────

  openMoveDialog(file: StoredFile): void {
    this.movingFile.set(file);
    this.moveTargetFolderId.set(this.activeFolderId());
  }

  confirmMove(): void {
    const file = this.movingFile();
    if (!file) return;
    this.filesService.move(file.id, { folderId: this.moveTargetFolderId() }).subscribe({
      next: () => {
        this.folderContents.update((prev) =>
          prev ? { ...prev, documents: prev.documents.filter((d) => d.id !== file.id) } : prev,
        );
        this.movingFile.set(null);
      },
      error: (err) => this.error.set(err?.error?.message ?? 'Error al mover archivo'),
    });
  }

  cancelMove(): void {
    this.movingFile.set(null);
  }

  // ─── Vista previa ─────────────────────────────────────────────────────────

  openPreview(file: StoredFile): void {
    if (file.fileDataBase64) {
      this.previewFile.set(file);
      return;
    }
    this.previewLoading.set(true);
    this.previewFile.set({ ...file });
    this.filesService.getById(file.id).subscribe({
      next: (full) => {
        this.previewFile.set(full);
        this.previewLoading.set(false);
      },
      error: () => this.previewLoading.set(false),
    });
  }

  closePreview(): void {
    this.previewFile.set(null);
    this.previewLoading.set(false);
  }

  // ─── Descarga ─────────────────────────────────────────────────────────────

  downloadFile(file: StoredFile): void {
    this.filesService.download(file.id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.fileName;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: (err) => this.error.set(err?.error?.message ?? 'Error al descargar'),
    });
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  dataUrl(file: StoredFile): string {
    return `data:${file.contentType};base64,${file.fileDataBase64 ?? ''}`;
  }

  isImage(file: StoredFile): boolean {
    return file.contentType.startsWith('image/');
  }

  isPdf(file: StoredFile): boolean {
    return file.contentType === 'application/pdf';
  }

  formatSize(bytes: number): string {
    if (bytes === 0) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  fileIcon(file: StoredFile): string {
    if (this.isImage(file)) return '🖼️';
    if (this.isPdf(file)) return '📄';
    if (file.contentType.includes('word') || file.fileName.endsWith('.docx')) return '📝';
    if (file.contentType.includes('excel') || file.fileName.endsWith('.xlsx')) return '📊';
    if (file.contentType.includes('zip') || file.contentType.includes('rar')) return '🗜️';
    if (file.contentType.includes('text')) return '📃';
    return '📁';
  }
}