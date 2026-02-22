export interface Note {
  id: string;
  title: string;
  content: string;
  categoryId: string;
  category?: { id: string; name: string };
  createdAt: Date;
}

export interface CreateNoteDto {
  title: string;
  content: string;
  categoryId: string;
}

export interface UpdateNoteDto {
  id: string;
  title?: string;
  content?: string;
  categoryId?: string;
}
