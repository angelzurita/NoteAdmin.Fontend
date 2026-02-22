/** Metadatos del documento (sin Base64 — devuelto por GET /local-storage) */
export interface StoredFile {
  id: string;
  fileName: string;
  folderId?: string | null;
  contentType: string;
  fileSizeBytes: number;
  description?: string;
  tags?: string;
  createdAt: string;
  updatedAt?: string | null;
  createdBy?: string;
  /** Solo presente en GET /{id} */
  fileDataBase64?: string;
}

/** Body para POST /api/local-storage/upload-base64 */
export interface UploadBase64Dto {
  fileName: string;
  contentType: string;
  fileDataBase64: string;
  fileSizeBytes: number;
  description?: string;
  tags?: string;
  folderId?: string | null;
}

/** Nodo de carpeta — respuesta del árbol y contenidos */
export interface StorageFolder {
  id: string;
  name: string;
  parentFolderId?: string | null;
  /** Solo presente en GET /folders/tree */
  subFolders?: StorageFolder[];
}

/** Respuesta de GET /api/local-storage/folders/contents */
export interface FolderContents {
  folderId: string | null;
  folderName: string;
  subFolders: StorageFolder[];
  documents: StoredFile[];
}

/** Body para POST /api/local-storage/folders */
export interface CreateFolderDto {
  name: string;
  parentFolderId?: string | null;
}

/** Body para PUT /api/local-storage/folders/{id}/rename */
export interface RenameFolderDto {
  name: string;
}

/** Body para PATCH /api/local-storage/{documentId}/move */
export interface MoveDocumentDto {
  folderId: string | null;
}
