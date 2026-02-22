import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { ApiService } from '../../../core/services/api.service';
import { ApiResponse } from '../../../core/models/api-response.model';
import { environment } from '../../../../environments/environment';
import {
  StoredFile,
  StorageFolder,
  FolderContents,
  UploadBase64Dto,
  CreateFolderDto,
  RenameFolderDto,
  MoveDocumentDto,
} from '../models/stored-file.model';

@Injectable({ providedIn: 'root' })
export class FilesService {
  private readonly api = inject(ApiService);
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/local-storage`;

  // ─── Documentos ──────────────────────────────────────────────────────────────

  /** GET /api/local-storage — lista de metadatos (sin fileDataBase64) */
  getAll(): Observable<StoredFile[]> {
    return this.api.get<StoredFile[]>('local-storage');
  }

  /** GET /api/local-storage/{id} — incluye fileDataBase64 */
  getById(id: string): Observable<StoredFile> {
    return this.api.get<StoredFile>(`local-storage/${id}`);
  }

  /**
   * POST /api/local-storage/upload — multipart/form-data.
   * description y tags van como query params.
   */
  upload(
    file: File,
    folderId?: string | null,
    description?: string,
    tags?: string,
  ): Observable<StoredFile> {
    const form = new FormData();
    form.append('file', file, file.name);
    if (folderId) form.append('folderId', folderId);
    let params = new HttpParams();
    if (description) params = params.set('description', description);
    if (tags) params = params.set('tags', tags);
    return this.http
      .post<ApiResponse<StoredFile>>(`${this.baseUrl}/upload`, form, { params })
      .pipe(map((res) => res.data));
  }

  /** POST /api/local-storage/upload-base64 */
  uploadBase64(dto: UploadBase64Dto): Observable<StoredFile> {
    return this.api.post<StoredFile>('local-storage/upload-base64', dto);
  }

  /**
   * GET /api/local-storage/{id}/download — Blob binario.
   * HttpClient directo porque la respuesta no es JSON ApiResponse.
   */
  download(id: string): Observable<Blob> {
    const token = localStorage.getItem('auth_token') ?? '';
    return this.http.get(`${this.baseUrl}/${id}/download`, {
      responseType: 'blob',
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
    });
  }

  /**
   * PATCH /api/local-storage/{documentId}/move
   * Mueve el documento a otra carpeta (folderId null = raíz).
   */
  move(documentId: string, dto: MoveDocumentDto): Observable<StoredFile> {
    return this.api.patch<StoredFile>(`local-storage/${documentId}/move`, dto);
  }

  /** DELETE /api/local-storage/{id} */
  delete(id: string): Observable<void> {
    return this.api.delete<void>(`local-storage/${id}`);
  }

  // ─── Carpetas ────────────────────────────────────────────────────────────────

  /**
   * GET /api/local-storage/folders/tree?rootFolderId=
   * Sin parámetro devuelve el árbol desde la raíz absoluta.
   */
  getFolderTree(rootFolderId?: string | null): Observable<StorageFolder[]> {
    const params = rootFolderId ? { rootFolderId } : undefined;
    return this.api.get<StorageFolder[]>(
      'local-storage/folders/tree',
      params ? { params } : undefined,
    );
  }

  /**
   * GET /api/local-storage/folders/contents?folderId=
   * folderId null/undefined = carpeta raíz.
   */
  getFolderContents(folderId?: string | null): Observable<FolderContents> {
    const params = folderId ? { folderId } : undefined;
    return this.api.get<FolderContents>(
      'local-storage/folders/contents',
      params ? { params } : undefined,
    );
  }

  /**
   * POST /api/local-storage/folders
   * Devuelve el ID (string UUID) de la nueva carpeta.
   */
  createFolder(dto: CreateFolderDto): Observable<string> {
    return this.api.post<string>('local-storage/folders', dto);
  }

  /** PUT /api/local-storage/folders/{id}/rename */
  renameFolder(id: string, dto: RenameFolderDto): Observable<void> {
    return this.api.put<void>(`local-storage/folders/${id}/rename`, dto);
  }

  /** DELETE /api/local-storage/folders/{id} */
  deleteFolder(id: string): Observable<void> {
    return this.api.delete<void>(`local-storage/folders/${id}`);
  }
}
